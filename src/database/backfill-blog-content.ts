// One-off script: for legacy posts whose content is still plain text (seeded
// from the prior site), pulls the real HTML content from iitrade.org's own
// public API — same source/endpoint backfill-featured-images.ts already uses
// for images — and stores it through the same sanitizer the admin editor
// uses. Safe to re-run — it skips any post whose content already has HTML.
// Run with: npx ts-node -r tsconfig-paths/register src/database/backfill-blog-content.ts [--dry-run]
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { blogsSeedData } from './seed-data/blogs';
import { sanitizeContent } from '../common/utils/sanitize';

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL as string),
});

const DRY_RUN = process.argv.includes('--dry-run');

// Same check IIT-Web's post-view.tsx uses to decide between rendering raw
// HTML vs. falling back to a plain-text paragraph split.
const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i;

async function fetchContentHtml(slug: string): Promise<string | null> {
  const res = await fetch(`https://iitrade.org/api/v1/blogs/slug/${slug}`);
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { content?: string } };
  const content = json.data?.content;
  if (!content || !HTML_TAG_REGEX.test(content)) return null;
  return content;
}

async function main() {
  let updated = 0;
  let alreadyHtml = 0;
  let noMatch = 0;
  let failed = 0;

  for (const post of blogsSeedData) {
    const existing = await prisma.blog.findUnique({
      where: { slug: post.slug },
      select: { id: true, content: true },
    });
    if (!existing) {
      console.log(`SKIP (not in DB): ${post.slug}`);
      continue;
    }
    if (HTML_TAG_REGEX.test(existing.content)) {
      console.log(`SKIP (already HTML): ${post.slug}`);
      alreadyHtml++;
      continue;
    }

    try {
      const rawHtml = await fetchContentHtml(post.slug);
      if (!rawHtml) {
        console.log(`NO HTML MATCH: ${post.slug}`);
        noMatch++;
        continue;
      }
      const clean = sanitizeContent(rawHtml);
      if (!DRY_RUN) {
        await prisma.blog.update({ where: { id: existing.id }, data: { content: clean } });
      }
      console.log(`${DRY_RUN ? 'WOULD UPDATE' : 'OK'}: ${post.slug} (${clean.length} chars)`);
      updated++;
    } catch (error) {
      console.error(`FAILED: ${post.slug}`, error);
      failed++;
    }
  }

  console.log(
    `\nDone. ${DRY_RUN ? 'Would update' : 'Updated'} ${updated}, already-HTML ${alreadyHtml}, no-match ${noMatch}, failed ${failed}.`,
  );
  console.log(
    'No-match/failed posts stay plain text (still renders fine via the paragraph fallback) — clean up manually in /admin/blogs if desired.',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
