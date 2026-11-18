import { html, raw } from 'hono/html';
import { useDescription, useCategory } from './usecodes.js';
import { links, pidDashed } from '../scripts/sources.js';
import { PAGE_SIZE } from './queries.js';

const money = (v, cents = false) =>
  v == null ? '—' : v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents ? 2 : 0, minimumFractionDigits: cents ? 2 : 0 });
const num = (v) => (v == null ? '—' : v.toLocaleString('en-US'));
const date = (iso) => (iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—');
const qs = (f, extra = {}) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ q: f.q, zip: f.zip, city: f.city, distress: f.distress, ...extra })) if (v) p.set(k, v);
  return p.toString();
};

const CSS = `
:root{--bg:#f7f7f5;--card:#fff;--ink:#1d1d1b;--muted:#6b6b66;--line:#e3e2dd;--accent:#0b5d4b;--accent-ink:#fff;--warn:#a4320f;--warn-bg:#fdeee8;--chip:#eef3f1}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--card:#1e1e1c;--ink:#ecebe6;--muted:#a3a29b;--line:#34332f;--accent:#4fb89c;--accent-ink:#0d1d18;--warn:#ff9b78;--warn-bg:#3a1e14;--chip:#22302b}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
a{color:var(--accent)}header{background:var(--card);border-bottom:1px solid var(--line)}
.wrap{max-width:1180px;margin:0 auto;padding:0 16px}header .wrap{display:flex;gap:24px;align-items:center;height:56px}
header strong{font-size:17px}header nav{display:flex;gap:16px;margin-left:auto}header nav a{text-decoration:none;color:var(--muted)}
h1{font-size:24px;margin:24px 0 4px}h2{font-size:17px;margin:0 0 12px}.muted{color:var(--muted)}.small{font-size:13px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:18px;margin:16px 0}
form.search{display:grid;grid-template-columns:2fr 1fr 1.3fr 1.3fr auto;gap:10px}
input,select,button{font:inherit;padding:9px 10px;border:1px solid var(--line);border-radius:7px;background:var(--bg);color:var(--ink);min-width:0}
button,.btn{background:var(--accent);color:var(--accent-ink);border:0;cursor:pointer;font-weight:600;text-decoration:none;padding:9px 16px;border-radius:7px;display:inline-block}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.stat b{display:block;font-size:22px}
.tablewrap{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-weight:600;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.03em}td.r,th.r{text-align:right;font-variant-numeric:tabular-nums}
.chip{display:inline-block;padding:1px 8px;border-radius:99px;background:var(--chip);font-size:12px;margin:1px 4px 1px 0;white-space:nowrap}
.chip.warn{background:var(--warn-bg);color:var(--warn);font-weight:600}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;margin:0}dt{color:var(--muted)}dd{margin:0}
.src{font-size:12px;color:var(--muted);margin-top:10px;border-top:1px dashed var(--line);padding-top:8px}
.pager{display:flex;gap:12px;align-items:center;margin-top:12px}.zips{display:flex;flex-wrap:wrap;gap:8px}
.zips a{text-decoration:none;border:1px solid var(--line);border-radius:7px;padding:6px 10px;color:var(--ink);background:var(--bg)}
footer{color:var(--muted);font-size:12px;padding:24px 0 40px}
@media (max-width:760px){form.search{grid-template-columns:1fr 1fr}form.search input[name=q]{grid-column:1/-1}.stats{grid-template-columns:1fr 1fr}.grid2{grid-template-columns:1fr}}
`;

export function layout(title, body) {
  return html`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · PBC Property Research</title><style>${raw(CSS)}</style></head><body>
<header><div class="wrap"><strong><a href="/" style="text-decoration:none;color:inherit">PBC Property Research</a></strong>
<nav><a href="/">Search</a><a href="/sources">Data sources &amp; accuracy</a><a href="/api/search?distress=tax">API</a></nav></div></header>
<main class="wrap">${body}</main>
<footer class="wrap">Built from official public records: Florida Department of Revenue tax roll and Palm Beach County Tax Collector. Verify every record at the official source links shown on each property report.</footer>
</body></html>`;
}

function distressChips(r) {
  return html`${r.tax_delinquent ? html`<span class="chip warn">Tax delinquent</span>` : ''}${r.out_of_state ? html`<span class="chip">Out-of-state owner</span>` : r.absentee ? html`<span class="chip">Absentee owner</span>` : ''}`;
}

