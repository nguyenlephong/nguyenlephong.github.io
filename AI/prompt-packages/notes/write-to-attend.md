# Visual prompt package: write-to-attend

Scope: `notes` article only, slug `write-to-attend`.

Source read:
- `public/notes-data/posts/write-to-attend.json`
- `public/notes-data/vi/posts/write-to-attend.json`
- Approved reference: commit `48ac924f16`, `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with practical human context.
- Real desks, notebooks, tablets, pens, loose paper, tools, light, and ordinary routines.
- Calm, reflective, lived-in tone; tactile presence without motivational-poster energy.
- No model-rendered readable text, titles, logos, UI labels, signatures, brand marks, watermarks, or caption text inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

## Asset Plan

Final implemented assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/write-to-attend.png` | 1200x630 | n/a |
| Writing as presence photo | `public/assets/notes/write-to-attend/writing-as-presence.png` | 1600x900 | `blog-photo-panorama` |
| Processing fleeting notes photo | `public/assets/notes/write-to-attend/processing-fleeting-notes.png` | 1600x900 | `blog-photo-panorama` |

The article is short, with three compact paragraphs and two clear visual ideas: writing as embodied attention, and disposable notes as a light processing loop. Two in-article figures are enough.

## Common Negative Prompt

No readable text, no article title, no typography, no logos, no brand marks, no watermark, no poster, no signs, no fake dashboard labels, no UI labels, no readable notebook pages, no readable calendar dates, no app interface, no notification text, no distorted hands, no extra fingers, no uncanny faces, no celebrity likeness, no exact author likeness, no luxury/status signaling, no trophy imagery, no literal infographic, no abstract diagram, no fantasy, no surreal glow, no motivational-poster style, no corporate stock-photo staging.

## OG Prompt

Primary prompt used:

Photorealistic editorial lifestyle photo for an article about writing to attend: the act of writing as a way to pull attention back into the present. Show a calm Vietnamese or Southeast Asian adult professional at a modest desk, one hand holding a pen over loose blank paper while a tablet with a stylus sits nearby, a few simple doodle-like marks that are abstract and unreadable, a small cup, and everyday tools within easy reach. The page is not the destination; the body doing something concrete is the point. Quiet home-office or studio desk near a softly lit window, real lived-in surfaces, not a staged corporate office. One adult professional, natural posture, hands visible and anatomically plausible, focused but relaxed expression, no exact real-person likeness. Photorealistic editorial lifestyle photography, high-end magazine realism, vivid but natural. Wide horizontal composition, desk-level three-quarter angle, subject and writing tools inside the central safe area, a calm lower-right corner reserved for a later local watermark. Soft morning daylight, gentle shadows, present, reflective, grounded. Warm wood, soft paper whites, muted teal or green accent, neutral clothing. No readable words, no article title, no UI labels, no logos, no brand marks, no watermark, no model-rendered text, no spiritual or surreal imagery. Avoid fake typography, visible app screens, legible notebook pages, motivational poster style, stock-photo smile, distorted hands, extra fingers, luxury/status signaling, cluttered chaos.

Generation:
- Export `1200x630`.
- Keep the person, paper, tablet, and stylus inside the central safe area.
- Leave the bottom-right corner visually calm for the local watermark.

## Section Prompt: Writing As Presence

Primary prompt used:

Photorealistic editorial lifestyle scene showing writing as active attention. A Vietnamese or Southeast Asian adult professional sits close to a desk, writing by hand on blank loose paper while a tablet and stylus lie open beside the paper. The image should make the hand's physical effort feel central: pen pressure, paper texture, a few loose abstract doodles, and a calm pause in the middle of thought. The scene supports the idea that fleeting notes and doodles help the mind participate rather than drift. Quiet apartment desk or compact studio workspace with window light, nearby notebooks and simple stationery within reach. One adult professional, focused downward toward the page, hands visible and realistic, no exact author likeness. Photorealistic editorial lifestyle photography, real human texture, not corporate stock. Horizontal 16:9 panorama, close desk-level view emphasizing hands, pen, loose paper, and tablet; enough calm space in lower-right corner for local watermark. Soft daylight, attentive, tactile, grounded. Warm wood desk, off-white paper, charcoal tablet, muted green plant accent. Paper fibers, matte tablet screen, ceramic cup, natural desk grain. No readable words, no article title, no logos, no UI labels, no brand marks, no watermark, no model-rendered text. Avoid legible handwriting, fake app interfaces, motivational posters, surreal symbols, dramatic stress, distorted fingers, extra fingers, luxury/status signaling, cluttered chaos.

