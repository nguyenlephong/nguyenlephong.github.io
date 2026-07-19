# Visual prompt package: human-vs-ai-brain-elasticity

Scope: `notes` article only, slug `human-vs-ai-brain-elasticity`.

Source read:
- `content/notes-data/posts/human-vs-ai-brain-elasticity.json`
- `content/notes-data/vi/posts/human-vs-ai-brain-elasticity.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, desks, paper tools, natural light, plants, and ordinary human attention.
- No model-rendered readable text, article titles, UI labels, company names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core contrast: AI weights are frozen after training, while the human mind keeps reshaping itself through use.
- Core lived example: a frequently dialed phone number becomes one fluid gesture instead of many separate digits.
- Core takeaway: people connect ideas by abstracted meaning, not only by similar phrasing.

## Final Assets

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/human-vs-ai-brain-elasticity.png` | 1200x630 | n/a |
| Lead photo | `public/assets/notes/human-vs-ai-brain-elasticity/flexible-learning-desk.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/human-vs-ai-brain-elasticity/memory-becomes-gesture.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no UI labels, no phone keypad digits, no notifications, no logos, no brand marks, no watermark, no signatures, no posters, no exact author likeness, no celebrity likeness, no robot, no literal exposed brain, no sci-fi glow, no distorted hands, no extra fingers.

## OG And Lead Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph about human brain elasticity versus frozen AI weights, shown through an ordinary learning desk rather than a literal brain diagram. A Vietnamese professional sits at a warm apartment workspace in soft morning daylight, calmly revisiting a hard idea. One hand rearranges blank cards into new relationships while a laptop nearby shows only an abstract frozen grid of small blocks and soft node lines, all blurred and unreadable. The human side should feel flexible, lived-in, and actively learning; the software side should feel static and fixed without looking hostile. Include a wood desk, small plant, mug, pencil, notebook, blank index cards, realistic skin texture, natural fabric, real paper texture, documentary lifestyle style, 35mm lens, gentle depth of field, vivid but restrained color. Wide 16:9-friendly composition that can also crop to 1.91:1 for OG; keep person, laptop, cards, notebook, and hands inside the central safe area; leave the bottom-right corner visually calm for a local watermark added later.

Generation:
- Lead crop: export `1600x900`.
- OG crop: export `1200x630`.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese professional rearranges blank idea cards beside a notebook and a laptop showing an abstract frozen grid.`
- EN caption: `Human learning stays flexible because each use can quietly reshape how ideas connect.`
- VI alt: `Một người làm việc Việt Nam sắp lại các thẻ ý tưởng trống bên sổ tay và laptop hiển thị một lưới trừu tượng cố định.`
- VI caption: `Việc học của con người mềm dẻo hơn vì mỗi lần sử dụng đều có thể âm thầm đổi cách các ý tưởng nối với nhau.`

Insertion recommendation:
- EN: after the paragraph contrasting frozen AI weights with ongoing human rewiring.
- VI: after the paragraph contrasting weights đóng băng with sự tái nối dây lặng lẽ.

## Section Prompt: Memory Becomes Gesture

Primary prompt:

Photorealistic editorial lifestyle photograph showing how repeated use compresses separate steps into one fluid human memory gesture. A Vietnamese professional's hand moves naturally toward a smartphone with a completely dark or blurred blank screen, while nearby blank cards are arranged from a loose row into one compact stack, suggesting a phone number or routine remembered as one smooth action rather than many separate pieces. Use a modest apartment desk in late-afternoon light, warm wood surface, notebook with blank pages, blank cards, pencil, mug, and small plant. The scene should feel ordinary, human, and tactile, not like a technology advertisement. Photorealistic documentary editorial photo, realistic hands, natural skin texture, real paper grain, soft shadows, 50mm lens, shallow but useful depth of field, vivid but restrained color. 3:2 composition for an in-article figure; keep hand, phone, notebook, and card compression metaphor in the central area; leave the bottom-right corner visually calm for a local watermark added later.

Generation:
- Export `1440x960`.
- Keep phone screen blank or abstract; cards and notebook must have no readable writing.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A hand reaches toward a blank phone screen while loose blank cards gather into one compact stack on a wooden desk.`
- EN caption: `Repeated use can compress many small steps into one remembered motion.`
- VI alt: `Một bàn tay chạm tới màn hình điện thoại trống trong khi các thẻ trắng rời được gom thành một xấp gọn trên bàn gỗ.`
- VI caption: `Dùng lặp lại đủ lâu có thể nén nhiều bước nhỏ thành một chuyển động đã được nhớ.`

Insertion recommendation:
- EN: after the paragraph about the phone number becoming one fluid gesture.
- VI: after the paragraph about a phone number becoming one smooth motion.

## Implementation Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated files were left under `codex-home/generated_images/...`; only final resized/watermarked PNGs were copied into the repo.
- The article is short, so two in-article images are enough; a third would crowd the page.
- Do not change date, slug, tags, topic, SEO paths, analytics, or engagement behavior.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/human-vs-ai-brain-elasticity`, `/vi/notes/human-vs-ai-brain-elasticity`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
