import { DatabaseSync } from 'node:sqlite';

export const DB_PATH = process.env.DB_PATH ?? 'data/pbc.db';

export function openDb(path = DB_PATH, opts = {}) {
  const db = new DatabaseSync(path, opts);
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

// Schema is plain SQLite so it can be loaded into Cloudflare D1 unchanged.
export const SCHEMA = `
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  publisher TEXT NOT NULL,
  url TEXT NOT NULL,
  landing TEXT,
  retrieved_at TEXT,
  record_count INTEGER
);

CREATE TABLE parcels (
  parcel_id TEXT PRIMARY KEY,          -- 17-digit Palm Beach County parcel control number, no dashes
  situs_address TEXT,
  situs_city TEXT,
  situs_zip TEXT,
  owner_name TEXT,
  owner_address1 TEXT,
  owner_address2 TEXT,
  owner_city TEXT,
  owner_state TEXT,
  owner_zip TEXT,
  absentee INTEGER NOT NULL DEFAULT 0, -- owner mailing ZIP differs from property ZIP
  out_of_state INTEGER NOT NULL DEFAULT 0,
  use_code TEXT,
  just_value INTEGER,                  -- market (just) value
  assessed_value INTEGER,              -- non-school assessed value
  taxable_value INTEGER,               -- non-school taxable value
  land_value INTEGER,
  homestead INTEGER NOT NULL DEFAULT 0,
  year_built INTEGER,
  living_sqft INTEGER,
  land_sqft INTEGER,
  units INTEGER,
  legal_description TEXT,
  tax_year INTEGER NOT NULL,
  source_id TEXT NOT NULL REFERENCES sources(id)
);
CREATE INDEX parcels_zip ON parcels(situs_zip);
CREATE INDEX parcels_city ON parcels(situs_city);
CREATE INDEX parcels_address ON parcels(situs_address);

CREATE TABLE sales (
  parcel_id TEXT NOT NULL REFERENCES parcels(parcel_id),
  sale_year INTEGER,
  sale_month INTEGER,
  price INTEGER,
  or_book TEXT,
  or_page TEXT,
  qual_code TEXT,                      -- DOR sale qualification code (see NAL/SDF users guide)
  source_id TEXT NOT NULL REFERENCES sources(id),
  UNIQUE (parcel_id, or_book, or_page)
);
CREATE INDEX sales_parcel ON sales(parcel_id);

CREATE TABLE tax_certificates (
  certificate_number TEXT NOT NULL,
  sale_year INTEGER NOT NULL,
  parcel_id TEXT NOT NULL,             -- not a foreign key: unmatched records are kept and reported
  tax_year INTEGER NOT NULL,
  sale_date TEXT,
  bill_number TEXT,
  face_amount REAL,
  interest_rate REAL,
  total_amount REAL,
  legal_description TEXT,
  holder TEXT NOT NULL DEFAULT 'Palm Beach County (county-held)',
  matched INTEGER NOT NULL DEFAULT 0,
  source_id TEXT NOT NULL REFERENCES sources(id),
  PRIMARY KEY (sale_year, certificate_number)
);
CREATE INDEX certs_parcel ON tax_certificates(parcel_id);

-- Per-parcel distress summary, rebuilt at import time for fast search.
CREATE TABLE distress (
  parcel_id TEXT PRIMARY KEY REFERENCES parcels(parcel_id),
  tax_delinquent INTEGER NOT NULL DEFAULT 0,
  certificate_count INTEGER NOT NULL DEFAULT 0,
  delinquent_total REAL NOT NULL DEFAULT 0,
  earliest_tax_year INTEGER,
  latest_tax_year INTEGER
);

CREATE TABLE verification (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_at TEXT NOT NULL,
  summary_json TEXT NOT NULL
);

CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
`;
