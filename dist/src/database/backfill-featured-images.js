"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const blogs_1 = require("./seed-data/blogs");
const prisma = new client_1.PrismaClient({
    adapter: new adapter_pg_1.PrismaPg(process.env.DATABASE_URL),
});
async function fetchFeaturedImageDataUri(slug) {
    const metaRes = await fetch(`https://iitrade.org/api/v1/blogs/slug/${slug}`);
    if (!metaRes.ok)
        return null;
    const json = (await metaRes.json());
    const imageUrl = json.data?.featuredImage;
    if (!imageUrl)
        return null;
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok)
        return null;
    const contentType = imageRes.headers.get('content-type') ?? 'image/jpeg';
    const buffer = Buffer.from(await imageRes.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString('base64')}`;
}
async function main() {
    let updated = 0;
    let skipped = 0;
    for (const post of blogs_1.blogsSeedData) {
        const existing = await prisma.blog.findUnique({
            where: { slug: post.slug },
            select: { id: true, featuredImage: true },
        });
        if (!existing) {
            console.log(`SKIP (not found in DB): ${post.slug}`);
            skipped++;
            continue;
        }
        if (existing.featuredImage) {
            console.log(`SKIP (already has image): ${post.slug}`);
            skipped++;
            continue;
        }
        try {
            const dataUri = await fetchFeaturedImageDataUri(post.slug);
            if (!dataUri) {
                console.log(`NO IMAGE FOUND: ${post.slug}`);
                skipped++;
                continue;
            }
            await prisma.blog.update({
                where: { id: existing.id },
                data: { featuredImage: dataUri },
            });
            console.log(`OK: ${post.slug} (${Math.round(dataUri.length / 1024)}kb)`);
            updated++;
        }
        catch (error) {
            console.error(`FAILED: ${post.slug}`, error);
            skipped++;
        }
    }
    console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`);
}
main()
    .catch((error) => {
    console.error(error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=backfill-featured-images.js.map