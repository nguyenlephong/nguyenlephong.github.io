# Visual prompt package: healthy-disagreement

Scope: `notes` article only, slug `healthy-disagreement`.

Source read:
- `public/notes-data/posts/healthy-disagreement.json`
- `public/notes-data/vi/posts/healthy-disagreement.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical meeting rooms, desk tools, natural light, and everyday product work context.
- No model-rendered readable text, article titles, UI labels, company names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core warning: total agreement can mean people are not thinking independently, not paying attention, or not safe enough to speak.
- Core opposite: constant disagreement can also mean too many unknowns, too little shared background, or point-scoring debate.
- Core takeaway: healthy disagreement is the texture of people actually thinking; it should be welcomed without turning the room into a contest.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/healthy-disagreement.png` | 1200x630 | n/a |
| Lead/intro photo | `public/assets/notes/healthy-disagreement/question-in-design-review.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/healthy-disagreement/shared-map-review.png` | 1440x960 | `blog-photo-figure` |

Use separate generated scenes for OG and lead, both built around a calm design review. The section image should show shared context becoming visible through sketches and abstract cards.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no logos, no brand marks, no watermark, no poster, no signs, no fake dashboard labels, no UI labels, no company names, no exact author likeness, no celebrity likeness, no surreal AI robot, no glowing fantasy, no motivational-poster style, no distorted hands, no extra fingers, no stock-photo handshake, no shouting, no angry debate, no courtroom scene, no winner/loser body language.

## OG Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese product/design team in a modern meeting room during a calm design review, gathered around a wooden table with laptops, a tablet showing only abstract blurred blocks, blank sticky notes, pens, notebooks, and coffee cups. One teammate gently raises a question with an open hand while the others lean in and listen thoughtfully, showing healthy disagreement as careful attention rather than conflict. The scene should feel vivid, human, context-aware, and grounded in everyday software/product work. Warm modern office, practical meeting room, plants, soft daylight through glass, lived-in desk texture, documentary editorial photography, realistic skin texture, natural fabric, vivid but restrained colors, wide 1.91:1-friendly composition, lower-right corner kept visually calm for local watermark.

Generation:
- Export `1200x630`.
- Keep the question gesture, listeners, tablet, and table context in the central safe area.
- Leave the bottom-right corner visually calm for the local watermark.

## Lead Prompt: Question In Design Review

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese product/design team in a calm design review at a wooden table. A prototype is open on a tablet as soft abstract rectangles only, with no readable words. Most teammates are listening; one teammate gently raises a thoughtful question with a pen over a blank notebook, making the room feel alert instead of automatically agreeable. The image should communicate that a little friction means people are actually thinking. Modern Vietnamese office meeting room, glass wall, plants, laptops, blank sticky notes, notebooks, coffee cups, practical tools, documentary editorial photography, realistic skin texture, natural hands, natural fabric, vivid but restrained colors, 16:9 panorama, lower-right corner kept visually calm for local watermark.

Generation:
- Export `1600x900`.
- Keep all screens and notes abstract or blank.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese design review team listens while one teammate raises a careful question beside a tablet prototype.`
- EN caption: `A little respectful friction can show that the room is awake, not that the idea is in danger.`
- VI alt: `Một nhóm design review Việt Nam lắng nghe khi một đồng đội nêu câu hỏi thận trọng bên cạnh prototype trên tablet.`
- VI caption: `Một chút ma sát tôn trọng cho thấy căn phòng đang thật sự tỉnh táo, không phải ý tưởng đang gặp nguy.`

Insertion recommendation:
- EN: after the first paragraph ending `genuinely good idea.`
- VI: after the first paragraph ending `một ý tưởng thật sự tốt.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/healthy-disagreement/question-in-design-review.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Shared Map Review

Primary prompt:

Photorealistic editorial lifestyle photograph of a quieter moment after a design review, where two Vietnamese teammates compare blank sketches and abstract diagram cards on a wooden table while a third teammate listens from the side. One sketch is being tested with a pen hovering above it; another card is set aside, suggesting disagreement has become specific evidence rather than point-scoring. The scene should support the idea that people can argue past each other from different maps unless they make the shared background visible. Warm office corner or project room with a glass wall, plants, laptops partly closed, sticky notes with no writing, blank index cards, simple abstract shapes only, documentary editorial photography, human, vivid, realistic skin texture, real paper texture, natural hands, 3:2 composition, lower-right corner kept visually calm for local watermark.

Generation:
- Export `1440x960`.
- Keep all physical artifacts blank or geometry-only.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `Three Vietnamese teammates compare blank sketches and abstract cards to build shared context before deciding.`
- EN caption: `Disagreement becomes healthier when people stop defending separate maps and make the shared picture visible.`
- VI alt: `Ba đồng đội Việt Nam so sánh các bản phác thảo trống và thẻ trừu tượng để tạo nền chung trước khi quyết định.`
- VI caption: `Bất đồng lành mạnh hơn khi mọi người thôi bảo vệ những tấm bản đồ riêng và cùng làm rõ bức tranh chung.`

Insertion recommendation:
- EN: after the second paragraph ending `different maps.`
- VI: after the second paragraph ending `những tấm bản đồ khác nhau.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/healthy-disagreement/shared-map-review.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated files were left under the Codex generated image directory and not edited in place.
- Do not ask the image model to render the site watermark, article title, prompt text, code text, UI labels, company names, or any readable writing.
- Do not change date, slug, tags, topic, SEO paths, analytics, or engagement behavior.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/healthy-disagreement`, `/vi/notes/healthy-disagreement`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
