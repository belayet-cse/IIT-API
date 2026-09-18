"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const sharp_1 = __importDefault(require("sharp"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg({
        connectionString: process.env.DATABASE_URL,
        max: 3,
    }),
});
const MAX_WIDTH = 1000;
const JPEG_QUALITY = 78;
const SKIP_IF_UNDER_BYTES = 150 * 1024;
async function shrinkDataUri(dataUri) {
    const match = /^data:([^;]+);base64,(.+)$/s.exec(dataUri);
    if (!match)
        return null;
    const [, , base64] = match;
    const input = Buffer.from(base64, 'base64');
    const output = await (0, sharp_1.default)(input)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toBuffer();
    return `data:image/jpeg;base64,${output.toString('base64')}`;
}
async function main() {
    const posts = await prisma.blog.findMany({
        where: { featuredImage: { not: null } },
        select: { id: true, slug: true, featuredImage: true },
    });
    let processed = 0;
    let skipped = 0;
    let savedBytes = 0;
    for (const post of posts) {
        const original = post.featuredImage;
        if (!original.startsWith('data:image/')) {
            console.log(`SKIP (not a data URI): ${post.slug}`);
            skipped++;
            continue;
        }
        if (original.length < SKIP_IF_UNDER_BYTES) {
            console.log(`SKIP (already small, ${Math.round(original.length / 1024)}kb): ${post.slug}`);
            skipped++;
            continue;
        }
        try {
            const resized = await shrinkDataUri(original);
            if (!resized) {
                console.log(`SKIP (could not parse): ${post.slug}`);
                skipped++;
                continue;
            }
            if (resized.length >= original.length) {
                console.log(`SKIP (no improvement): ${post.slug}`);
                skipped++;
                continue;
            }
            await prisma.blog.update({
                where: { id: post.id },
                data: { featuredImage: resized },
            });
            const before = Math.round(original.length / 1024);
            const after = Math.round(resized.length / 1024);
            savedBytes += original.length - resized.length;
            console.log(`OK: ${post.slug} (${before}kb -> ${after}kb)`);
            processed++;
        }
        catch (error) {
            console.error(`FAILED: ${post.slug}`, error);
            skipped++;
        }
    }
    console.log(`\nDone. Processed ${processed}, skipped ${skipped}. Saved ~${Math.round(savedBytes / 1024 / 1024)}MB total.`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=resize-featured-images.js.map