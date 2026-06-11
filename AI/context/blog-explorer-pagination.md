# Blog Index — Search · Filter · Pagination

## Objective
Trang `/blog` (56 bài) quá dài → thêm phân trang, search, lọc theo tag/category,
giữ load time + SEO/web-vitals cao. Site là **Next.js 16 `output: export`** (tĩnh,
github.io) → không có server runtime.

## Current State — DONE ✅
Hướng đã chọn (user xác nhận): client-side instant, phân trang số cổ điển,
search + category pills + popular tags, 9 bài/trang.

Files:
- `src/components/blog/BlogExplorer.tsx` — client component chính. Search (debounce
  200ms, diacritics-insensitive cho tiếng Việt), lọc category + tag (AND), phân
  trang, đồng bộ URL `?q=&cat=&tag=&page=` qua `history.replaceState`. Gộp luôn
  fetch view-count Firestore (thay `BlogPostListClient`, đã xoá file đó).
- `src/components/blog/BlogPagination.tsx` — phân trang số windowed (1 … 4 5 6 … N).
- `src/components/blog/useDebouncedValue.ts` — hook debounce.
- `src/app/[locale]/blog/page.tsx` — tính `popularTags` (top 12), render `BlogExplorer`.
  JSON-LD vẫn liệt kê đủ 56 BlogPosting (SEO không phụ thuộc phân trang).
- `src/app/[locale]/blog/blog.css` — CSS explorer + pager (cuối file). Lưới nhiều
  cột **scoped `.blog-explorer .blog-post-list`** để không đổi layout trang category.
- `messages/{en,vi,zh,ja,ko,fr}.json` — thêm `Pages.blog.controls.*`.

SSR render đúng 9 card (DOM nhẹ, LCP nhanh, CLS thấp); JS chỉ thu hẹp hiển thị.
URL đọc 1 lần sau mount → không hydration mismatch.

## Verified
- `tsc --noEmit` clean, `eslint` clean, `prettier` formatted.
- `next build --turbopack` exit 0, 1379 trang tĩnh.
- `out/en/blog.html`: 9 blog-card, 56 BlogPosting JSON-LD, pager present.
- `out/vi/blog.html`: placeholder "Tìm bài viết…".

## Constraints
- Static export: search/filter/pagination phải client-side hoặc static routes.
- Prettier house style: **có** semicolon + double-quote (theo .prettierrc.mjs).
- `track()` analytics dùng union type chặt → KHÔNG thêm event blog (đã bỏ tracking).

## Next Steps (optional)
- (Tuỳ chọn) Verify tương tác trên trình duyệt thật (search lọc, pager, URL sync).
- (Tuỳ chọn) Cân nhắc đổi heading "latestHeading" cho khớp ngữ cảnh explorer.
- Commit khi user yêu cầu (chưa commit).
