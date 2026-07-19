# Visual prompt package: what-if-i-found-a-startup

Scope: `notes` article only, slug `what-if-i-found-a-startup`.

Source read:
- `content/notes-data/posts/what-if-i-found-a-startup.json`
- `content/notes-data/vi/posts/what-if-i-found-a-startup.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle workplace images with real human context, practical desks, natural light, and grounded product/software work.
- No model-rendered readable text, titles, UI labels, company names, logos, signatures, brand marks, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core frame: a hypothetical software company defined before any company exists.
- Culture: mission first, default to open, strong opinions loosely held, ship daily, no brilliant jerks, celebration of craft.
- Team and hiring: builder-first, cultural add, contract-to-hire, AI utilization, writing, autonomy, small pods, no middle management.
- Performance and communication: glory list instead of fixed OKRs, mentions as inbox, clear should/must communication, synchronous work used sparingly.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/what-if-i-found-a-startup.png` | 1200x630 | n/a |
| Lead/intro photo | `public/assets/notes/what-if-i-found-a-startup/mission-culture-table.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/what-if-i-found-a-startup/builder-first-project-review.png` | 1440x960 | `blog-photo-figure` |
| Section photo | `public/assets/notes/what-if-i-found-a-startup/glory-list-communication-rhythm.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no logos, no brand marks, no watermark, no poster, no signs, no fake dashboard labels, no UI labels, no company names, no readable whiteboard, no readable sticky notes, no readable notebook pages, no exact author likeness, no celebrity likeness, no AI robot, no fantasy glow, no luxury startup stereotype, no stock-photo handshake, no distorted hands, no extra fingers, no motivational-poster style.

## OG And Lead Prompt: Mission Culture Table

Primary prompt:

Photorealistic editorial lifestyle photograph for a reflective article about the principles someone would encode before founding a software startup. A small founding team of four generic Vietnamese/Asian adults gathers around a warm wood table in a modest modern Vietnamese software studio before the company exists. They are arranging blank index cards, a notebook, a laptop with blurred abstract interface blocks, and a tablet with simple abstract shapes. The scene should feel calm, deliberate, builder-oriented, and mission-first rather than celebratory. Early morning natural window light, plants, glass wall, practical office tools, documentary editorial framing, realistic hands and faces, vivid human texture, warm wood, charcoal, soft green plants, muted blue-gray screens, small amber highlights, no text in image.

Generation:
- Lead crop: 16:9, export `1600x900`.
- OG crop: 1.91:1, export `1200x630`.
- Keep the people, cards, and table context inside the central safe area.
- Leave the bottom-right corner visually calm for local watermark.
- Avoid literal mission statements, whiteboard writing, logos, and pitch-deck text.

Localized copy:
- EN alt: `A small Vietnamese founding team arranges blank cards and product tools around a warm office table before defining a startup culture.`
- EN caption: `Before there is a company to build, the first work is making the mission, trade-offs, and operating habits visible.`
- VI alt: `Một nhóm sáng lập Việt Nam xếp các thẻ trống và công cụ sản phẩm quanh bàn văn phòng ấm trước khi định hình văn hóa startup.`
- VI caption: `Trước khi có một công ty để xây, việc đầu tiên là làm rõ sứ mệnh, trade-off và những thói quen vận hành.`

Insertion recommendation:
- EN: after the opening mission paragraph, before `<h2 id="culture-values">`.
- VI: after the opening mission paragraph, before `<h2 id="van-hoa">`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/what-if-i-found-a-startup/mission-culture-table.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Builder-First Project Review

Primary prompt:

Photorealistic editorial lifestyle photograph for the team and hiring section of a reflective article about founding a software startup. Three generic Vietnamese/Asian adults review a tiny prototype or project demo in a small practical startup office. One builder presents work on a laptop while the others listen carefully, with a tablet, plain notebooks, blank sticky notes, coffee cups, and plants on a wooden project table. The scene should communicate builder-first hiring, contract-to-hire project work, autonomy, writing, and high agency without looking like a formal job interview. Warm office light, realistic skin texture, natural hands, practical craft, no text in image.

Generation:
- Export `1440x960`.
- Keep screens blurred and abstract.
- Keep notes blank or geometry-only.
- Leave lower-right corner clear for local watermark.
- Avoid stock interview scenes and handshake compositions.

Localized copy:
- EN alt: `Three Vietnamese teammates review a small prototype demo at a wooden startup table with laptops, blank notes, and careful attention.`
- EN caption: `Builder-first hiring is easier to judge when people can show how they move unclear work into a usable first version.`
- VI alt: `Ba đồng đội Việt Nam xem một bản prototype nhỏ bên bàn startup bằng gỗ, cạnh laptop, ghi chú trống và sự chú ý thận trọng.`
- VI caption: `Tuyển builder-first dễ nhìn hơn khi mọi người có thể cho thấy cách họ biến việc chưa rõ thành phiên bản đầu tiên dùng được.`

Insertion recommendation:
- EN: after the `Team & hiring` opening list, before `<h3 id="competencies">`.
- VI: after the `Đội ngũ & tuyển dụng` opening list, before `<h3 id="nang-luc-cot-loi">`.

## Section Prompt: Glory List Communication Rhythm

Primary prompt:

Photorealistic editorial lifestyle photograph for the performance evaluation and communication section of a reflective article about founding a software startup. Two generic Vietnamese/Asian teammates in a thoughtful one-on-one review a personal wins list and communication rhythm together in a calm small software office. On the warm wood table are blank cards sorted into small clusters, a notebook with abstract dots only, and a laptop showing blurred abstract message bubbles with no readable text. The image should suggest a glory list, mentions-as-inbox, cadence, acknowledgement, and clear communication without surveillance or pressure. Quiet, humane, focused, realistic, late afternoon warm light, practical team culture, no text in image.

Generation:
- Export `1440x960`.
- Keep all message screens abstract, with no labels or brand-like icons.
- Keep all paper/cards blank or geometry-only.
- Leave lower-right corner clear for local watermark.
- Avoid performance-review anxiety, leaderboards, trophies, and surveillance dashboards.

Localized copy:
- EN alt: `Two Vietnamese teammates review blank win cards and abstract message shapes during a calm one-on-one conversation.`
- EN caption: `A glory list and a clear mention rhythm turn recognition and communication into a shared practice, not a constant interruption.`
- VI alt: `Hai đồng đội Việt Nam xem các thẻ thành tích trống và hình khối tin nhắn trừu tượng trong một buổi one-on-one bình tĩnh.`
- VI caption: `Glory list và nhịp xử lý mention rõ ràng biến ghi nhận và giao tiếp thành một practice chung, không phải sự ngắt quãng liên tục.`

Insertion recommendation:
- EN: after the `Performance evaluation` list, before `<h2 id="tools-comms">`.
- VI: after the `Đánh giá hiệu quả` list, before `<h2 id="cong-cu-giao-tiep">`.

## Implementation Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated files were left under the Codex generated image directory and not edited in place.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the existing date, slug, tags, topic, author, SEO paths, analytics, engagement behavior, and data model.
- Do not ask the image model to render the watermark, site name, article title, company name, UI labels, code text, or any readable writing.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt text and captions.
- Local routes load without broken images: `/en/notes/what-if-i-found-a-startup`, `/vi/notes/what-if-i-found-a-startup`.
- OG image resolves at `/og/notes/what-if-i-found-a-startup.png`.
- `npm test`, `npm run typecheck`, and `npm run build:fast` pass after implementation.
