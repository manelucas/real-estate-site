// Downloads the official source files into data/raw/ and records when they were retrieved.
// Usage: npm run download   (pass --force to re-download existing files)
import { mkdirSync, existsSync, writeFileSync, readFileSync, statSync, createWriteStream } from 'node:fs';
import { join, basename } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import yauzl from 'yauzl';
import { SOURCES } from './sources.js';

const RAW = 'data/raw';
const UA = { 'User-Agent': 'Mozilla/5.0 (property-research-demo)' };
const force = process.argv.includes('--force');
mkdirSync(RAW, { recursive: true });

const manifestPath = join(RAW, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

// Some publishers rename files on every update (e.g. a date in the file name).
// For those, find the current link on the official landing page; fall back to the known URL.
async function resolveUrl(s) {
  if (!s.discover) return s.url;
  try {
    const res = await fetch(s.landing, { headers: UA });
    const page = await res.text();
    const found = page.match(s.discover)?.[0];
    if (found) return new URL(found, s.landing).href;
    console.warn(`  could not find current file link on ${s.landing}; using ${s.url}`);
  } catch (e) {
    console.warn(`  landing page fetch failed (${e.message}); using ${s.url}`);
  }
  return s.url;
}

function unzip(file, outDir) {
  return new Promise((resolve, reject) => {
    yauzl.open(file, { lazyEntries: true }, (err, zip) => {
      if (err) return reject(err);
      zip.on('error', reject);
      zip.on('end', resolve);
      zip.on('entry', (entry) => {
        if (entry.fileName.endsWith('/')) return zip.readEntry();
        zip.openReadStream(entry, (e, stream) => {
          if (e) return reject(e);
          // basename() keeps every entry inside outDir.
          pipeline(stream, createWriteStream(join(outDir, basename(entry.fileName)))).then(() => zip.readEntry(), reject);
        });
      });
      zip.readEntry();
    });
  });
}

for (const s of SOURCES) {
  const dest = join(RAW, s.file);
  if (existsSync(dest) && !force) {
    console.log(`skip  ${s.file} (exists)`);
  } else {
    const url = await resolveUrl(s);
    console.log(`fetch ${url}`);
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
    manifest[s.id] = { url, retrievedAt: new Date().toISOString(), bytes: statSync(dest).size };
  }
  if (s.unzipTo) {
    const out = join(RAW, s.unzipTo);
    mkdirSync(out, { recursive: true });
    await unzip(dest, out);
  }
  manifest[s.id] ??= { url: s.url, retrievedAt: statSync(dest).mtime.toISOString(), bytes: statSync(dest).size };
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('done');
