import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { existsSync } from 'node:fs';
import { openDb, DB_PATH } from './db.js';
import { parseFilters, hasFilters, search, property, overview } from './queries.js';
import { searchPage, propertyPage, sourcesPage, notFound } from './views.js';
import { links, pidDashed } from '../scripts/sources.js';
import { useDescription } from './usecodes.js';

if (!existsSync(DB_PATH)) {
  console.error(`Database ${DB_PATH} not found. Run "npm run setup" first.`);
  process.exit(1);
}
const db = openDb(DB_PATH, { readOnly: true });
let cachedOverview = overview(db);

const app = new Hono();

app.get('/', (c) => {
  const f = parseFilters(c.req.query());
  const active = hasFilters(f);
  return c.html(searchPage(f, active ? search(db, f) : null, cachedOverview, active));
});

app.get('/property/:id', (c) => {
  const p = property(db, c.req.param('id'));
  return p ? c.html(propertyPage(p, cachedOverview.sources)) : c.html(notFound('No parcel with that ID.'), 404);
});

app.get('/sources', (c) => c.html(sourcesPage(cachedOverview)));

// ---- JSON API ----
app.get('/api/search', (c) => {
  const f = parseFilters(c.req.query());
  const { total, rows } = search(db, f);
  return c.json({ total, page: f.page, filters: f, results: rows.map((r) => ({ ...r, links: links(r.parcel_id) })) });
});

app.get('/api/property/:id', (c) => {
  const p = property(db, c.req.param('id'));
  return p ? c.json({ ...p, links: links(p.parcel.parcel_id) }) : c.json({ error: 'not found' }, 404);
});

app.get('/api/stats', (c) => {
  const { cities, ...rest } = cachedOverview;
  return c.json(rest);
});

// ---- CSV export ----
const csvCell = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
app.get('/export.csv', (c) => {
  const f = parseFilters(c.req.query());
  const { rows } = search(db, { ...f, page: 1 }, { limit: 5000 });
  const head = ['parcel_id', 'situs_address', 'city', 'zip', 'owner', 'use', 'market_value', 'tax_delinquent', 'certificates',
    'delinquent_total', 'earliest_tax_year', 'latest_tax_year', 'absentee', 'out_of_state', 'property_appraiser_url', 'tax_collector_url'];
  const lines = rows.map((r) => {
    const L = links(r.parcel_id);
    return [pidDashed(r.parcel_id), r.situs_address, r.situs_city, r.situs_zip, r.owner_name, useDescription(r.use_code), r.just_value,
      r.tax_delinquent, r.certificate_count ?? 0, r.delinquent_total ?? 0, r.earliest_tax_year, r.latest_tax_year, r.absentee, r.out_of_state,
      L.propertyAppraiser, L.taxCollector].map(csvCell).join(',');
  });
  c.header('Content-Type', 'text/csv; charset=utf-8');
  c.header('Content-Disposition', `attachment; filename="pbc-properties${f.zip ? `-${f.zip}` : ''}.csv"`);
  return c.body([head.join(','), ...lines].join('\n'));
});

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, () => console.log(`Listening on http://localhost:${port}`));