export function searchPage(f, result, ov, active) {
  const pages = result ? Math.ceil(result.total / PAGE_SIZE) : 0;
  return layout('Search', html`
<h1>Palm Beach County property search</h1>
<p class="muted">${num(ov.parcels)} parcels from the ${ov.sources[0]?.name.match(/\d{4}/)?.[0]} certified tax roll, matched by parcel ID to official delinquent-tax records.</p>
<div class="card"><form class="search" method="get" action="/">
  <input name="q" value="${f.q}" placeholder="Address, owner name or parcel ID">
  <input name="zip" value="${f.zip}" placeholder="ZIP code" inputmode="numeric" maxlength="5">
  <select name="city"><option value="">Any city</option>${ov.cities.map((c) => html`<option ${c === f.city ? 'selected' : ''}>${c}</option>`)}</select>
  <select name="distress">
    <option value="">Any status</option>
    <option value="tax" ${f.distress === 'tax' ? 'selected' : ''}>Tax delinquent</option>
    <option value="absentee" ${f.distress === 'absentee' ? 'selected' : ''}>Absentee owner</option>
    <option value="out_of_state" ${f.distress === 'out_of_state' ? 'selected' : ''}>Out-of-state owner</option>
  </select>
  <button>Search</button>
</form></div>
${active ? resultsBlock(f, result, pages) : html`
<div class="stats">
  <div class="card stat"><span class="muted small">Parcels in database</span><b>${num(ov.parcels)}</b></div>
  <div class="card stat"><span class="muted small">Tax-delinquent parcels</span><b>${num(ov.delinquentParcels)}</b></div>
  <div class="card stat"><span class="muted small">Unpaid certificates</span><b>${num(ov.certificates.n)}</b><span class="small muted">${money(ov.certificates.total)} owed</span></div>
  <div class="card stat"><span class="muted small">Certificates matched to a parcel</span><b>${ov.certificates.n ? ((100 * ov.certificates.matched) / ov.certificates.n).toFixed(1) : 0}%</b></div>
</div>
<div class="card"><h2>ZIP codes with the most tax-delinquent properties</h2><div class="zips">
${ov.topZips.map((z) => html`<a href="/?zip=${z.zip}&distress=tax"><b>${z.zip}</b> · ${z.n} ${z.n === 1 ? 'property' : 'properties'} · ${money(z.total)}</a>`)}
</div><p class="small muted">Or <a href="/?distress=tax">list all tax-delinquent parcels</a>.</p></div>`}
`);
}

function resultsBlock(f, result, pages) {
  return html`<div class="card">
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
  <h2 style="margin:0">${num(result.total)} ${result.total === 1 ? 'property' : 'properties'}</h2>
  ${result.total ? html`<a class="small" href="/export.csv?${qs(f)}">Download CSV${result.total > 5000 ? ' (first 5,000)' : ''}</a>` : ''}
</div>
<div class="tablewrap"><table>
<thead><tr><th>Property</th><th>Owner</th><th>Use</th><th class="r">Market value</th><th>Status</th><th class="r">Delinquent tax owed</th></tr></thead>
<tbody>${result.rows.map((r) => html`<tr>
  <td><a href="/property/${r.parcel_id}">${r.situs_address ?? '(no situs address)'}</a><br><span class="small muted">${[r.situs_city, r.situs_zip].filter(Boolean).join(', ')} · ${pidDashed(r.parcel_id)}</span></td>
  <td>${r.owner_name ?? '—'}</td>
  <td class="small">${useDescription(r.use_code)}</td>
  <td class="r">${money(r.just_value)}</td>
  <td>${distressChips(r)}</td>
  <td class="r">${r.tax_delinquent ? html`<b>${money(r.delinquent_total, true)}</b><br><span class="small muted">${r.certificate_count} cert. · ${r.earliest_tax_year === r.latest_tax_year ? r.latest_tax_year : `${r.earliest_tax_year}–${r.latest_tax_year}`}</span>` : '—'}</td>
</tr>`)}</tbody></table></div>
${pages > 1 ? html`<div class="pager">
  ${f.page > 1 ? html`<a href="/?${qs(f, { page: f.page - 1 })}">← Prev</a>` : ''}
  <span class="muted small">Page ${f.page} of ${num(pages)}</span>
  ${f.page < pages ? html`<a href="/?${qs(f, { page: f.page + 1 })}">Next →</a>` : ''}
</div>` : ''}
</div>`;
}

