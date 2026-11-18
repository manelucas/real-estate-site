// Produces evidence of data accuracy:
//   1. Match rate: delinquent-tax certificates matched to a parcel on the state tax roll.
//   2. Independent cross-check: certificate legal description (Tax Collector) vs. parcel legal description (DOR roll).
//   3. Live check: a random sample of parcels compared against the Property Appraiser's website (pbcpao.gov).
//   4. Data-quality flags for manual review.
// Writes docs/ACCURACY.md and docs/spot-check.csv, and stores a summary in the database.
// Usage: npm run verify            (live sample of 20 parcels, ~1.5 s between requests)
//        npm run verify -- --sample 50
//        npm run verify -- --offline
import { writeFileSync, mkdirSync } from 'node:fs';
import { openDb, DB_PATH } from '../src/db.js';
import { links, pidDashed } from './sources.js';

const args = process.argv.slice(2);
const offline = args.includes('--offline');
const sampleSize = Number(args[args.indexOf('--sample') + 1]) || 20;
const db = openDb(DB_PATH);

const norm = (s) => (s ?? '').toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = (s) => new Set(norm(s).split(' ').filter((t) => t.length > 1));

// ---------- 1. Match rate ----------
const m = db.prepare('SELECT COUNT(*) AS total, SUM(matched) AS matched FROM tax_certificates').get();
const match = { total: m.total, matched: m.matched, rate: +((100 * m.matched) / m.total).toFixed(2) };
const unmatched = db.prepare('SELECT * FROM tax_certificates WHERE matched = 0').all();

// ---------- 2. Legal description agreement ----------
// The DOR roll carries a shortened legal description, so we compare by prefix or token overlap.
const pairs = db.prepare(`SELECT c.sale_year, c.certificate_number, c.parcel_id, c.legal_description AS cert_legal, p.legal_description AS roll_legal
  FROM tax_certificates c JOIN parcels p USING (parcel_id)`).all();
const disagree = [];
let agree = 0;
for (const r of pairs) {
  const a = norm(r.cert_legal);
  const b = norm(r.roll_legal);
  let ok = Boolean(a && b) && (a.startsWith(b) || b.startsWith(a));
  if (!ok && a && b) {
    const ta = tokens(a);
    const tb = tokens(b);
    const overlap = [...tb].filter((t) => ta.has(t)).length;
    ok = overlap / Math.min(ta.size, tb.size) >= 0.6;
  }
  if (ok) agree++;
  else disagree.push(r);
}
const legal = { compared: pairs.length, agree, rate: +((100 * agree) / (pairs.length || 1)).toFixed(2) };

// ---------- 3. Live Property Appraiser sample ----------
let appraiser = null;
const appraiserRows = [];
if (!offline) {
  const half = Math.ceil(sampleSize / 2);
  const sample = [
    ...db.prepare(`SELECT p.* FROM distress d JOIN parcels p USING (parcel_id) WHERE p.situs_address IS NOT NULL ORDER BY random() LIMIT ?`).all(half),
    ...db.prepare(`SELECT * FROM parcels WHERE situs_address IS NOT NULL AND parcel_id NOT IN (SELECT parcel_id FROM distress) ORDER BY random() LIMIT ?`).all(sampleSize - half),
  ];
  console.log(`Checking ${sample.length} parcels against pbcpao.gov ...`);
  for (const p of sample) {
    const url = links(p.parcel_id).propertyAppraiser;
    const row = { parcel_id: p.parcel_id, url, db_address: p.situs_address, db_owner: p.owner_name, pao_address: null, pao_owners: null, addressMatch: false, ownerMatch: false, error: null };
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (property-research-demo; accuracy check)' } });
      const text = (await res.text()).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
      row.pao_address = text.match(/Location Address (.*?) Municipality/)?.[1]?.trim() ?? null;
      row.pao_owners = text.match(/Owner\(s\) Mailing Address Actions (.*?) Change of Mailing Address/)?.[1]?.trim() ?? null;
      row.addressMatch = norm(row.pao_address) === norm(p.situs_address);
      row.ownerMatch = Boolean(row.pao_owners) && norm(row.pao_owners).includes(norm(p.owner_name));
    } catch (e) {
      row.error = e.message;
    }
    appraiserRows.push(row);
    console.log(`  ${pidDashed(p.parcel_id)}  address ${row.addressMatch ? 'OK ' : 'DIFF'}  owner ${row.ownerMatch ? 'OK ' : 'DIFF'}`);
    await new Promise((r) => setTimeout(r, 1500));
  }
  appraiser = {
    checked: appraiserRows.length,
    addressMatch: appraiserRows.filter((r) => r.addressMatch).length,
    ownerMatch: appraiserRows.filter((r) => r.ownerMatch).length,
    // Vacant parcels where the state roll has a street name only and pbcpao.gov displays no situs address.
    addressBlankOnPao: appraiserRows.filter((r) => !r.addressMatch && !r.error && !r.pao_address).length,
  };
}

// ---------- 4. Flags for manual review ----------
// Right-of-way strips and slivers routinely owe more than their nominal value, so only parcels worth $1,000+ are flagged.
const flags = db.prepare(`SELECT c.parcel_id, c.sale_year, c.certificate_number, c.tax_year, c.total_amount, p.just_value, p.situs_address
  FROM tax_certificates c JOIN parcels p USING (parcel_id)
  WHERE p.just_value >= 1000 AND c.total_amount > p.just_value`).all()
  .map((r) => ({ ...r, reason: 'Amount owed on certificate exceeds the parcel market value' }));

