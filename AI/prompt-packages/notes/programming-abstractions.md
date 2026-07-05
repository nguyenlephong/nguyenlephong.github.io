# Visual prompt package: programming-abstractions

Scope: `notes` article only, slug `programming-abstractions`.

Source read:
- `public/notes-data/posts/programming-abstractions.json`
- `public/notes-data/vi/posts/programming-abstractions.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical desks, laptops, paper tools, natural light, and ordinary software work context.
- Calm, reflective, lived-in tone; the technical metaphor should feel tactile and human, not like a synthetic architecture poster.
- No model-rendered readable text, article titles, code text, UI labels, company names, logos, signatures, brand marks, watermarks, or caption text inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle white text on a low-contrast dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core claim: every abstraction is a bet. A good one makes future changes easier; a premature one makes every later change harder to carry.
- Core warning: naming things and applying patterns feels satisfying, which is why the impulse needs restraint.
- Core cost: each intermediate layer drains reader cognition, especially for future readers who lack the original context.
- Core practice: keep code direct enough to trace, and generalize later when reality has shown the shape of the problem.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/programming-abstractions.png` | 1200x630 | n/a |
| Lead/bet photo | `public/assets/notes/programming-abstractions/abstraction-bet-desk.png` | 1600x900 | `blog-photo-panorama` |
| Section/cost photo | `public/assets/notes/programming-abstractions/comprehension-cost-review.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`. The article is short and has two clear themes, so two in-article figures are enough; a third image would make the page feel heavier than the note.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no code snippets, no UI labels, no dashboard labels, no logos, no brand marks, no watermark, no signature, no posters, no wall signs, no company names, no exact author likeness, no celebrity likeness, no robot, no holographic architecture, no sci-fi glow, no fantasy abstraction diagram, no motivational-poster style, no corporate stock-photo handshake, no distorted hands, no extra fingers, no uncanny faces, no branded stacking-block game.

## OG And Lead Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese software engineer at a warm, lived-in desk during late afternoon, evaluating whether to add another abstraction to a small codebase. On the desk, show a laptop with an intentionally blurred abstract software workspace made only of soft panels and blocks, a notebook with blank pages, a few blank index cards arranged like possible layers, and a small unstable tower of plain unbranded wooden stacking blocks beside the keyboard. The person pauses with one hand near the cards and one hand near the laptop, thoughtful rather than stressed, conveying that an abstraction is a bet whose cost will be carried later. The scene should feel tactile, practical, and human: wood grain, paper texture, pen, coffee mug, small plant, realistic hands, natural fabric. Documentary editorial photography, 35mm lens, gentle depth of field, soft window light mixed with warm desk-lamp light, vivid but restrained colors. Wide 16:9-friendly composition that can also crop to 1.91:1 for OG; keep the person, laptop, blank cards, notebook, and wooden block tower inside the central safe area; leave the lower-right corner visually calm for a local watermark added later.

Generation:
- Lead crop: export `1600x900`.
- OG crop: export `1200x630`.
- Keep all notebook pages, cards, and screens blank or abstract.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese software engineer pauses at a desk beside blank design cards, a laptop with abstract panels, and a small unstable tower of wooden blocks.`
- EN caption: `An abstraction can make the next change easier, but only if the bet matches the problem that reality eventually reveals.`
- VI alt: `Một kỹ sư phần mềm Việt Nam dừng lại bên bàn làm việc với thẻ thiết kế trống, laptop hiển thị các khối trừu tượng và một tháp gỗ nhỏ đang chênh vênh.`
- VI caption: `Một abstraction có thể làm thay đổi tiếp theo dễ hơn, nhưng chỉ khi ván cược ấy khớp với vấn đề mà thực tế dần lộ ra.`

Insertion recommendation:
- EN: after the paragraph ending `it starts to feel like a Jenga game where everyone already knows how it ends.`
- VI: after the paragraph ending `nó bắt đầu giống một ván Jenga mà ai cũng biết trước hồi kết.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/programming-abstractions/abstraction-bet-desk.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Comprehension Cost Review

Primary prompt:

Photorealistic editorial lifestyle photograph of two Vietnamese engineers in a quiet office nook reviewing a small architecture decision through physical layers. On a wooden table, show a direct line of blank cards and a separate overbuilt path made from many stacked transparent sheets, blank cards, and simple abstract line-and-block diagrams with no readable marks. One engineer traces the direct path with a finger while the other looks at the layered stack, suggesting the extra cognition required by every intermediate abstraction. Include a laptop or tablet nearby, but its screen must be blurred and abstract with no letters, numbers, UI labels, logos, or code. The mood should be calm and reflective, like a code review where the team is choosing clarity over cleverness. Realistic hands, paper edges, transparent material, pen, notebook, small plant, warm office daylight, documentary editorial photography, 50mm lens, useful shallow depth of field, vivid but restrained color. 3:2 composition for a `1440x960` crop; keep the direct path, layered stack, and hands central; leave the lower-right corner visually calm for a local watermark added later.

Generation:
- Export `1440x960`.
- Keep all diagrams geometry-only: plain lines, arrows, rectangles, and soft blocks, with no readable text.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `Two Vietnamese engineers compare a direct path of blank cards with a layered stack of abstract diagrams during a quiet review.`
- EN caption: `Each extra layer asks the next reader to carry more context before they can see what the runtime will actually do.`
- VI alt: `Hai kỹ sư Việt Nam so sánh một đường đi trực tiếp bằng thẻ trống với một chồng sơ đồ trừu tượng nhiều tầng trong buổi review yên tĩnh.`
- VI caption: `Mỗi tầng trung gian bắt người đọc kế tiếp gánh thêm bối cảnh trước khi thấy runtime thật sự sẽ chạy ra sao.`

Insertion recommendation:
- EN: after the paragraph ending `without holding a tower of indirection in their head.`
- VI: after the paragraph ending `mà không phải giữ cả một tòa tháp gián tiếp trong đầu.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/programming-abstractions/comprehension-cost-review.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Watermark Guidance

- Do not include any watermark request in the image-generation prompts.
- Add `nguyenlephong.github.io` only after generation through local post-processing.
- Match the approved `cross-functional-teams` treatment: bottom-right placement, small white text, low-contrast translucent dark rounded rectangle, subtle enough that it does not compete with the subject.
- Reserve calm visual space in the lower-right corner of every generated crop before watermarking.

## Generation Blockers And Risks

- No external image-generation service should receive private repo files, unpublished source content, or screenshots without explicit operator approval; this package is the local handoff artifact.
- The main generation risk is accidental readable text on cards, notebooks, screens, diagrams, or papers. Regenerate or locally mask any asset with visible letters, numbers, code, UI labels, or logo-like marks.
- Avoid making the lead image look like a branded Jenga product shot. The blocks should be plain, unbranded wooden stacking blocks used as a quiet metaphor.
- Avoid literal sci-fi abstraction visuals, robot assistants, glowing node graphs, and fake code editor screenshots. The article needs ordinary engineering judgment, not spectacle.

## Implementation Notes

- Generate final PNGs, resize/crop locally, and watermark locally after generation.
- Original generated source files should remain outside the repo; only final resized/watermarked PNGs should be copied into the target asset paths.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the article date, slug, tags, topic, SEO paths, analytics, engagement behavior, and unrelated files.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/programming-abstractions`, `/vi/notes/programming-abstractions`.
- OG image resolves at `/og/notes/programming-abstractions.png`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
