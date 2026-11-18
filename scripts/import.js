// Builds data/pbc.db from the official files in data/raw/.
// Usage: npm run import
import { createReadStream, existsSync, readFileSync, readdirSync, rmSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'csv-parse';
import ExcelJS from 'exceljs';
import { openDb, DB_PATH, SCHEMA } from '../src/db.js';
import { SOURCES, pid17 } from './sources.js';

const RAW = 'data/raw';
const TMP = `${DB_PATH}.building`;
const t0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s]`, ...a);

const manifest = existsSync(join(RAW, 'manifest.json')) ? JSON.parse(readFileSync(join(RAW, 'manifest.json'), 'utf8')) : {};
const csvIn = (dir) => {
  const f = readdirSync(join(RAW, dir)).find((n) => n.toLowerCase().endsWith('.csv'));
  if (!f) throw new Error(`No CSV in ${RAW}/${dir}. Run "npm run download" first.`);
  return join(RAW, dir, f);
};
const txt = (v) => {
  const s = (v ?? '').toString().replace(/\s+/g, ' ').trim();
  return s === '' ? null : s;
};
const int = (v) => {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
};
const zip5 = (v) => {
  const s = txt(v);
  return s ? s.replace(/\D/g, '').slice(0, 5) || s : null;
};

for (const f of [TMP, `${TMP}-wal`, `${TMP}-shm`]) rmSync(f, { force: true });
const db = openDb(TMP);
db.exec('PRAGMA journal_mode = OFF; PRAGMA synchronous = OFF;');
db.exec(SCHEMA);

const insSource = db.prepare('INSERT INTO sources VALUES (?,?,?,?,?,?,?)');
const counts = {};

// ---------- 0. Source provenance (record counts filled in at the end) ----------
for (const s of SOURCES) {
  insSource.run(s.id, s.name, s.publisher, manifest[s.id]?.url ?? s.url, s.landing, manifest[s.id]?.retrievedAt ?? null, null);
}

// ---------- 1. Parcels (DOR NAL) ----------
log('parcels: reading', csvIn('nal'));
const insParcel = db.prepare(`INSERT INTO parcels VALUES (${Array(25).fill('?').join(',')})`);
const insSale = db.prepare('INSERT OR IGNORE INTO sales VALUES (?,?,?,?,?,?,?,?)');
db.exec('BEGIN');
let n = 0;
for await (const r of createReadStream(csvIn('nal')).pipe(parse({ columns: true, relax_quotes: true }))) {
  const pid = pid17(r.PARCEL_ID);
  const situsZip = zip5(r.PHY_ZIPCD);
  const ownerZip = zip5(r.OWN_ZIPCD);
  const ownerState = txt(r.OWN_STATE_DOM) ?? txt(r.OWN_STATE);
  insParcel.run(
    pid,
    txt([r.PHY_ADDR1, r.PHY_ADDR2].filter(Boolean).join(' ')),
    txt(r.PHY_CITY),
    situsZip,
    txt(r.OWN_NAME),
    txt(r.OWN_ADDR1),
    txt(r.OWN_ADDR2),
    txt(r.OWN_CITY),
    txt(r.OWN_STATE),
    ownerZip,
    situsZip && ownerZip && situsZip !== ownerZip ? 1 : 0,
    ownerState && ownerState.toUpperCase() !== 'FL' && ownerState.toUpperCase() !== 'FLORIDA' ? 1 : 0,
    txt(r.DOR_UC),
    int(r.JV),
    int(r.AV_NSD),
    int(r.TV_NSD),
    int(r.LND_VAL),
    int(r.EXMPT_01) > 0 ? 1 : 0,
    int(r.ACT_YR_BLT) || null,
    int(r.TOT_LVG_AREA) || null,
    int(r.LND_SQFOOT) || null,
    int(r.NO_RES_UNTS) || null,
    txt(r.S_LEGAL),
    int(r.ASMNT_YR),
    'dor_nal',
  );
  for (const k of ['1', '2']) {
    if (int(r[`SALE_YR${k}`])) {
      insSale.run(pid, int(r[`SALE_YR${k}`]), int(r[`SALE_MO${k}`]), int(r[`SALE_PRC${k}`]),
        txt(r[`OR_BOOK${k}`]), txt(r[`OR_PAGE${k}`]), txt(r[`QUAL_CD${k}`]), 'dor_nal');
    }
  }
  if (++n % 100000 === 0) log(`parcels: ${n.toLocaleString()}`);
}
db.exec('COMMIT');
counts.dor_nal = n;
log(`parcels: ${n.toLocaleString()} loaded`);

// ---------- 2. Sales (DOR SDF) ----------
log('sales: reading', csvIn('sdf'));
const parcelExists = db.prepare('SELECT 1 FROM parcels WHERE parcel_id = ?');
db.exec('BEGIN');
n = 0;
for await (const r of createReadStream(csvIn('sdf')).pipe(parse({ columns: true, relax_quotes: true }))) {
  const pid = pid17(r.PARCEL_ID);
  if (!parcelExists.get(pid)) continue;
  insSale.run(pid, int(r.SALE_YR), int(r.SALE_MO), int(r.SALE_PRC), txt(r.OR_BOOK), txt(r.OR_PAGE), txt(r.QUAL_CD), 'dor_sdf');
  n++;
}
db.exec('COMMIT');
counts.dor_sdf = n;
log(`sales: ${n.toLocaleString()} SDF rows processed`);

// ---------- 3. Delinquent taxes: county-held tax certificates (Tax Collector) ----------
const certFile = join(RAW, 'county_certs.xlsx');
log('certificates: reading', certFile);
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(certFile);
const ws = wb.worksheets[0];
const header = ws.getRow(1).values.map((v) => (typeof v === 'string' ? v.trim() : v));
const col = (name) => {
  const i = header.indexOf(name);
  if (i < 1) throw new Error(`Column "${name}" not found in ${certFile}; header = ${header.join(' | ')}`);
  return i;
};
const C = {
  pin: col('PIN'), saleDate: col('Sale Date'), saleYear: col('Sale Year'), cert: col('Certificate Number'),
  taxYear: col('Tax Year'), bill: col('Bill Number'), face: col('Face Amount'), rate: col('Interest Rate'),
  total: col('Total Amt'), legal: col('Legal Description'),
};
const cell = (row, i) => {
  const v = row.getCell(i).value;
  return v && typeof v === 'object' && !(v instanceof Date) ? (v.result ?? v.text ?? null) : v;
};
const insCert = db.prepare(`INSERT INTO tax_certificates
  (certificate_number, sale_year, parcel_id, tax_year, sale_date, bill_number, face_amount, interest_rate, total_amount, legal_description, matched, source_id)
  VALUES (?,?,?,?,?,?,?,?,?,?,?, 'pbctax_county_certs')`);
db.exec('BEGIN');
n = 0;
let dupes = 0;
for (let i = 2; i <= ws.rowCount; i++) {
  const row = ws.getRow(i);
  const pin = cell(row, C.pin);
  if (!pin) continue;
  const pid = pid17(pin);
  const sd = cell(row, C.saleDate);
  try {
    insCert.run(
      txt(cell(row, C.cert)), int(cell(row, C.saleYear)), pid, int(cell(row, C.taxYear)),
      sd instanceof Date ? sd.toISOString().slice(0, 10) : txt(sd),
      txt(cell(row, C.bill)), Number(cell(row, C.face)) || 0, Number(cell(row, C.rate)) || null,
      Number(cell(row, C.total)) || 0, txt(cell(row, C.legal)), parcelExists.get(pid) ? 1 : 0,
    );
    n++;
  } catch (e) {
    if (String(e.message).includes('UNIQUE')) dupes++;
    else throw e;
  }
}
db.exec('COMMIT');
counts.pbctax_county_certs = n;
log(`certificates: ${n} loaded${dupes ? `, ${dupes} duplicate rows skipped` : ''}`);

// ---------- 4. Distress summary ----------
db.exec(`
  INSERT INTO distress (parcel_id, tax_delinquent, certificate_count, delinquent_total, earliest_tax_year, latest_tax_year)
  SELECT parcel_id, 1, COUNT(*), ROUND(SUM(total_amount), 2), MIN(tax_year), MAX(tax_year)
  FROM tax_certificates WHERE matched = 1 GROUP BY parcel_id;
`);

const setCount = db.prepare('UPDATE sources SET record_count = ? WHERE id = ?');
for (const [id, c] of Object.entries(counts)) setCount.run(c, id);
const setMeta = db.prepare('INSERT OR REPLACE INTO meta VALUES (?,?)');
setMeta.run('built_at', new Date().toISOString());
setMeta.run('county', 'Palm Beach County, FL');
db.exec('ANALYZE; VACUUM;');
db.close();

for (const f of [DB_PATH, `${DB_PATH}-wal`, `${DB_PATH}-shm`]) rmSync(f, { force: true });
renameSync(TMP, DB_PATH);
log(`done -> ${DB_PATH}`);
