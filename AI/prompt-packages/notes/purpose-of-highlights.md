# Visual prompt package: purpose-of-highlights

Scope: `notes` article only, slug `purpose-of-highlights`.

Source read:
- `content/notes-data/posts/purpose-of-highlights.json`
- `content/notes-data/vi/posts/purpose-of-highlights.json`
- `AI/skills/calm-content-writer/SKILL.md`
- Approved reference pattern: commit `48ac924f16`, article `cross-functional-teams`

Generation status:
- Prompt package only. No image-generation service was called in this gate.
- No article JSON, public assets, routes, analytics, commits, or generated image files were changed.

Reference style:
- Photorealistic editorial/lifestyle images with lived-in desks, natural light, practical reading tools, plants, paper texture, and ordinary human attention.
- Human, calm, reflective, and grounded. Avoid productivity theater, generic stock reading imagery, mystical symbolism, and lecture-like visuals.
- No model-rendered readable text, article titles, UI labels, book titles, author names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any public person.

Article read:
- Core question: why highlight while reading, what should be highlighted, and how will the highlight be used later?
- Core warning: highlighting can feel productive while producing nothing if it has no future use.
- Core distinction: resonance marks lines that touched something already in the reader; asterisks mark ideas that need further thinking.
- Core takeaway: a useful highlight should point toward a future revisit, reuse, question, or action, not only the fear of missing out.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/purpose-of-highlights.png` | 1200x630 | n/a |
| Section photo | `public/assets/notes/purpose-of-highlights/resonance-reading-window.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/purpose-of-highlights/asterisk-follow-up-cards.png` | 1440x960 | `blog-photo-figure` |

Short-article recommendation:
- Use two inline images only. The article is a 2-minute note, so a separate lead plus two section images would make the page feel over-illustrated.
- Let the OG image carry the overall "highlighting with purpose" frame, then use the two inline images for the two useful highlight types: resonance and asterisks/future action.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no book titles, no author names, no logos, no brand marks, no model-rendered watermark, no poster, no signs, no fake dashboard labels, no UI labels, no company names, no exact author likeness, no celebrity likeness, no mystical symbolism, no glowing fantasy, no motivational-poster style, no distorted hands, no extra fingers, no stock-photo smile, no productivity influencer staging, no classroom lecture scene, no library stock-photo cliche.

## OG Prompt: Highlighting With Purpose

Primary prompt:

Photorealistic editorial lifestyle photograph for an article about highlighting only when a passage has a future use. A Vietnamese reader in a quiet apartment workspace sits at a warm wooden desk with an open book or e-reader showing only blurred line blocks and soft highlight bands, a pencil, a highlighter, blank index cards, and a notebook divided visually into two blank areas by paper placement rather than text. One blank card has a small simple star mark, another has a soft colored strip, suggesting two kinds of highlights without any readable writing. A face-down phone, ceramic cup, small plant, and morning window light make the scene lived-in and calm. The reader's posture is thoughtful, as if asking whether the mark will be revisited later. Documentary editorial photography, realistic skin texture, real paper texture, warm wood, soft greens, muted amber highlight color, 35mm lens, f/2.8, gentle depth of field. Wide 1.91:1-friendly composition, book or e-reader and blank cards centered, lower-right corner visually calm for a later local watermark. No readable text anywhere.

Generation:
- Export `1200x630`.
- Keep the reader, highlighted page, pencil/highlighter, and blank cards inside the central safe area.
- Make highlight marks abstract color bands only; no generated words, letters, numbers, book titles, or note labels.
- Leave the bottom-right corner visually calm for the local watermark.

## Section Prompt: Resonance Reading Window

Primary prompt:

Photorealistic editorial lifestyle photograph for the "resonance" type of highlight. A Vietnamese reader sits beside a quiet apartment window in soft late-afternoon light, pausing over an open book with all page text blurred into indistinct lines and one gentle highlight band. A blank bookmark and a small stack of blank note cards rest nearby; the reader holds a pencil loosely and looks reflective rather than busy. The image should suggest that a line matters because it touched something already present in the reader, not because it is objectively important. Warm wooden side table, plants, fabric curtain, tea cup, realistic hands, natural skin texture, calm human mood, documentary editorial style, 16:9 panorama, shallow but useful depth of field, muted cream paper, soft green plants, amber highlight accent, lower-right corner calm for local watermark. No readable text anywhere.

Generation:
- Export `1600x900`.
- Keep the book, one subtle highlight band, reader's hands, and blank cards readable as the main visual structure.
- The page may show blurred lines only; do not render any readable words, titles, marginal notes, or labels.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese reader pauses beside a window over a blurred book page with one soft highlight band and blank note cards nearby.`
- EN caption: `A resonant line earns its mark because it touches something already present in the reader.`
- VI alt: `Một người đọc Việt Nam dừng lại bên cửa sổ trước trang sách bị làm mờ, có một vệt highlight nhẹ và vài thẻ ghi chú trống bên cạnh.`
- VI caption: `Một dòng có tính cộng hưởng đáng được đánh dấu vì nó chạm vào điều vốn đã có sẵn trong người đọc.`

