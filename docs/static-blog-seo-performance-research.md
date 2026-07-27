# Research: tối ưu blog static HTML cho SEO, scale và hiệu năng

Ngày khảo sát: 2026-07-27
Phạm vi: blog/notes được xuất thành static HTML bằng Next.js và phát hành trên
GitHub Pages; Firebase Hosting và CDN chỉ được xem như phương án triển khai có
điều kiện.

## Kết luận điều hành

Kiến trúc static-first hiện tại là lựa chọn đúng cho một blog đọc nhiều, cập
nhật theo đợt. `output: "export"` tạo HTML cho từng route và có thể được phục vụ
bởi bất kỳ static host nào; nó cũng loại bỏ server render khỏi đường đọc
production ([Next.js: Static Exports](https://nextjs.org/docs/app/guides/static-exports),
[`next.config.mjs`](../next.config.mjs)).

Không có một kỹ thuật nén hay một điểm Lighthouse đơn lẻ nào bảo đảm SEO hoặc
“performance tuyệt đối”. Google vẫn ưu tiên nội dung phù hợp; Core Web Vitals
chỉ là một phần của page experience và điểm tốt không bảo đảm thứ hạng
([Google Search: Page Experience](https://developers.google.com/search/docs/appearance/page-experience)).
Mục tiêu đo lường đúng là Core Web Vitals ở phân vị 75 của người dùng thật,
tách mobile và desktop: LCP không quá 2,5 giây, INP không quá 200 ms, CLS không
quá 0,1
([web.dev: Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)).

Phát hiện quan trọng nhất của đợt khảo sát này là sự lệch giữa CI và đường
truyền thật:

- CI đang tính ngân sách JavaScript/CSS bằng Brotli
  ([`scripts/verify-performance-artifact.mjs`](../scripts/verify-performance-artifact.mjs),
  [`specs/static-performance-budgets.md`](../specs/static-performance-budgets.md)).
- GitHub Pages tại thời điểm kiểm tra chuyển `/en/blog` bằng gzip khi client
  gửi `Accept-Encoding: gzip`, nhưng trả bản không nén khi client chỉ gửi
  `Accept-Encoding: br`.
- Vì vậy, Brotli hiện là thước đo so sánh nội bộ, chưa phải số byte người đọc
  thực nhận. Nếu tiếp tục dùng GitHub Pages, CI nên có thêm ngân sách gzip.
  Tạo sẵn file `.br` không giải quyết được việc này: server vẫn phải thương
  lượng `Accept-Encoding`, chọn representation và gửi đúng
  `Content-Encoding`
  ([MDN: Compression in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression)).

Độ tin cậy:

- **High** cho các giới hạn nền tảng, giao thức, SEO và Core Web Vitals vì dùng
  tài liệu chính thức và kiểm tra trực tiếp response.
- **Moderate** cho mức cải thiện dự kiến của từng thay đổi trong repo; cần trace
  trình duyệt và field data sau triển khai để định lượng.
- **Unknown** cho Core Web Vitals phân vị 75 hiện tại; repo đã có RUM contract
  nhưng nghiên cứu này không có dữ liệu production đủ để kết luận
  ([`specs/web-vitals-rum.md`](../specs/web-vitals-rum.md)).

## Baseline đã kiểm tra

### Kiến trúc và artifact

| Quan sát                                    | Bằng chứng hiện tại                                                                      | Ý nghĩa                                                                                                                                                                                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production dùng pure static export          | `output: "export"` trong [`next.config.mjs`](../next.config.mjs)                         | Không cần SSR cho đường đọc bài                                                                                                                                                                                                          |
| Image Optimization mặc định của Next bị tắt | `images: { unoptimized: true }` trong [`next.config.mjs`](../next.config.mjs)            | Ảnh bài viết phải được tối ưu trước build hoặc qua image CDN/custom loader; default loader không hoạt động trong static export ([Next.js: unsupported features](https://nextjs.org/docs/app/guides/static-exports#unsupported-features)) |
| Deploy chính lên GitHub Pages               | [`.github/workflows/nextjs.yml`](../.github/workflows/nextjs.yml) upload thư mục `out`   | Response headers và compression phụ thuộc Pages                                                                                                                                                                                          |
| Repo đã có đường deploy Firebase            | `fb-deploy` trong [`package.json`](../package.json), [`firebase.json`](../firebase.json) | Có phương án chuyển host ít thay đổi build hơn một migration framework                                                                                                                                                                   |
| Artifact `out` quan sát được                | `238M`, `11.505` file, `978` file HTML                                                   | Còn dưới giới hạn hiện hành nhưng tăng trưởng phải được gate; đây là snapshot local, không phải cam kết production                                                                                                                       |
| Canonical blog corpus                       | `205` JSON trong `content/blog-data/posts`, `496` JSON tính cả bản dịch                  | Authored-locale generation cần tiếp tục để tránh nhân route giả                                                                                                                                                                          |

Các số artifact trên được lấy từ:

```bash
du -sh out
find out -type f | wc -l
find out -type f -name '*.html' | wc -l
find content/blog-data/posts -type f -name '*.json' | wc -l
find content/blog-data -type f -name '*.json' | wc -l
```

Snapshot có thể cũ hơn working tree nếu `out` chưa được rebuild. Vì vậy chỉ
dùng nó làm capacity baseline, không dùng để khẳng định thay đổi source mới đã
được phát hành.

### Response production quan sát ngày 2026-07-27

Các lệnh:

```bash
curl -sS -I -H 'Accept-Encoding: identity' \
  https://nguyenlephong.github.io/en/blog
curl -sS -I -H 'Accept-Encoding: gzip' \
  https://nguyenlephong.github.io/en/blog
curl -sS -I -H 'Accept-Encoding: br' \
  https://nguyenlephong.github.io/en/blog
```

Kết quả:

| Request    | Response quan sát                                                           |
| ---------- | --------------------------------------------------------------------------- |
| `identity` | `content-length: 81849`, không có `Content-Encoding`                        |
| `gzip`     | `content-encoding: gzip`, `content-length: 19030`                           |
| `br`       | không có `Content-Encoding`, `content-length: 81849`                        |
| Cả ba      | `server: GitHub.com`, `cache-control: max-age=600`, `vary: Accept-Encoding` |

Đây là quan sát tại một thời điểm, không phải API contract của GitHub Pages.
Tài liệu giới hạn chính thức của Pages nêu published site không được lớn hơn
1 GB, deployment không quá 10 phút và soft bandwidth limit 100 GB/tháng
([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).
GitHub staff cũng xác nhận Pages chưa hỗ trợ cấu hình custom response headers
cho từng repository
([GitHub Community staff answer](https://github.com/orgs/community/discussions/54257)).

## Kiến trúc đích

```text
Authored JSON/HTML + source media
                 │
                 ▼
Schema, locale, canonical và content validation
                 │
                 ▼
Build-time transforms
  ├─ static HTML có nội dung chính
  ├─ route-owned CSS/JS
  ├─ responsive image variants
  ├─ search index, sitemap, robots
  └─ hashed/versioned assets
                 │
                 ▼
Artifact gates
  ├─ SEO invariants
  ├─ raw + gzip budgets
  ├─ Brotli advisory/future-host budgets
  ├─ route/file/capacity limits
  └─ browser trace on representative routes
                 │
                 ▼
Static host / CDN
                 │
                 ▼
HTML + critical CSS first
                 │
                 ├─ below-fold media lazily
                 └─ small client islands only when interaction is required
```

HTML ban đầu phải chứa nội dung đọc, heading, canonical, metadata và crawlable
links. Google khuyến nghị server-side hoặc pre-rendering vì nhanh hơn cho người
dùng/crawler và không phải mọi bot đều chạy JavaScript
([Google Search: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)).
JavaScript phía client chỉ nên giữ những chức năng thực sự tương tác như
analytics, reaction/share, search và canvas tùy chọn.

Trong working tree hiện tại, bài viết được render bởi Server Component và canvas
được tách thành enhancer tùy chọn
([`src/components/blog/BlogContent.tsx`](../src/components/blog/BlogContent.tsx),
[`src/components/blog/BlogWorkflowEnhancer.tsx`](../src/components/blog/BlogWorkflowEnhancer.tsx)).
Boundary này phù hợp với kiến trúc đích: giữ toàn bộ bài trong HTML, không
hydrate cả article body chỉ để sửa link hoặc vẽ một canvas.

## SEO contract cho từng bài

### 1. Search identity phải nhất quán

Mỗi bài indexable cần một title tự nhiên, ngắn gọn và riêng; tránh lặp
boilerplate hoặc nhồi từ khóa
([Google Search: title links](https://developers.google.com/search/docs/appearance/title-link)).
Meta description cũng phải riêng theo bài, nhưng Google có thể chọn đoạn nội
dung khác nếu phù hợp truy vấn hơn
([Google Search: snippets](https://developers.google.com/search/docs/appearance/snippet)).

Một URL indexable cần:

- self-canonical trong HTML;
- URL tuyệt đối và canonical trong sitemap;
- canonical, redirect và internal link không phát tín hiệu mâu thuẫn;
- không dùng `robots.txt` như cơ chế canonical.

Canonical là tín hiệu mạnh, sitemap là tín hiệu yếu hơn; kết hợp các tín hiệu
nhất quán làm kết quả chắc hơn
([Google Search: canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)).

### 2. Locale chỉ tồn tại khi thật sự có nội dung

Mỗi bản dịch phải liệt kê chính nó và mọi bản dịch hợp lệ bằng `hreflang`; HTML,
HTTP header và sitemap là các phương thức tương đương
([Google Search: localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)).
Không nên tạo route fallback indexable chỉ để đủ ma trận locale. Contract hiện
tại đã đi đúng hướng khi chỉ tạo authored article locale và chuyển locale
không có bản dịch về collection tương ứng
([`specs/authored-content-static-export.md`](../specs/authored-content-static-export.md)).

### 3. Nội dung và liên kết phải crawl được không cần interaction

Internal link cần là `<a href="...">`; Google không đảm bảo parse được các dạng
navigation không có `href`
([Google Search: crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)).
Infinite scroll hoặc “load more” không được là con đường duy nhất đến bài cũ:
mỗi page cần URL bền vững và các page phải nối tuần tự bằng link
([Google Search: lazy-loaded content](https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading)).

Điều này cũng có lợi cho scale: archive có pagination giới hạn kích thước HTML,
trong khi crawler vẫn khám phá được toàn bộ corpus. Prefetch do hover/intent có
thể cải thiện UX nhưng không thay thế link tĩnh.

### 4. Structured data là mô tả, không phải cam kết rich result

`Article` JSON-LD nên khớp với title, canonical URL, ảnh, tác giả,
`datePublished` và `dateModified` hiển thị trên trang. Google dùng markup này
để hiểu bài tốt hơn nhưng không bảo đảm rich result
([Google Search: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)).
Ngày hiển thị và ngày structured data phải nhất quán, trung thực và không dùng
ngày “mới” giả để tạo cảm giác cập nhật
([Google Search: publication dates](https://developers.google.com/search/docs/appearance/publication-dates)).

Không nên ưu tiên công sức cho `FAQPage` trên blog kỹ thuật cá nhân. Từ 2023,
FAQ rich results chỉ thường xuyên xuất hiện cho website y tế và chính phủ có
thẩm quyền; để lại markup không gây vấn đề nhưng cũng không phải đòn bẩy SEO
thực tế ở đây
([Google Search Central: FAQ rich result changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes)).

### 5. Sitemap phải mô tả corpus thật

Sitemap chỉ chứa canonical URLs tuyệt đối. `lastmod` chỉ có giá trị khi phản ánh
thay đổi nội dung đáng kể; Google bỏ qua `priority` và `changefreq`. Một sitemap
được giới hạn ở 50.000 URL hoặc 50 MB không nén; vượt ngưỡng phải chia file và
dùng sitemap index
([Google Search: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)).
Sitemap giúp discovery trên site lớn nhưng không bảo đảm crawl hoặc index
([Google Search: sitemaps overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)).

## Performance contract

### Core Web Vitals và cách đo

| Metric | Good ở p75 | Kiểm soát chính                                                  |
| ------ | ---------: | ---------------------------------------------------------------- |
| LCP    |  `≤ 2.5 s` | HTML sớm, CSS gọn, LCP resource dễ discover, không lazy-load LCP |
| INP    | `≤ 200 ms` | ít JavaScript, client islands nhỏ, chia long task                |
| CLS    |    `≤ 0.1` | kích thước ảnh/embed rõ ràng, không chèn UI bất ngờ              |

Ngưỡng là ngưỡng field ở phân vị 75, tách mobile/desktop
([web.dev: Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)).
Lighthouse và local traces phù hợp để chẩn đoán, nhưng không thay thế RUM/CrUX;
lab và field có population, network, device và lifecycle khác nhau
([web.dev: lab and field data differences](https://web.dev/articles/lab-and-field-data-differences),
[web.dev: tools to measure Web Vitals](https://web.dev/articles/vitals-tools)).

### LCP

Nếu LCP là ảnh, URL ảnh nên xuất hiện trực tiếp trong HTML ban đầu, không
`loading="lazy"`, và có thể dùng `fetchpriority="high"`. `preload` chỉ phù hợp
khi browser không thể discover resource đủ sớm
([web.dev: optimize LCP](https://web.dev/articles/optimize-lcp)).
Priority hint là gợi ý, không phải mệnh lệnh; đánh dấu quá nhiều resource là
`high` gây cạnh tranh băng thông
([web.dev: fetch priority](https://web.dev/articles/fetch-priority)).

Không nên mặc định preload hero cho mọi viewport. Nếu mobile dùng text LCP còn
desktop dùng ảnh, preload phải có `media` phù hợp và được kiểm tra để không tải
thừa. Repo đã ghi đúng nguyên tắc này cho Gallery
([`specs/static-page-seo-localization.md`](../specs/static-page-seo-localization.md)).

### JavaScript, hydration và INP

Long task giữ main thread và trì hoãn phản hồi input. Biện pháp có tác động
thực tế là giảm JavaScript ban đầu, dynamic-import phần không cần cho first
view, chia việc dài và tránh hydrate markup tĩnh
([web.dev: optimize long tasks](https://web.dev/articles/optimize-long-tasks),
[web.dev: script evaluation and long tasks](https://web.dev/articles/script-evaluation-and-long-tasks)).

Áp dụng cho repo:

- Article body giữ ở server/static boundary; chỉ canvas đặc biệt mới tải client
  enhancer.
- Archive search, engagement và Firestore tiếp tục defer theo intent/scroll.
- Không serialise toàn bộ nội dung hoặc catalog sang client nếu HTML đã chứa
  cùng dữ liệu.
- Gate direct JavaScript theo route, nhưng thêm gzip bên cạnh Brotli để phản ánh
  GitHub Pages hiện tại.

### Ảnh

`width`/`height` hoặc `aspect-ratio` phải được giữ cho ảnh và embed để browser
dành chỗ trước khi resource tải, giảm CLS
([web.dev: optimize CLS](https://web.dev/articles/optimize-cls)).
Ảnh ngoài viewport có thể `loading="lazy"`; ảnh LCP không được lazy-load
([web.dev: browser-level image lazy loading](https://web.dev/articles/browser-level-image-lazy-loading)).

WebP/AVIF thường giảm byte so với JPEG/PNG, nhưng resize đúng kích thước hiển
thị quan trọng không kém format
([web.dev: choose the right image format](https://web.dev/articles/choose-the-right-image-format)).
Một file 1440–1600 px duy nhất vẫn có thể over-deliver cho điện thoại. Pipeline
nên tạo 3–5 width variants, sau đó emit `srcset` và `sizes`; browser sẽ chọn
candidate theo viewport và density
([MDN: responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)).

Trade-off: nhiều variants làm tăng thời gian build, số file và dung lượng
artifact. Vì vậy chỉ sinh các width thực sự được layout dùng, deduplicate theo
content hash, và không tạo AVIF/WebP mới cho ảnh nhỏ hơn ngưỡng tiết kiệm đã
định.

### Third-party và resource hints

Third-party JavaScript có thể tạo network contention và main-thread work; nên
defer/async và chỉ tải phần không critical sau nội dung chính
([web.dev: third-party JavaScript](https://web.dev/articles/optimizing-content-efficiency-loading-third-party-javascript)).
`preconnect` chỉ nên dùng cho origin critical đã biết trước. Dùng quá nhiều sẽ
tiêu socket, TLS work và băng thông
([web.dev: preconnect and dns-prefetch](https://web.dev/articles/preconnect-and-dns-prefetch)).

Locale root hiện phát cả `preconnect` và `dns-prefetch` cho hai origin PostHog
([`src/app/[locale]/layout.tsx`](../src/app/[locale]/layout.tsx)). Analytics
không nằm trên critical content path, nên bốn hint này phải được giữ hay bỏ dựa
trên trace. Mặc định đề xuất:

- bỏ `preconnect` cho analytics nếu không có yêu cầu event trước first paint;
- nếu vẫn cần warm-up nhẹ, chỉ giữ một `dns-prefetch` cho origin thực sự được
  request;
- xác nhận không làm mất Do Not Track và privacy choices hiện có.

### Firestore Lite cho engagement

**Kết luận: phù hợp, confidence high về API contract; mức giảm byte thực tế vẫn
phải đo sau build.**

Production engagement hiện chỉ cần:

- `getDoc` để đọc counter;
- `setDoc(..., { merge: true })` cùng `increment` cho view/share;
- `runTransaction` để đổi reaction nguyên tử;
- App Check cho request ghi;
- không dùng `onSnapshot`, local persistence hoặc offline write queue.

Các call site nằm trong
[`src/lib/engagement/firebase-repository.ts`](../src/lib/engagement/firebase-repository.ts);
Firestore được lazy-load trong
[`src/lib/firebase/client.ts`](../src/lib/firebase/client.ts). Firestore Lite
hỗ trợ trực tiếp `getDoc`, `setDoc`, `increment` và `runTransaction`. API
transaction sẽ retry callback khi document đã đọc bị thay đổi và dừng sau năm
lần commit không thành công
([Firestore Lite API reference](https://firebase.google.com/docs/reference/js/firestore_lite)).
Callback reaction hiện chỉ tính state và ghi transaction; side effect UI hoặc
`localStorage` ở ngoài callback. Điều này phải được giữ vì transaction có thể
chạy lại.

Firebase mô tả Lite là SDK REST-only, modular/tree-shakeable cho read/write
online. Nó bỏ latency compensation, offline cache, query resumption, snapshot
listeners và persistence helpers để giảm library size/startup time
([Firebase: Cloud Firestore Lite Web SDK](https://firebase.google.com/docs/firestore/solutions/firestore-lite)).
Semantics này khớp engagement best-effort hiện tại: code trả `null`/`false` khi
offline hoặc provider lỗi. Nó sẽ **không còn phù hợp** nếu sản phẩm sau này cần
realtime counters, optimistic local snapshots, đọc cache khi offline hoặc queue
write để gửi lại sau khi có mạng. `getDoc`/`setDoc` của Lite đều fail khi client
offline, thay vì đọc local cache hay buffer write
([Firestore Lite `getDoc`/`setDoc`](https://firebase.google.com/docs/reference/js/firestore_lite.md#getdoc)).

App Check không phải blocker cho Lite. Tài liệu App Check liệt kê Cloud
Firestore là dịch vụ được hỗ trợ và yêu cầu request có token hợp lệ khi
enforcement bật
([Firebase App Check](https://firebase.google.com/docs/app-check)).
Quan trọng hơn, source chính thức của Firebase JS SDK đăng ký
`firestore/lite` với `LiteAppCheckTokenProvider` lấy từ provider
`app-check-internal`
([Firebase JS SDK 12.15.0: Lite registration](https://github.com/firebase/firebase-js-sdk/blob/firebase%4012.15.0/packages/firestore/lite/register.ts)).
Provider này lấy App Check token và tạo header `x-firebase-appcheck`
([Firebase JS SDK 12.15.0: credentials source](https://github.com/firebase/firebase-js-sdk/blob/firebase%4012.15.0/packages/firestore/src/api/credentials.ts)).
Vì vậy import `firebase/firestore/lite` vẫn tham gia App Check integration; không
cần tự gắn token vào REST request.

Trade-offs và guardrails:

| Quyết định                                                 | Lợi ích                                                      | Mất đi/rủi ro                                                           | Guardrail                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Dùng `firebase/firestore/lite` trong production engagement | SDK và startup nhỏ hơn; API đủ cho one-shot CRUD/transaction | Không realtime, offline cache, latency compensation hay buffered writes | Source gate cấm `firebase/firestore` full SDK trong production engagement |
| Dynamic-import Lite sau intent/scroll                      | Không đưa Firestore vào initial blog/archive graph           | Lần interaction đầu có network/import latency                           | Prefetch chỉ theo intent, không eager-load ở document start               |
| App Check khởi tạo trước `getFirestore`                    | Write có token trước khi enforcement xử lý                   | First use phải chờ attestation; có thể timeout/fail                     | Giữ fail-closed cho required mode và smoke test request thật              |
| Lite transaction cho reaction                              | Giữ atomicity và retry conflict                              | Callback có thể chạy nhiều lần, request online-only                     | Callback thuần, không analytics/UI/storage side effect                    |

Không nên ghi một con số bundle saving lấy từ marketing hoặc package size. Sau
fresh production build, hãy so sánh direct/lazy chunk graph giữa full SDK và
Lite ở cùng Firebase version, cả raw, gzip và Brotli. Chỉ hạ budget sau khi
artifact chứng minh mức giảm. Unit test và emulator test vẫn có thể dùng full
SDK như test harness; hard gate cần kiểm tra **production source/chunk**, không
được coi import trong `tests/` là regression.

## Compression và cache: phần nào áp dụng được trên GitHub Pages

| Kỹ thuật                           | GitHub Pages hiện tại                    | Cần CDN/server có quyền header | Lưu ý                                                                               |
| ---------------------------------- | ---------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------- |
| Minify HTML/CSS/JS khi build       | **Có thể áp dụng**                       | Không                          | Giảm source bytes trước mọi transport compression                                   |
| Resize, WebP/AVIF, `srcset`        | **Có thể áp dụng**                       | Không                          | Giá trị lớn nhất thường đến từ đúng dimensions/quality                              |
| Gzip transfer budget trong CI      | **Có thể áp dụng**                       | Không                          | Khớp response đang quan sát; không ép Pages dùng gzip                               |
| Brotli estimate trong CI           | **Có thể giữ**                           | Không                          | Chỉ là advisory/future-host metric khi Pages chưa trả Brotli                        |
| Upload file `.br`/`.gz` cạnh asset | **Không đủ**                             | **Có**                         | Server phải negotiate và đặt `Content-Encoding`; không nên làm tăng artifact vô ích |
| `Cache-Control` theo path          | **Không cấu hình được trong repo Pages** | **Có**                         | GitHub staff xác nhận custom headers chưa được hỗ trợ                               |
| `immutable` cho hashed assets      | **Không cấu hình được trong repo Pages** | **Có**                         | Cần host/CDN rule                                                                   |
| `no-cache`/revalidate cho HTML     | **Không cấu hình được trong repo Pages** | **Có**                         | Tránh cache HTML cũ trỏ tới asset mới/đã xóa                                        |
| Brotli/Zstandard ở edge            | **Không kiểm soát được**                 | **Có**                         | Host/CDN phải hỗ trợ negotiation                                                    |
| Edge TTL, purge, stale policy      | **Không kiểm soát được**                 | **Có**                         | Cần cache rules và vận hành purge                                                   |

Compression HTTP dựa trên `Accept-Encoding` và `Content-Encoding`; response nên
`Vary: Accept-Encoding`, và media vốn đã nén thường không nên nén transport lần
nữa
([MDN: Compression in HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Compression),
[MDN: Content-Encoding](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding)).

Nếu chuyển sang host có quyền header, cache policy đề xuất là:

| Path class                                       | Browser policy                        | Lý do                                      |
| ------------------------------------------------ | ------------------------------------- | ------------------------------------------ |
| HTML, sitemap, robots, search JSON không version | `public, max-age=0, must-revalidate`  | Cho phép lưu nhưng buộc xác thực freshness |
| `/_next/static/**` có content hash               | `public, max-age=31536000, immutable` | URL đổi khi bytes đổi                      |
| Ảnh/media có version hoặc content hash           | `public, max-age=31536000, immutable` | Cache dài an toàn khi URL bất biến         |
| Manifest/icon không version                      | TTL ngắn + revalidate                 | Có thể thay đổi mà URL giữ nguyên          |
| Service worker                                   | `max-age=0, must-revalidate`          | Tránh giữ worker cũ quá lâu                |

`immutable` chỉ an toàn cho URL thực sự đổi khi nội dung đổi. `no-store` không
phải lựa chọn mặc định cho HTML public vì nó loại bỏ lợi ích cache; `no-cache`
vẫn cho lưu và yêu cầu revalidation
([MDN: HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching),
[MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control)).

## Scale model và giới hạn tăng trưởng

Chi phí static export tăng theo số route thực sự được generate, số locale có
nội dung, số payload/metadata đi kèm và số biến thể ảnh:

```text
artifact ≈ shared hashed assets
         + Σ(route HTML + route payload + route metadata)
         + unique/versioned media
```

Không nên nhân `canonical posts × all configured locales` nếu translation
không tồn tại. Repo đã từng loại các fallback routes khỏi artifact và giữ
authored variants trong sitemap/hreflang
([`specs/authored-content-static-export.md`](../specs/authored-content-static-export.md)).
Đây là tối ưu scale quan trọng hơn một vài phần trăm minify HTML vì nó loại cả
route tree, payload và metadata không có giá trị tìm kiếm.

Các guardrail đề xuất:

1. Warning khi artifact đạt 60% host limit; hard fail ở mức nội bộ thấp hơn
   host limit đủ để còn headroom cho deploy packaging.
2. Gate số file, tổng raw bytes, tổng gzip bytes, route HTML lớn nhất và top-N
   assets lớn nhất.
3. Báo tăng trưởng theo commit, không chỉ kiểm tra ceiling tuyệt đối.
4. Chia sitemap trước khi chạm 50.000 URL/50 MB, không đợi deployment lỗi.
5. Pagination archive và search index theo shard khi corpus tăng; không nhúng
   toàn bộ corpus vào mỗi locale archive.
6. Build media theo cache/content hash để chỉ xử lý asset mới hoặc đã đổi.

Pages hiện có giới hạn published site 1 GB và deployment 10 phút; soft bandwidth
limit là 100 GB/tháng
([GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).
Với snapshot local `238M`, capacity chưa là blocker tức thời, nhưng ảnh variants
và locale routes có thể làm tăng file count nhanh nếu không deduplicate.

## Quyết định hosting

### A. Giữ GitHub Pages — đề xuất mặc định ngắn hạn

Phù hợp khi:

- traffic và artifact vẫn dưới giới hạn;
- chưa có field evidence cho thấy header/compression là bottleneck;
- ưu tiên vận hành đơn giản.

Áp dụng được ngay:

- static/server article body;
- responsive image pipeline;
- CSS/JS route ownership;
- gzip budgets và browser trace;
- SEO/canonical/hreflang/sitemap gates;
- giảm third-party hints.

Không nên làm:

- thêm `.br` sidecars với kỳ vọng Pages tự phục vụ;
- mô tả Brotli estimate là transfer production;
- đổi host chỉ để tăng Lighthouse score.

### B. Firebase Hosting — đường chuyển host ngắn nhất trong repo

Firebase Hosting phát static content qua CDN và tự phục vụ gzip hoặc Brotli;
`firebase.json` hỗ trợ custom response headers theo path
([Firebase Hosting](https://firebase.google.com/docs/hosting),
[Firebase Hosting full configuration](https://firebase.google.com/docs/hosting/full-config)).
Repo đã có `firebase.json` và `fb-deploy`, nên đây là phương án ít thay đổi build
hơn tự dựng server.

Trade-off:

- phải xác minh clean URL/404/redirect parity;
- phải chạy full SEO artifact và runtime checks trên preview;
- nếu đổi public origin, cần migration canonical, Search Console và redirect
  plan; không để hai origin cùng index cùng nội dung;
- cache header dài có thể giữ asset lỗi lâu nếu URL không version.

### C. CDN có cache rules, ví dụ Cloudflare — chỉ sau khi có custom domain

Cloudflare có thể thương lượng gzip/Brotli/Zstandard theo origin/content type và
cấu hình edge/browser TTL bằng cache rules
([Cloudflare compression](https://developers.cloudflare.com/speed/optimization/content/compression/),
[Cloudflare edge and browser TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/)).

Trade-off:

- thêm DNS, TLS, cache-rule và purge surface;
- browser TTL dài không bị xóa bởi edge purge, nên immutable URLs là bắt buộc;
- không có lợi đủ lớn nếu bottleneck thật là ảnh over-delivery hoặc client JS;
- cần custom domain; không thể biến `github.io` origin thành domain do mình
  quản lý.

Quyết định host nên dựa trên field data, bandwidth/capacity và nhu cầu security
headers, không dựa trên cảm giác rằng Brotli luôn đáng một migration.

## Kết quả đã áp dụng và xác minh ngày 2026-07-27

Phạm vi này giữ nguyên static export, locale routes, canonical/hreflang,
structured data và analytics contract hiện có.

1. Article body đã trở thành Server Component. Internal links trong body và
   FAQ được localize ngay trong HTML export; workflow canvas chỉ có một client
   boundary nhỏ và module vẽ chỉ được import khi bài thực sự có marker. Browser
   trace thấy một workflow runtime chunk được emit nhưng article thường request
   đúng 0 chunk.
2. Production engagement adapter đã chuyển từ full Firestore SDK sang
   Firestore Lite. SDK chunk giảm từ 583.567 raw / 171.758 gzip / 137.896
   Brotli bytes xuống 101.952 / 30.827 / 26.794 bytes, tương ứng giảm khoảng
   82,5% raw, 82,1% gzip và 80,6% Brotli. App Check và transaction contract
   hiện dùng vẫn được giữ. Đây là mức giảm của deferred provider SDK chunk,
   không phải 82% toàn route: representative Blog article initial JavaScript
   chỉ giảm từ 249.461 xuống 248.410 gzip bytes (0,4%) và từ 217.252 xuống
   215.709 Brotli bytes (0,7%) vì provider vốn đã nằm sau lazy boundary.
3. Artifact verifier hard-gate encoding thực tế của GitHub Pages: Gzip cho
   exact HTML matrix và cho initial JavaScript của sáu entry points; Brotli
   vẫn là gate riêng cho regression/host target. Fresh export đo được:

| Entry point   | HTML gzip | Initial JS gzip | Initial JS Brotli |
| ------------- | --------: | --------------: | ----------------: |
| Home          |    31.570 |         270.275 |           235.330 |
| Blog archive  |    18.947 |         246.838 |           214.455 |
| Notes archive |    17.466 |         246.728 |           214.372 |
| Blog article  |    15.763 |         248.410 |           215.709 |
| Notes article |    18.487 |         248.070 |           215.381 |
| Studio        |       n/a |         196.146 |           170.131 |

4. Runtime Service Worker cache reads/writes đã thành best-effort.
   `caches.open`, `cache.match` hoặc `cache.put` bị từ chối không còn làm mất
   một network response hợp lệ; install shell vẫn fail-closed để không phát
   hành offline snapshot thiếu.
5. Fresh export có 11.506 files, 210,9 MiB logical và 949 sitemap URLs. Các
   artifact, SEO, pagination, Studio, runtime-boundary và offline verifiers đều
   được chạy trên export này.

Giới hạn còn lại:

- Field Core Web Vitals p75 sau thay đổi là `unknown` vì chưa deploy và chưa có
  cửa sổ RUM/CrUX mới. Lighthouse cũ chỉ là một cold synthetic run, không thay
  thế field data.
- Gzip budget mới bao phủ exact HTML và initial JavaScript; CSS/search JSON
  gzip gate, responsive image variants, category pagination và third-party
  loading policy vẫn là work tiếp theo.
- GitHub Pages vẫn kiểm soát response compression/cache headers. Checked-in
  `.br` sidecars không tự tạo content negotiation; Brotli/immutable cache cần
  host hoặc CDN có quyền cấu hình header.

## Lộ trình áp dụng theo ưu tiên

### P0 — làm số đo khớp production

1. Thêm gzip bytes cho route JS, CSS, HTML và search JSON trong artifact
   verifier.
2. Giữ Brotli như advisory hoặc hard gate riêng cho Firebase/CDN target; không
   dùng nó làm đại diện duy nhất cho Pages.
3. Thêm smoke test live cho HTML và một hashed asset:
   `Content-Type`, `Content-Encoding`, `Vary`, `Cache-Control`, status và
   canonical.
4. Giữ RUM `web_vital`; dashboard dùng p75 mobile/desktop và báo `unknown` khi
   thiếu sample.

Kết quả mong đợi: báo cáo CI tương ứng với bytes thực trên GitHub Pages.
Trade-off: gzip budget có thể cao hơn Brotli và phải baseline lại.
Xác minh: artifact test, `curl --compressed`, cold browser trace, RUM sau deploy.

### P1 — giảm bytes có giá trị nhất

1. Giữ article HTML ở static/server boundary; canvas hoặc widget thành client
   island có điều kiện.
2. Tạo responsive variants cho ảnh bài có kích thước lớn; emit đúng
   `srcset`/`sizes`, width/height, lazy/priority policy.
3. Dùng Firestore Lite cho one-shot engagement, giữ full SDK ngoài production
   graph và đo chunk delta bằng raw/gzip/Brotli.
4. Đo và bỏ các PostHog preconnect không cải thiện LCP/analytics requirement.
5. Theo dõi top-N route JS/CSS, top-N image và transfer delta theo commit.

Kết quả mong đợi: giảm mobile transfer, parse/evaluate và main-thread work.
Trade-off: image build tốn CPU/storage; client-island split cần kiểm tra
analytics và interaction.
Xác minh: Playwright request log, Lighthouse trace, image candidate thực nhận,
long tasks, LCP resource discovery và regression tests.

### P2 — chỉ khi cần quyền cache/compression

1. Chọn Firebase hoặc custom-domain CDN, không vận hành hai canonical origin.
2. Cấu hình cache matrix theo content-addressability.
3. Bật negotiated Brotli ở host; không commit sidecar nếu host tự nén.
4. Test cache freshness qua hai lần deploy và rollback.

Kết quả mong đợi: text transfer nhỏ hơn và hashed assets cache dài.
Trade-off: migration SEO, DNS, purge và stale-content risk.
Xác minh: response headers theo path, deploy/rollback drill, canonical parity,
Search Console và field RUM.

### P3 — scale corpus

1. Giữ authored-only locale generation.
2. Shard sitemap/search index khi đến ngưỡng đo được.
3. Cache image/OG generation theo content hash.
4. Theo dõi artifact slope và deployment duration; cảnh báo trước host limit.

Kết quả mong đợi: build/deploy tăng tuyến tính theo nội dung có giá trị, không
theo ma trận locale giả.
Trade-off: thêm manifest/cache invalidation logic.
Xác minh: full clean build, incremental build, artifact inventory và sitemap
validator.

## Trade-off ledger

| Quyết định                       | Lợi ích                                    | Chi phí/rủi ro                                         | Chọn khi                                           |
| -------------------------------- | ------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------- |
| Static HTML cho mọi article      | crawlable, TTFB ổn định, vận hành đơn giản | build/artifact tăng theo corpus                        | nội dung cập nhật theo đợt                         |
| Client islands                   | ít hydration, INP tốt hơn                  | boundary và test phức tạp hơn                          | phần lớn trang là nội dung đọc                     |
| Inline critical CSS              | có thể giảm render blocking                | nhân bytes vào mọi HTML, giảm cache reuse, CSP khó hơn | chỉ sau trace chứng minh CSS request là bottleneck |
| Preload/fetch priority           | kéo resource LCP sớm                       | tranh băng thông, duplicate/unused preload             | resource LCP đã xác định theo viewport             |
| Responsive image variants        | giảm mobile bytes                          | tăng build CPU/file count/storage                      | ảnh lớn xuất hiện thường xuyên                     |
| Cache một năm + immutable        | repeat view nhanh                          | stale lâu nếu URL không đổi                            | asset có content hash                              |
| Service worker/offline cache     | offline/repeat view tốt                    | stale/version/update complexity                        | offline là product requirement đã test             |
| Third-party analytics            | field visibility                           | network/main-thread/privacy cost                       | event data có mục đích rõ và được defer            |
| Chuyển host để có headers/Brotli | kiểm soát cache/compression/security       | DNS, SEO migration, vận hành và rollback               | field/capacity/security evidence đủ mạnh           |

## Acceptance criteria cho “done”

Một vòng tối ưu chỉ được xem là hoàn tất khi:

1. HTML ban đầu chứa title, description, canonical, robots, Article JSON-LD,
   visible date, H1 và nội dung chính.
2. Authored `hreflang` cluster reciprocal; fallback không bị index hoặc lọt
   sitemap.
3. Archive/pagination dùng crawlable `<a href>` và toàn bộ published corpus có
   đường khám phá tĩnh.
4. CI hard-gate raw + gzip bytes trên GitHub Pages target; Brotli được ghi rõ là
   advisory hoặc target cho host hỗ trợ.
5. LCP image nếu có không lazy-load; below-fold images lazy, có dimensions và
   nhận đúng responsive candidate.
6. Article không hydrate toàn bộ body; route trace không tải widget/canvas
   runtime khi bài không dùng.
7. Production engagement chunk dùng Firestore Lite, vẫn gửi App Check token khi
   enforcement bật và không hứa offline/realtime behavior.
8. Không có preconnect third-party không được chứng minh cần cho first view.
9. Header smoke test khớp target host; cache dài chỉ áp dụng cho URL versioned.
10. Core Web Vitals báo p75 theo mobile/desktop; thiếu data được ghi là
    `unknown`, không diễn giải thành pass.
11. Artifact size, file count, deployment duration và sitemap URL count có
    warning đủ sớm trước platform limit.

## Phạm vi áp dụng ngay và phạm vi cần quyết định hạ tầng

**Áp dụng ngay trên GitHub Pages:** static article HTML, server/client boundary,
responsive images, source minification, authored-only locales, pagination,
SEO/structured-data gates, gzip budgets, RUM và browser trace.

**Chỉ áp dụng sau khi chọn Firebase/CDN/server có quyền header:** custom
`Cache-Control`, `immutable`, CSP/security headers, Brotli/Zstandard được bảo
đảm, edge TTL, purge rules và phục vụ precompressed sidecars.

Ranh giới này cần được giữ trong implementation và PR description. Nếu không,
dự án có thể “pass” một ngân sách Brotli rất đẹp trong CI trong khi người đọc
trên GitHub Pages vẫn nhận representation khác.
