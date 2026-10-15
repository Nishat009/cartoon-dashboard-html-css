import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('frontend/public/images');
let before = 0;
let after = 0;
async function optimize(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (entry.isDirectory()) { await optimize(source); continue; }
    if (!entry.name.endsWith('.jpg')) continue;
    const background = entry.name === 'bg.jpg';
    const target = source.replace(/\.jpg$/, '.webp');
    await sharp(source).rotate().resize({ width: background ? 1920 : 960, withoutEnlargement: true }).webp({ quality: background ? 78 : 80, effort: 6 }).toFile(target);
    const original = (await fs.stat(source)).size;
    const optimized = (await fs.stat(target)).size;
    before += original;
    after += optimized;
    console.log(`${path.relative(root, source)}: ${original} → ${optimized} bytes`);
  }
}
await optimize(root);
console.log(`Total: ${before} → ${after} bytes (${Math.round((1 - after / before) * 100)}% smaller)`);