Generation:
- Export `1600x900`.
- Keep the paper marks abstract and unreadable.
- Leave lower-right corner free for local watermark.

Localized copy:
- EN alt: `A professional handwrites abstract marks on loose paper with a tablet and stylus nearby, using the body to stay with the thought.`
- EN caption: `Writing to attend works because the hand joins the thought; the page only needs to hold attention long enough for the mind to meet it.`
- VI alt: `Một người đi làm viết các nét trừu tượng trên giấy rời, bên cạnh tablet và bút cảm ứng, dùng chuyển động của tay để giữ mình ở lại với ý nghĩ.`
- VI caption: `Viết để chú tâm hiệu quả vì bàn tay cùng tham gia với ý nghĩ; trang giấy chỉ cần giữ sự chú ý đủ lâu để tâm trí gặp lại nó.`

Insertion:
- EN: after the opening paragraph.
- VI: after the opening paragraph.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/write-to-attend/writing-as-presence.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Processing Fleeting Notes

Primary prompt used:

Photorealistic editorial lifestyle scene about processing disposable fleeting notes after they have served their purpose. Show a quiet desk where a Vietnamese or Southeast Asian adult professional is sorting small loose blank note cards and scraps into simple piles: one neat tray for actions to keep, one notebook open with no readable text, and a small paper recycling basket nearby for used notes. The mood should show release and clarity, not wastefulness: process the note, keep what matters, then let the scratch page go. Modest home-office desk in late afternoon, practical tools within reach, calm everyday environment. One adult professional visible from torso/hands, hands sorting blank cards and loose sheets, natural anatomy, no exact real-person likeness. Photorealistic editorial lifestyle photography, grounded, human, context-aware. Horizontal 16:9 panorama, tabletop view with hands, note cards, tray, notebook, and recycling basket; leave lower-right corner visually calm for local watermark. Warm late-afternoon light, reflective, tidy, quietly decisive. Warm wood, off-white paper, muted gray tray, soft green plant accent, neutral clothing. Paper edges, recycled paper basket, notebook cloth cover, ceramic cup. No readable words, no article title, no labels, no logos, no brand marks, no watermark, no model-rendered text. Avoid legible handwriting, trashy mess, dramatic destruction, fake UI screens, labels on trays, motivational poster style, distorted hands, extra fingers, luxury/status signaling, surreal imagery.

Generation:
- Export `1600x900`.
- Keep cards, notebook, and basket visually simple with no readable text.
- Leave lower-right corner free for local watermark.

Localized copy:
- EN alt: `A professional sorts blank loose note cards beside an open notebook and a paper basket after processing fleeting notes.`
- EN caption: `Disposable notes stay light when the useful pieces are extracted and the scratch pages are allowed to leave.`
- VI alt: `Một người đi làm phân loại các mảnh ghi chú trống bên cạnh cuốn sổ mở và giỏ giấy sau khi xử lý các ghi chú thoáng qua.`
- VI caption: `Ghi chú dùng xong bỏ giữ được sự nhẹ nhõm khi phần hữu ích đã được rút ra, còn trang nháp được phép rời đi.`

Insertion:
- EN: after the closing paragraph.
- VI: after the closing paragraph.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/write-to-attend/processing-fleeting-notes.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes

- Final assets were generated with the built-in image generation tool, then resized/cropped locally with Sharp.
- Original generated files remained outside the repo under the Codex generated-images directory.
- Add all watermarks locally after generation, not in prompts.
- Use PNG exports with final dimensions embedded in the figure snippets.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the article date, slug, tags, topic, SEO paths, analytics, engagement behavior, and unrelated files.

## Verification Checklist

- Generated files exist at the exact paths above.
- `sips` reports PNG images with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt/caption.
- Local routes load without broken images: `/en/notes/write-to-attend`, `/vi/notes/write-to-attend`.
- OG image resolves at `/og/notes/write-to-attend.png`.
- `npm test`, `npm run typecheck`, and `npm run build:fast` pass after implementation.
- Nothing leaves local execution except the explicitly approved image-generation prompts.
