# Visual prompt package: indecisiveness

Scope: `notes` article only, slug `indecisiveness`.

Source read:
- `public/notes-data/posts/indecisiveness.json`
- `public/notes-data/vi/posts/indecisiveness.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical desks, paper tools, natural light, and ordinary human moments.
- No model-rendered readable text, article titles, UI labels, company names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core lived context: a pros-and-cons list can stop clarifying and start keeping someone stuck.
- Core example: choosing between two restaurants for too long, then feeling lighter once one choice becomes movement.
- Core takeaway: the goal is not always choosing perfectly; often it is choosing quickly enough to keep living.

## Final Assets

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/indecisiveness.png` | 1200x630 | n/a |
| Lead photo | `public/assets/notes/indecisiveness/pros-cons-stalemate.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/indecisiveness/start-walking-choice.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no signs, no logos, no brand marks, no UI labels, no app screens, no model-rendered watermark, no signatures, no posters, no celebrity likeness, no exact author likeness, no distorted hands, no extra fingers, no uncanny faces, no fantasy glow, no motivational-poster style, no stock-photo smile.

## OG And Lead Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at a modest wooden desk, paused between two ordinary choices that have become too equal. The person sits in soft morning apartment light with one hand holding a pen above an open notebook. The notebook is divided visually into two blank columns with only faint abstract lines and marks, no readable words, no letters, no numbers. Around it are blank sticky notes in two small piles, a mug, phone face down, laptop screen showing only blurred abstract shapes, and a small plant. The mood is thoughtful but not dramatic: the moment when careful comparison has stopped clarifying and started keeping someone still. Warm Vietnamese apartment or small home-office desk, lived-in but tidy, practical objects, no luxury/status signaling. Documentary editorial photography, realistic skin texture, real paper grain, natural hands, natural fabric, 35mm lens, gentle depth of field. Wide 16:9-friendly composition that can also crop to 1.91:1 for OG; keep the person, notebook, two blank choice piles, and desk tools in the central safe area; keep the lower-right corner visually calm for a local watermark added later.

Generation:
- Lead crop: export `1600x900`.
- OG crop: export `1200x630`.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese person pauses over a blank pros-and-cons notebook at a wooden desk with a laptop and sticky notes nearby.`
- EN caption: `A pros-and-cons list can clarify a choice, but after a point it can become another place to keep circling.`
- VI alt: `Một người Việt Nam dừng lại trước cuốn sổ pros-cons còn trống trên bàn gỗ, bên cạnh laptop và giấy ghi chú.`
- VI caption: `Bảng pros-cons có thể làm lựa chọn sáng hơn, nhưng quá một ngưỡng nó lại thành nơi khác để mình xoay vòng.`

Insertion recommendation:
- EN: after the paragraph about weighing pros and cons becoming the thing that keeps the writer circling.
- VI: after the paragraph about `càng cân đo hơn thiệt` and still becoming more hesitant.

## Section Prompt: Start Walking Choice

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at a small evening street corner with two modest restaurant entrances or cafe doorways nearby, neither showing any readable sign, logo, menu, letter, or number. The person has just made a choice and is starting to walk toward one doorway with relaxed shoulders, while holding a phone with a fully blurred blank map-like screen. A friend or partner can be slightly behind or beside them, also relaxed, but keep the scene candid and ordinary. The image should communicate the relief of committing to a good-enough choice after too much comparison, not perfect certainty. Everyday Vietnamese neighborhood street, warm restaurant lights, scooters and plants softly out of focus, practical sidewalk texture, no visible brand names. Documentary editorial lifestyle photography, human and grounded, realistic skin texture, natural clothing, real street texture, 50mm lens, shallow but useful depth of field. 3:2 composition for a 1440x960 in-article crop; person stepping forward in the central area, two choice paths subtly visible, lower-right corner visually calm for a local watermark added later.

Generation:
- Export `1440x960`.
- Any signage, phone screen, menus, shop fronts, receipts, and background objects must be blank, blurred, or abstract only.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `Two people step toward a warmly lit restaurant entrance on a quiet evening street after choosing where to go.`
- EN caption: `Once a good-enough choice becomes movement, the decision stops taking all the room.`
- VI alt: `Hai người bước về phía một quán ăn sáng đèn trên con phố tối sau khi đã chọn hướng đi.`
- VI caption: `Khi một lựa chọn đủ tốt đã thành bước chân, quyết định không còn chiếm hết không gian trong đầu.`

Insertion recommendation:
- EN: after the restaurant-choice paragraph, where picking one and walking lifts the weight.
- VI: after the paragraph where `chọn đại một quán và cất bước` makes the burden lighter.

## Implementation Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated source files were left under `codex-home/generated_images/...`; only final resized/watermarked PNGs were copied into the repo.
- The article is short, so two in-article images are enough; a third would crowd the page.
- Do not change date, slug, tags, topic, SEO paths, analytics, or engagement behavior.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/indecisiveness`, `/vi/notes/indecisiveness`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
