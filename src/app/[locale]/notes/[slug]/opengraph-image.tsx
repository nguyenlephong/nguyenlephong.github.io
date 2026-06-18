import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, OG_CONTENT_TYPE } from "@/app/_og/og-shell";
import { listNoteParams, loadNote } from "@/lib/notes/data";
import { buildDescription } from "@/lib/blog/seo";
import {
  hashOgParams,
  getCachedOg,
  saveOgCache,
  cachedOgResponse
} from "@/lib/og/cache";
import { filterOgStaticParams } from "@/lib/og/build-targets";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Ghi chú — Nguyen Le Phong";
export const dynamic = "force-static";

export function generateStaticParams() {
  return filterOgStaticParams(
    listNoteParams(),
    ({ locale, slug }) => `/${locale}/notes/${slug}`,
    { keepFirstWhenEmpty: true }
  );
}

type Params = { locale: string; slug: string };

export default async function OgImage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  const isVi = locale === "vi";
  const eyebrow = isVi ? "Ghi chép" : "Notes";
  const note = loadNote(slug, locale);
  if (!note) {
    return new ImageResponse(
      (
        <OgShell
          theme="dark"
          eyebrow={eyebrow}
          title={isVi ? "Không tìm thấy" : "Not found"}
        />
      ),
      { ...size }
    );
  }

  const subtitle = note.summary || buildDescription(note.html, 180);
  const hash = hashOgParams({
    locale,
    title: note.title,
    tags: note.tags,
    subtitle,
    readingMinutes: note.readingMinutes
  });
  const cacheKey = `notes-post-${locale}-${slug}-${hash}`;

  const cached = getCachedOg(cacheKey);
  if (cached) return cachedOgResponse(cached);

  const response = new ImageResponse(
    (
      <OgShell
        theme="ocean"
        eyebrow={eyebrow}
        title={note.title}
        subtitle={subtitle}
        chips={note.tags.slice(0, 4)}
        badge={{
          label: isVi ? "Đọc" : "Read",
          value: isVi
            ? `${note.readingMinutes} phút`
            : `${note.readingMinutes} min`
        }}
        titleSize={note.title.length > 48 ? 52 : 60}
      />
    ),
    { ...size }
  );

  await saveOgCache(cacheKey, response.clone());
  return response;
}