// ---------- Reports ----------
const summary = { match, legal, appraiser, flags, unmatchedCount: unmatched.length };
db.prepare('INSERT INTO verification (run_at, summary_json) VALUES (?, ?)').run(new Date().toISOString(), JSON.stringify(summary));
const sources = db.prepare('SELECT * FROM sources').all();
db.close();

mkdirSync('docs', { recursive: true });
const csv = (v) => (v == null ? '' : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const spot = openDb(DB_PATH, { readOnly: true })
  .prepare(`SELECT c.*, p.situs_address, p.situs_city, p.situs_zip, p.owner_name FROM tax_certificates c LEFT JOIN parcels p USING (parcel_id) ORDER BY c.parcel_id, c.tax_year`).all();
writeFileSync('docs/spot-check.csv', [
  'parcel_id,situs_address,city,zip,owner,tax_year,certificate,face_amount,total_amount,property_appraiser_url,tax_collector_url',
  ...spot.map((r) => { const L = links(r.parcel_id); return [pidDashed(r.parcel_id), r.situs_address, r.situs_city, r.situs_zip, r.owner_name, r.tax_year, `${r.sale_year}-${r.certificate_number}`, r.face_amount, r.total_amount, L.propertyAppraiser, L.taxCollector].map(csv).join(','); }),
].join('\n') + '\n');

const md = `# Data accuracy report

Generated ${new Date().toISOString().slice(0, 10)} by \`npm run verify\`.

## Sources

| Dataset | Records | Retrieved |
|---|---:|---|
${sources.map((s) => `| [${s.name}](${s.url}) | ${(s.record_count ?? 0).toLocaleString('en-US')} | ${s.retrieved_at?.slice(0, 10) ?? ''} |`).join('\n')}

## 1. Delinquent-tax records matched to parcels

**${match.matched} of ${match.total} certificates (${match.rate}%)** matched a parcel on the Florida DOR certified tax roll by 17-character parcel control number.
${unmatched.length ? `\nUnmatched:\n\n${unmatched.map((u) => `- ${pidDashed(u.parcel_id)} (certificate ${u.sale_year}-${u.certificate_number})`).join('\n')}\n` : ''}
## 2. Independent cross-check: legal descriptions

The Tax Collector's certificate file and the state tax roll each carry a legal description. They come from different offices, so agreement confirms the parcel match is correct and not just a coincidence of IDs.

**${legal.agree} of ${legal.compared} (${legal.rate}%)** agree (prefix or ≥60% token overlap; the state roll stores a shortened legal description).
${disagree.length ? `\n| Parcel | Certificate legal | State roll legal |\n|---|---|---|\n${disagree.slice(0, 25).map((d) => `| ${pidDashed(d.parcel_id)} | ${d.cert_legal ?? ''} | ${d.roll_legal ?? ''} |`).join('\n')}\n` : ''}
## 3. Live check against the Property Appraiser (pbcpao.gov)

${appraiser ? `A random sample of ${appraiser.checked} parcels (half tax-delinquent, half not) was fetched from the Property Appraiser's public site and compared with the database.

- Situs address matches: **${appraiser.addressMatch} / ${appraiser.checked}**${appraiser.addressBlankOnPao ? ` (${appraiser.addressBlankOnPao} of the others are vacant parcels where the state roll lists a street name only and pbcpao.gov shows no situs address)` : ''}
- Owner name matches: **${appraiser.ownerMatch} / ${appraiser.checked}**

| Parcel | Database address | pbcpao.gov address | Database owner | pbcpao.gov owner(s) |
|---|---|---|---|---|
${appraiserRows.map((r) => `| [${pidDashed(r.parcel_id)}](${r.url}) | ${r.db_address ?? ''} | ${r.pao_address ?? r.error ?? ''} ${r.addressMatch ? '✓' : '✗'} | ${r.db_owner ?? ''} | ${r.pao_owners ?? ''} ${r.ownerMatch ? '✓' : '✗'} |`).join('\n')}

Differences are expected for owners who changed after the roll was certified (the state roll reflects ownership as of January 1 of the roll year; pbcpao.gov is updated continuously).` : 'Skipped (--offline).'}

## 4. Flagged for manual review

${flags.length ? flags.map((f) => `- ${pidDashed(f.parcel_id)} ${f.situs_address ?? ''}: certificate ${f.sale_year}-${f.certificate_number} (tax year ${f.tax_year}) total $${f.total_amount.toLocaleString('en-US')} vs. market value $${(f.just_value ?? 0).toLocaleString('en-US')}. ${f.reason}.`).join('\n') : 'None.'}

## Manual spot check

[\`docs/spot-check.csv\`](spot-check.csv) lists every certificate with its address, tax year and amount, plus direct links to the Property Appraiser and Tax Collector record so any row can be checked by hand. Note that the Tax Collector site blocks automated access, so amounts are verified there manually.
`;
writeFileSync('docs/ACCURACY.md', md);
console.log(JSON.stringify({ match, legal, appraiser, flags: flags.length }, null, 2));
console.log('Wrote docs/ACCURACY.md and docs/spot-check.csv');
