# Architecture

## Today (milestone demo)

```
 official files ──► download.js ──► data/raw/ ──► import.js ──► data/pbc.db (SQLite) ──► server.js (Hono)
                                                     │                                    ├─ HTML search + reports
                                                     └─► verify.js ──► docs/ACCURACY.md   ├─ JSON API
                                                                                          └─ CSV export
```

- **Ingestion is source-by-source.** Each source has a stable id, a URL, a retrieval timestamp and a record count stored in the `sources` table. Every row in `parcels`, `sales` and `tax_certificates` carries the `source_id` it came from, so each value on a property report can be traced to an official file.
- **Matching** is by normalized 17-character parcel control number. About 1,900 Palm Beach parcel IDs contain letters, so normalization strips only dashes and spaces. Unmatched records are kept (`matched = 0`) and listed in the accuracy report, never dropped silently.
- **Rebuilds are atomic.** The importer writes to `pbc.db.building` and swaps it in only when complete.

## Production (proposed)

| Concern | Choice | Why |
|---|---|---|
| Web app + API | Hono on **Cloudflare Workers** | Same code as the demo (Hono runs on Node and Workers). Global edge, no servers to manage. |
| Database | **Cloudflare D1** to start; Postgres (Neon or Supabase) once national | Schema is plain SQLite, so the demo DB loads into D1 as-is. Palm Beach is ~200 MB; D1 allows 10 GB per database on the paid plan. National coverage (~150M parcels) needs Postgres with PostGIS and full-text search. |
| Raw files & reports | **Cloudflare R2** | Archive every downloaded source file (evidence trail); store generated PDF reports. |
| Scheduled ingestion | **Cron Triggers + Queues** | Per-source jobs: DOR roll (annual + preliminary), Tax Collector lists (monthly), Clerk official records (daily), permits/code cases (daily where APIs exist). |
| Auth & subscriptions | Stripe Checkout + Customer Portal; webhook → D1 | Monthly/annual plans; Apple Pay and Google Pay are enabled in Stripe with no extra code. |
| Alerts | Saved searches re-run after each ingest; diff → email (Resend/Postmark) | |

## Next data sources for Palm Beach

| Distress category | Source | Access |
|---|---|---|
| Full delinquent tax roll + investor-held certificates | Tax Collector | Public records request (Ch. 119 F.S.) for an electronic file |
| Liens, mortgages, lis pendens (pre-foreclosure) | Clerk & Comptroller Official Records | Official Records search / bulk data subscription |
| Foreclosure and tax deed auctions | Clerk auction calendars (RealForeclose / RealTDA) | Public auction listings |
| Building permits | PBC Planning, Zoning & Building + municipal portals | Open data / public search |
| Code violations | PBC Code Enforcement + municipalities | Open data / public records request |
| Contractor licenses | Florida DBPR licensee data | Free public download |