export function propertyPage(p, sources) {
  const { parcel: x, distress: d, certificates, sales } = p;
  const L = links(x.parcel_id);
  const src = Object.fromEntries(sources.map((s) => [s.id, s]));
  const cite = (id) => html`<div class="src">Source: <a href="${src[id]?.landing}">${src[id]?.name}</a> · retrieved ${date(src[id]?.retrieved_at)}</div>`;
  return layout(x.situs_address ?? pidDashed(x.parcel_id), html`
<h1>${x.situs_address ?? '(no situs address)'}</h1>
<p class="muted">${[x.situs_city, 'FL', x.situs_zip].filter(Boolean).join(', ')} · Parcel ${pidDashed(x.parcel_id)} · ${distressChips({ ...x, tax_delinquent: d?.tax_delinquent })}</p>

<div class="card"><h2>Verify at the official source</h2>
<p class="small" style="margin:0"><a href="${L.propertyAppraiser}" target="_blank" rel="noopener">Property Appraiser record</a> ·
<a href="${L.taxCollector}" target="_blank" rel="noopener">Tax Collector account</a> ·
<a href="${L.realTda}" target="_blank" rel="noopener">Clerk tax deed search (RealTDA)</a></p></div>

${d ? html`<div class="card" style="border-color:var(--warn)"><h2>Delinquent property taxes</h2>
<p><b style="font-size:20px">${money(d.delinquent_total, true)}</b> <span class="muted">owed across ${d.certificate_count} unpaid tax certificate${d.certificate_count > 1 ? 's' : ''}, tax years ${d.earliest_tax_year === d.latest_tax_year ? d.latest_tax_year : `${d.earliest_tax_year}–${d.latest_tax_year}`}</span></p>
<div class="tablewrap"><table><thead><tr><th>Tax year</th><th>Certificate</th><th>Sale date</th><th>Bill #</th><th class="r">Face amount</th><th class="r">Rate</th><th class="r">Total due</th><th>Holder</th></tr></thead>
<tbody>${certificates.map((c) => html`<tr><td>${c.tax_year}</td><td>${c.sale_year}-${c.certificate_number}</td><td>${date(c.sale_date)}</td><td>${c.bill_number}</td>
<td class="r">${money(c.face_amount, true)}</td><td class="r">${c.interest_rate ?? '—'}%</td><td class="r"><b>${money(c.total_amount, true)}</b></td><td class="small">${c.holder}</td></tr>`)}</tbody></table></div>
<p class="small muted">Legal description on certificate: ${certificates[0]?.legal_description ?? '—'}</p>
${cite('pbctax_county_certs')}</div>` : ''}

<div class="grid2">
<div class="card"><h2>Ownership</h2><dl>
<dt>Owner</dt><dd>${x.owner_name ?? '—'}</dd>
<dt>Mailing address</dt><dd>${[x.owner_address1, x.owner_address2].filter(Boolean).join(', ') || '—'}<br>${[x.owner_city, x.owner_state, x.owner_zip].filter(Boolean).join(' ')}</dd>
<dt>Homestead</dt><dd>${x.homestead ? 'Yes' : 'No'}</dd>
<dt>Owner status</dt><dd>${x.out_of_state ? 'Out-of-state owner' : x.absentee ? 'Absentee (mails to a different ZIP)' : 'Mails to property ZIP'}</dd>
</dl>${cite(x.source_id)}</div>

<div class="card"><h2>Values (${x.tax_year} roll)</h2><dl>
<dt>Market (just) value</dt><dd>${money(x.just_value)}</dd>
<dt>Assessed value</dt><dd>${money(x.assessed_value)}</dd>
<dt>Taxable value</dt><dd>${money(x.taxable_value)}</dd>
<dt>Land value</dt><dd>${money(x.land_value)}</dd>
</dl>${cite(x.source_id)}</div>

<div class="card"><h2>Property</h2><dl>
<dt>Use</dt><dd>${useDescription(x.use_code)} <span class="muted small">(${useCategory(x.use_code)}, DOR code ${x.use_code})</span></dd>
<dt>Year built</dt><dd>${x.year_built ?? '—'}</dd>
<dt>Living area</dt><dd>${x.living_sqft ? `${num(x.living_sqft)} sq ft` : '—'}</dd>
<dt>Land area</dt><dd>${x.land_sqft ? `${num(x.land_sqft)} sq ft (${(x.land_sqft / 43560).toFixed(2)} ac)` : '—'}</dd>
<dt>Units</dt><dd>${x.units ?? '—'}</dd>
<dt>Legal description</dt><dd class="small">${x.legal_description ?? '—'}</dd>
</dl>${cite(x.source_id)}</div>

<div class="card"><h2>Recent sales <span class="muted small">(current roll period)</span></h2>
${sales.length ? html`<table><thead><tr><th>Date</th><th class="r">Price</th><th>OR Book/Page</th></tr></thead><tbody>
${sales.map((s) => html`<tr><td>${s.sale_month ? `${String(s.sale_month).padStart(2, '0')}/` : ''}${s.sale_year}</td><td class="r">${money(s.price)}</td><td>${s.or_book ?? '—'} / ${s.or_page ?? '—'}</td></tr>`)}
</tbody></table>` : html`<p class="muted">No sales recorded in the current roll period.</p>`}
${cite('dor_nal')}</div>
</div>`);
}

