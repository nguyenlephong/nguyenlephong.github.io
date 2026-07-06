# Visual prompt package: ai-reduces-the-information-privilege

Scope: `notes` article only, slug `ai-reduces-the-information-privilege`.

Source read:
- `public/notes-data/posts/ai-reduces-the-information-privilege.json`
- `public/notes-data/vi/posts/ai-reduces-the-information-privilege.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`
- Repo content guidance: `AI/skills/calm-content-writer/SKILL.md`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical desks, laptops, books, blank cards, notebooks, and natural light.
- Images should feel vivid, human, and grounded in ordinary learning/work, not abstract AI wallpaper.
- Use physical cues as the metaphor: books and open access for the old information moat, blank cards and a central question for the new edge of framing.
- No model-rendered readable text, titles, UI labels, logos, signatures, brand marks, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core idea: information used to be scarce because education, geography, language, and connections gated access.
- AI lowers that barrier, so owning facts matters less than abstract thinking, quality questions, and judgment.
- Practical shift: the bottleneck moves from having information to framing what you actually want.
- Article length: short, four prose paragraphs plus related-note links. Use two in-article images, not three, so the note stays reflective instead of becoming a gallery.

## Asset Plan

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/ai-reduces-the-information-privilege.png` | 1200x630 | n/a |
| Lead photo | `public/assets/notes/ai-reduces-the-information-privilege/open-knowledge-desk.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/ai-reduces-the-information-privilege/framing-better-questions.png` | 1440x960 | `blog-photo-figure` |

Use a separate OG export from the same desk-framing direction so the social crop keeps the person, laptop, books, and blank-card question work inside the central safe area.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no logos, no brand marks, no model-rendered watermark, no poster, no signs, no fake dashboard labels, no UI labels, no company names, no exact author likeness, no celebrity likeness, no AI robot, no glowing network brain, no fantasy, no luxury/status signaling, no stock-photo handshake, no motivational-poster style, no distorted hands, no extra fingers, no uncanny faces.

## OG Prompt

Primary prompt:

Create a photorealistic editorial lifestyle photograph for an article about AI lowering the old advantage of privileged information while making better framing and judgment more valuable. A Vietnamese or Southeast Asian adult professional sits at a modest modern study or quiet library table in natural late-afternoon light with a laptop showing only soft abstract blurred panels, several books stacked to one side, blank index cards, a notebook with no readable writing, a pen, and a mug. The person is calmly arranging scattered blank cards into one clear central card, suggesting information becoming accessible while the real skill becomes framing the right question. Practical and lived-in rather than luxurious, documentary editorial photography, realistic hands and materials, warm wood, soft whites, muted green accents.

Generation:
- Export/crop locally to `1200x630`.
- Keep the person, laptop, books, and central blank-card work in the central safe area.
- Leave the bottom-right corner visually calm for the local watermark.

## Lead Prompt: Open Knowledge Desk

Primary prompt:

Photorealistic editorial lifestyle image showing information access becoming less gated in the AI era, while a person still needs judgment and better questions. A Vietnamese or Southeast Asian adult professional works at a quiet public-library or coworking reading table with an open laptop showing only soft abstract blurred panels, a small stack of books with blank covers, blank note cards, a plain notebook with no readable writing, and a pen. Shelves sit softly in the background. The person is calmly drawing from many accessible sources and preparing to shape a better question, not passively consuming information. Modest and everyday, soft daylight, warm interior light, documentary feel.

Generation:
- Export/crop locally to `1600x900`.
- Keep every book cover, card, notebook page, screen, sign, and paper blank or abstract.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese professional works at a library desk with books, a laptop, and blank notes spread within reach.`
- EN caption: `When access becomes easier, the advantage starts moving from owning information to knowing how to approach the problem.`
- VI alt: `Một người Việt Nam làm việc ở bàn thư viện với sách, laptop và các ghi chú trống trong tầm tay.`
- VI caption: `Khi việc tiếp cận dễ hơn, lợi thế bắt đầu chuyển từ sở hữu thông tin sang biết cách đặt vấn đề.`

Insertion recommendation:
- EN: after the second paragraph ending `knowing what to do with them matters far more.`
- VI: after the second paragraph ending `biết làm gì với chúng quan trọng hơn nhiều.`
- Rationale: the image lands after the article names AI lowering access barriers and before the shift toward framing.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/ai-reduces-the-information-privilege/open-knowledge-desk.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Framing Better Questions

Primary prompt:

Photorealistic editorial lifestyle image about turning a messy, half-formed problem into a precise question for AI and then judging the answer. A Vietnamese or Southeast Asian adult professional works at a warm home-office or small studio desk with a laptop showing only abstract blurred response-like panels, blank cards, blank sticky notes, a notebook, a few books, and ordinary desk tools. The person gathers scattered blank notes into one focused central card; one hand holds a pen above the central blank card while the other moves away extra scattered cards. The scene should suggest compression, framing, and judgment without any readable writing.

Generation:
- Export/crop locally to `1440x960`.
- Keep all cards, sticky notes, notebook pages, screens, book covers, and papers blank or abstract.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese professional gathers scattered blank notes into one focused question beside a laptop.`
- EN caption: `The useful edge is often the moment a messy problem becomes a question precise enough to work with.`
- VI alt: `Một người Việt Nam gom các ghi chú trống rời rạc thành một câu hỏi tập trung bên cạnh laptop.`
- VI caption: `Lợi thế thực tế thường nằm ở khoảnh khắc một vấn đề rối được đóng khung thành câu hỏi đủ rõ để xử lý.`

Insertion recommendation:
- EN: after the third paragraph ending `can I frame what I actually want?`
- VI: after the third paragraph ending `mình đóng khung được điều mình thật sự muốn chưa?`
- Rationale: this is where the article names the new bottleneck as framing rather than access.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/ai-reduces-the-information-privilege/framing-better-questions.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Watermark And Post-Processing Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated files remained outside the repository in the Codex generated image directory. Commit only the final processed PNGs and JSON insertions.
- Do not ask the image model to render the site watermark, article title, prompt text, code text, UI label, company name, or readable writing.
- Preserve the exact `width` and `height` attributes shown in the snippets.

## Implementation Notes

- Replace `public/og/notes/ai-reduces-the-information-privilege.png` with the final local-watermarked OG export.
- Add final article assets under `public/assets/notes/ai-reduces-the-information-privilege/`.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the existing date, slug, tags, topic, author, SEO paths, analytics, engagement behavior, and related-note links.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt text and captions.
- Local routes load without broken images: `/en/notes/ai-reduces-the-information-privilege`, `/vi/notes/ai-reduces-the-information-privilege`.
- OG image resolves at `/og/notes/ai-reduces-the-information-privilege.png`.
- Full Engineer verification after implementation: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
