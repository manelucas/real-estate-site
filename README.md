# Palm Beach County Property Research: delinquent-tax database

A working property database for Palm Beach County, FL, built from official government records and searchable by ZIP code, city, address, owner and distress status. Every property is matched by parcel control number to the Tax Collector's delinquent-tax records, showing tax years and amounts owed.

**Current data (built Nov 18, 2026)**

| | |
|---|---:|
| Parcels (2026 certified tax roll) | 657,468 |
| Sales records (2025–26 roll period) | 110,606 |
| Unpaid county-held tax certificates | 833 |
| Certificates matched to a parcel | **833 / 833 (100%)** |
| Legal description agreement (Tax Collector vs. state roll) | **833 / 833 (100%)** |
| Live check vs. pbcpao.gov, random sample of 20 | **20 / 20** address and owner |

See [docs/ACCURACY.md](docs/ACCURACY.md) for the full accuracy report and [docs/spot-check.csv](docs/spot-check.csv) to check any record by hand.

## Features

- **Search** by ZIP code, city, street address, owner name or parcel ID.
- **Distress filters:** tax delinquent, absentee owner, out-of-state owner.
- **Property report:** ownership and mailing address, market/assessed/taxable values, building facts, sales history (with Official Records book/page), and each delinquent tax certificate with tax year, face amount, interest rate and total due.
- **Source verification:** every section cites its source file and retrieval date, and each report links directly to the parcel's official record at the Property Appraiser, Tax Collector and Clerk tax deed system.
- **CSV export** of any search, including the official verification links.
- **JSON API:** `/api/search`, `/api/property/:id`, `/api/stats`.

## Data sources

All sources are free and public. Nothing is scraped from sites that disallow automated access.

| Data | Source |
|---|---|
| Parcels, owners, addresses, values, legal descriptions | Florida Dept. of Revenue: 2026 Final NAL tax roll, Palm Beach County (60) |
| Sales (current roll period) | Florida Dept. of Revenue: 2026 Final SDF sale data file + sales on the NAL. Older sales history comes from the Property Appraiser's sales file in the next phase. |
| Delinquent property taxes | Palm Beach County Tax Collector: county-held tax certificates list |
| Live verification | Palm Beach County Property Appraiser public parcel pages (sampled, rate-limited) |

Exact URLs are in [scripts/sources.js](scripts/sources.js).

**Coverage note:** the Tax Collector's downloadable file covers delinquent taxes still held by the county (certificates no investor bought at the annual sale). The full delinquent roll, including investor-held certificates, is published only as a newspaper advertisement, and will be obtained as structured data through a public records request ([draft](docs/public-records-request.md)). The importer is built to take it as an additional source.

## Running it

Requires Node.js 22.13+ (uses the built-in `node:sqlite` module).

```bash
npm install
npm run setup     # download official files (~50 MB), build data/pbc.db (~25 s), run verification
npm start         # http://localhost:3000
```

Individual steps: `npm run download`, `npm run import`, `npm run verify` (`-- --offline` skips the live check, `-- --sample 50` changes the sample size).

## Project layout

```
scripts/sources.js    official source URLs, parcel ID normalization, verification links
scripts/download.js   fetches source files into data/raw/ and records retrieval times
scripts/import.js     builds data/pbc.db (SQLite) from the raw files
scripts/verify.js     match rate, cross-source checks, live sample → docs/ACCURACY.md
src/db.js             schema (plain SQLite, D1-compatible)
src/queries.js        search / property / stats queries
src/views.js          server-rendered HTML
src/server.js         Hono web app, JSON API, CSV export
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the production architecture and the Cloudflare deployment path.
