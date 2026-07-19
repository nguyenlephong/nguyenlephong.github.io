# Visual prompt package: code-run-on-people

Scope: `notes` article only, slug `code-run-on-people`.

Source read:
- `content/notes-data/posts/code-run-on-people.json`
- `content/notes-data/vi/posts/code-run-on-people.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical desks, natural light, and everyday software work tools.
- No model-rendered readable text, article titles, UI labels, company names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core question: if AI agents now write and read much of the code, what does "written for people to read" mean?
- Core shift: the human-readable artifact moves up from implementation details to intent.
- Core artifacts: prompt, spec, architectural decision, and durable context that a teammate can understand months later.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/code-run-on-people.png` | 1200x630 | n/a |
| Lead/intro photo | `public/assets/notes/code-run-on-people/intent-layer-desk.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/code-run-on-people/decision-record-review.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no logos, no brand marks, no watermark, no poster, no signs, no fake dashboard labels, no UI labels, no company names, no exact author likeness, no celebrity likeness, no surreal AI robot, no glowing fantasy, no motivational-poster style, no distorted hands, no extra fingers, no stock-photo handshake.

## OG And Lead Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese software engineer in a warm modern home-office desk during late afternoon, calmly writing clear technical intent in a plain notebook while a laptop beside them shows an abstract AI-assisted coding workspace made only of blurred blocks, panels, graph shapes, and flow shapes with no readable words. Include blank index cards, a pen, coffee cup, small plant, external keyboard, and lived-in desk texture. The posture should feel focused and human, like orchestrating work through intent rather than reading code line by line. Documentary editorial photography, realistic skin texture, natural fabric, soft window light mixed with warm desk lamp light, vivid but restrained colors, wide 16:9-friendly composition, lower-right corner kept visually calm for local watermark.

Generation:
- Lead crop: 16:9, export `1600x900`.
- OG crop: 1.91:1, export `1200x630`, keep the person, notebook, laptop, and desk context inside the central safe area.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese software engineer writes intent in a notebook beside a laptop showing abstract AI-assisted coding panels.`
- EN caption: `The human-readable layer has moved closer to intent: the prompt, the notebook, and the decision that tells the machine what kind of work to render.`
- VI alt: `Một kỹ sư phần mềm Việt Nam viết ý định vào sổ tay cạnh laptop hiển thị các khối làm việc trừu tượng của AI.`
- VI caption: `Tầng con người đọc được đang dịch gần hơn về ý định: prompt, ghi chú và quyết định nói cho máy biết cần hiện thực hóa điều gì.`

Insertion recommendation:
- EN: after the first paragraph ending `trusting the agent to render it.`
- VI: after the first paragraph ending `tin agent sẽ hiện thực hóa nó.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/code-run-on-people/intent-layer-desk.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Decision Record Review

Primary prompt:

Photorealistic editorial lifestyle photograph in a quiet Vietnamese product-engineering office at a wooden collaboration table, where two Vietnamese engineers and one product teammate calmly arrange completely blank index cards, colored sticky notes with no writing, and simple printed architecture diagrams made only of plain lines, arrows, rectangles, and soft colored blocks. The scene should suggest a prompt/spec/decision layer that future teammates can understand, but every page and card is visually blank or abstract. One person points to a blank decision path, another holds a pen over a blank card. Laptops may be present, but screens must show only blurred abstract panels with no letters. Human and grounded documentary editorial style, realistic hands and materials, soft warm office light, 3:2 composition for a `1440x960` crop, lower-right corner kept visually calm for local watermark.

Generation:
- Export `1440x960`.
- Keep all physical artifacts blank or geometry-only.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `Three Vietnamese teammates review blank cards and abstract architecture diagrams around a table before context gets lost.`
- EN caption: `A spec or decision record earns its keep when a teammate can reopen it months later and still see the reasoning, not just the result.`
- VI alt: `Ba đồng đội Việt Nam xem lại các thẻ trống và sơ đồ kiến trúc trừu tượng quanh bàn trước khi bối cảnh bị thất lạc.`
- VI caption: `Một spec hay decision record thật sự có ích khi vài tháng sau đồng đội mở lại vẫn thấy được reasoning, không chỉ thấy kết quả.`

Insertion recommendation:
- EN: after the final paragraph ending `from the implementation to the intent.`
- VI: after the final paragraph ending `từ phần hiện thực sang phần ý định.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/code-run-on-people/decision-record-review.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally, and watermarked locally after generation.
- Do not ask the image model to render the site watermark, article title, prompt text, code text, UI labels, company names, or any readable writing.
- Do not change date, slug, tags, topic, SEO paths, analytics, or engagement behavior.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/code-run-on-people`, `/vi/notes/code-run-on-people`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
