// One-off: rasterize public/favicon.svg into favicon.png (64) and a multi-size favicon.ico.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const pub = new URL('../public/', import.meta.url);
const svg = await readFile(fileURLToPath(new URL('favicon.svg', pub)));

const png = (size) =>
	sharp(svg, { density: 384 }).resize(size, size, { fit: 'contain' }).png().toBuffer();

// 64px PNG fallback.
await writeFile(fileURLToPath(new URL('favicon.png', pub)), await png(64));

// Build a PNG-embedded ICO with 16 and 32px entries.
const sizes = [16, 32];
const images = await Promise.all(sizes.map(png));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4); // count

const entries = [];
let offset = 6 + images.length * 16;
images.forEach((data, i) => {
	const e = Buffer.alloc(16);
	e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0); // width
	e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1); // height
	e.writeUInt8(0, 2); // palette
	e.writeUInt8(0, 3); // reserved
	e.writeUInt16LE(1, 4); // color planes
	e.writeUInt16LE(32, 6); // bits per pixel
	e.writeUInt32LE(data.length, 8); // size in bytes
	e.writeUInt32LE(offset, 12); // offset
	offset += data.length;
	entries.push(e);
});

const ico = Buffer.concat([header, ...entries, ...images]);
await writeFile(fileURLToPath(new URL('favicon.ico', pub)), ico);

console.log('favicon.png + favicon.ico regenerated');
