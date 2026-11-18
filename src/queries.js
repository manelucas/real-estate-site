// Read-only queries shared by the HTML pages and the JSON API.
import { pid17 } from '../scripts/sources.js';

export const PAGE_SIZE = 50;

export function parseFilters(q) {
  const s = (k) => (q[k] ?? '').toString().trim();
  return {
    q: s('q').toUpperCase(),
    zip: s('zip').replace(/\D/g, '').slice(0, 5),
    city: s('city').toUpperCase(),
    distress: ['tax', 'absentee', 'out_of_state'].includes(s('distress')) ? s('distress') : '',
    page: Math.max(1, parseInt(s('page'), 10) || 1),
  };
}

export function hasFilters(f) {
  return Boolean(f.q || f.zip || f.city || f.distress);
}

function where(f) {
  const clauses = [];
  const params = [];
  if (f.zip) { clauses.push('p.situs_zip = ?'); params.push(f.zip); }
  if (f.city) { clauses.push('p.situs_city = ?'); params.push(f.city); }
  if (f.q) {
    const id = pid17(f.q);
    if (id.length === 17 && /\d{8}/.test(id)) {
      clauses.push('p.parcel_id = ?'); params.push(id);
    } else {
      clauses.push('(p.situs_address LIKE ? OR p.owner_name LIKE ?)');
      params.push(`%${f.q}%`, `%${f.q}%`);
    }
  }
  if (f.distress === 'tax') clauses.push('d.tax_delinquent = 1');
  if (f.distress === 'absentee') clauses.push('p.absentee = 1');
  if (f.distress === 'out_of_state') clauses.push('p.out_of_state = 1');
  return { sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

const SELECT = `
  SELECT p.parcel_id, p.situs_address, p.situs_city, p.situs_zip, p.owner_name, p.use_code,
         p.just_value, p.absentee, p.out_of_state,
         COALESCE(d.tax_delinquent, 0) AS tax_delinquent, d.certificate_count, d.delinquent_total,
         d.earliest_tax_year, d.latest_tax_year
  FROM parcels p LEFT JOIN distress d ON d.parcel_id = p.parcel_id`;

export function search(db, f, { limit = PAGE_SIZE, all = false } = {}) {
  const w = where(f);
  const total = db.prepare(`SELECT COUNT(*) AS n FROM parcels p LEFT JOIN distress d ON d.parcel_id = p.parcel_id ${w.sql}`).get(...w.params).n;
  const order = 'ORDER BY COALESCE(d.tax_delinquent,0) DESC, d.delinquent_total DESC, p.situs_zip, p.situs_address';
  const page = all ? '' : `LIMIT ${limit} OFFSET ${(f.page - 1) * limit}`;
  const rows = db.prepare(`${SELECT} ${w.sql} ${order} ${page}`).all(...w.params);
  return { total, rows };
}

export function property(db, id) {
  const parcel = db.prepare('SELECT * FROM parcels WHERE parcel_id = ?').get(pid17(id));
  if (!parcel) return null;
  return {
    parcel,
    distress: db.prepare('SELECT * FROM distress WHERE parcel_id = ?').get(parcel.parcel_id) ?? null,
    certificates: db.prepare('SELECT * FROM tax_certificates WHERE parcel_id = ? ORDER BY tax_year DESC').all(parcel.parcel_id),
    sales: db.prepare('SELECT * FROM sales WHERE parcel_id = ? ORDER BY sale_year DESC, sale_month DESC').all(parcel.parcel_id),
  };
}

export function overview(db) {
  const one = (sql) => db.prepare(sql).get();
  return {
    parcels: one('SELECT COUNT(*) AS n FROM parcels').n,
    delinquentParcels: one('SELECT COUNT(*) AS n FROM distress').n,
    certificates: one('SELECT COUNT(*) AS n, SUM(matched) AS matched, ROUND(SUM(total_amount),2) AS total FROM tax_certificates'),
    absentee: one('SELECT COUNT(*) AS n FROM parcels WHERE absentee = 1').n,
    outOfState: one('SELECT COUNT(*) AS n FROM parcels WHERE out_of_state = 1').n,
    topZips: db.prepare(`SELECT p.situs_zip AS zip, COUNT(*) AS n, ROUND(SUM(d.delinquent_total),2) AS total
      FROM distress d JOIN parcels p USING (parcel_id) WHERE p.situs_zip IS NOT NULL
      GROUP BY 1 ORDER BY 2 DESC, 1 LIMIT 12`).all(),
    cities: db.prepare(`SELECT situs_city AS city FROM parcels WHERE situs_city IS NOT NULL
      GROUP BY 1 HAVING COUNT(*) > 50 ORDER BY 1`).all().map((r) => r.city),
    sources: db.prepare('SELECT * FROM sources').all(),
    builtAt: db.prepare("SELECT value FROM meta WHERE key = 'built_at'").get()?.value,
    verification: (() => {
      const v = db.prepare('SELECT * FROM verification ORDER BY id DESC LIMIT 1').get();
      return v ? { runAt: v.run_at, ...JSON.parse(v.summary_json) } : null;
    })(),
  };
}
