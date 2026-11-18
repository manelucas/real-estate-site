// Downloads the official source files into data/raw/ and records when they were retrieved.
// Usage: npm run download   (pass --force to re-download existing files)
import { mkdirSync, existsSync, writeFileSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { SOURCES } from './sources.js';

const RAW = 'data/raw';
const force = process.argv.includes('--force');
mkdirSync(RAW, { recursive: true });

const manifestPath = join(RAW, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};

for (const s of SOURCES) {
  const dest = join(RAW, s.file);
  if (existsSync(dest) && !force) {
    console.log(`skip  ${s.file} (exists)`);
  } else {
    console.log(`fetch ${s.url}`);
    const res = await fetch(s.url, { headers: { 'User-Agent': 'Mozilla/5.0 (property-research-demo)' } });
    if (!res.ok) throw new Error(`${s.url} -> HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    manifest[s.id] = { url: s.url, retrievedAt: new Date().toISOString(), bytes: statSync(dest).size };
  }
  if (s.unzipTo) {
    const out = join(RAW, s.unzipTo);
    mkdirSync(out, { recursive: true });
    execFileSync('unzip', ['-o', '-q', dest, '-d', out]);
  }
  manifest[s.id] ??= { url: s.url, retrievedAt: statSync(dest).mtime.toISOString(), bytes: statSync(dest).size };
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('done');