Insertion recommendation:
- EN: after the paragraph beginning `<strong>Resonance</strong>` and before the paragraph beginning `<strong>Asterisks</strong>`.
- VI: after the paragraph beginning `<strong>Cộng hưởng</strong>` and before the paragraph beginning `<strong>Dấu sao</strong>`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/purpose-of-highlights/resonance-reading-window.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Asterisk Follow-Up Cards

Primary prompt:

Photorealistic editorial lifestyle photograph for the "asterisks" and future-action idea in a reading note. A Vietnamese reader works at a warm desk after reading, with an open book or e-reader showing blurred lines and small abstract star-shaped margin marks, a pencil, a highlighter, and several blank index cards being arranged into a small follow-up queue. One card sits slightly forward beside an open blank notebook, suggesting an idea that needs more thought. A laptop is closed or mostly out of frame, phone face down, plants and desk lamp nearby. The scene should feel like turning a highlight into an open loop for later thinking, not collecting sentences out of fear of missing out. Documentary editorial photography, realistic paper, natural hands, practical desk tools, warm evening lamp mixed with soft window light, 50mm lens, f/3.2, 3:2 composition, lower-right corner calm for local watermark. No readable text anywhere.

Generation:
- Export `1440x960`.
- Keep the star marks simple and abstract; do not create letters, numbers, labels, or readable notes.
- Cards and notebook pages must be blank or show only faint paper texture.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese reader arranges blank follow-up cards beside a blurred highlighted page with small abstract star marks.`
- EN caption: `An asterisk is less a keepsake than an open loop: a place where the reader still owes the idea more thought.`
- VI alt: `Một người đọc Việt Nam sắp xếp các thẻ theo dõi trống bên cạnh trang sách mờ có highlight và vài dấu sao trừu tượng.`
- VI caption: `Dấu sao không giống một kỷ vật; nó là một vòng lặp còn mở, nơi người đọc vẫn còn nợ ý tưởng thêm suy nghĩ.`

Insertion recommendation:
- EN: after the paragraph beginning `<strong>Asterisks</strong>` and before `<h2 id="when">When to highlight</h2>`.
- VI: after the paragraph beginning `<strong>Dấu sao</strong>` and before `<h2 id="khi-nao">Khi nào highlight</h2>`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/purpose-of-highlights/asterisk-follow-up-cards.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes For Engineer

- Create `public/assets/notes/purpose-of-highlights/` during integration.
- Generate or select final PNGs from the prompts above, then resize/crop and watermark locally. Do not ask the image model to render the site watermark.
- Preserve article date, slug, topic, tags, author, locale routes, SEO behavior, analytics, and engagement behavior.
- Insert matching localized figure blocks into both EN and VI article JSON.
- Keep all generated page, notebook, card, screen, and margin content unreadable or abstract. This article depends on localization and should not contain model-rendered text inside images.
- If Designer wants the OG image to double as a lead image, export a separate `1600x900` crop from the OG direction, but keep only two inline images by default unless the article layout needs a lead.

## Verification Checklist

- Prompt package exists at `AI/prompt-packages/notes/purpose-of-highlights.md`.
- Generated repo files should exist at the exact target paths above after Engineer implementation.
- `file` or `sharp.metadata()` should report PNG with expected dimensions.
- EN and VI JSON should contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/purpose-of-highlights`, `/vi/notes/purpose-of-highlights`.
- OG image should resolve at `/og/notes/purpose-of-highlights.png`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
- Privacy: do not send private files, source screenshots, credentials, exact personal likenesses, or non-public repository content to any external image-generation service without explicit operator approval.