export function sourcesPage(ov) {
  const v = ov.verification;
  return layout('Data sources & accuracy', html`
<h1>Data sources &amp; accuracy</h1>
<p class="muted">Database built ${date(ov.builtAt)}. Every record comes from one of the official files below and links back to the issuing office.</p>
<div class="card"><h2>Sources</h2><div class="tablewrap"><table><thead><tr><th>Dataset</th><th>Publisher</th><th class="r">Records</th><th>Retrieved</th></tr></thead><tbody>
${ov.sources.map((s) => html`<tr><td><a href="${s.url}">${s.name}</a></td><td class="small">${s.publisher}</td><td class="r">${num(s.record_count)}</td><td>${date(s.retrieved_at)}</td></tr>`)}
</tbody></table></div></div>
${v ? html`<div class="card"><h2>Latest verification run · ${date(v.runAt)}</h2><dl>
<dt>Certificates matched to a parcel</dt><dd><b>${v.match.matched} of ${v.match.total}</b> (${v.match.rate}%) by parcel control number</dd>
<dt>Legal description agreement</dt><dd>${v.legal.agree} of ${v.legal.compared} matched certificates share the parcel's legal description on the state roll (${v.legal.rate}%)</dd>
${v.appraiser ? html`<dt>Live Property Appraiser check</dt><dd>${v.appraiser.addressMatch} of ${v.appraiser.checked} sampled parcels: situs address matches pbcpao.gov${v.appraiser.addressBlankOnPao ? ` (${v.appraiser.addressBlankOnPao} more are vacant lots with no address shown on pbcpao.gov)` : ''} · ${v.appraiser.ownerMatch} of ${v.appraiser.checked}: owner name matches</dd>` : ''}
<dt>Data quality flags</dt><dd>${v.flags.length} record(s) flagged for manual review (see docs/ACCURACY.md)</dd>
</dl></div>` : html`<div class="card"><p>No verification run yet. Run <code>npm run verify</code>.</p></div>`}
<div class="card"><h2>Coverage notes</h2><ul class="small">
<li><b>Delinquent taxes</b> come from the Tax Collector's published list of county-held tax certificates: delinquent real-estate taxes that were not bought by an investor at the annual tax certificate sale and remain unpaid. Certificates sold to private investors are not in this file; the full delinquent roll is being requested from the Tax Collector under Chapter 119, F.S.</li>
<li><b>Parcels, owners, values and sales</b> come from the Florida Department of Revenue's certified ${ov.sources[0]?.name.match(/\d{4}/)?.[0]} final tax roll for Palm Beach County (county 60), which the Property Appraiser submits to the state.</li>
<li>Many delinquent parcels are vacant land, rights-of-way or submerged land without a street address. They are kept and searchable by parcel ID and city.</li>
</ul></div>`);
}

export function notFound(msg) {
  return layout('Not found', html`<h1>Not found</h1><p>${msg}</p><p><a href="/">Back to search</a></p>`);
}
