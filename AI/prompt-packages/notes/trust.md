# Visual prompt package: trust

Scope: `notes` article only, slug `trust`.

Source read:
- `content/notes-data/posts/trust.json`
- `content/notes-data/vi/posts/trust.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with practical human context.
- Real desks, notebooks, laptops, small tools, quiet rooms, and ordinary routines.
- Calm, reflective, lived-in tone; trust as a usable working posture, not a slogan.
- No model-rendered readable text, titles, logos, UI labels, signatures, brand marks, watermarks, or caption text inside generated images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/trust.png` | 1200x630 | n/a |
| Lead/stable-basis photo | `public/assets/notes/trust/stable-basis-for-trust.png` | 1600x900 | `blog-photo-panorama` |
| Section/boundary photo | `public/assets/notes/trust/boundary-before-decision.png` | 1440x960 | `blog-photo-figure` |

The article is short, so two in-article figures are enough. Use the stable-basis scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no article title, no typography, no logos, no brand marks, no watermark, no poster, no signs, no fake dashboard labels, no UI labels, no readable notebook pages, no readable calendar dates, no app interface, no notification text, no distorted hands, no extra fingers, no uncanny faces, no celebrity likeness, no exact author likeness, no luxury/status signaling, no handshake stock-photo pose, no blindfold metaphor, no legal contract scene, no literal scales of justice, no fantasy, no mystical symbols, no surreal fractal glow, no motivational-poster style, no corporate stock-photo staging.

## OG / Lead Prompt: Stable Basis For Trust

Primary prompt:

Create a photorealistic editorial lifestyle image about trust as a stable basis for thinking. Show a Vietnamese or Southeast Asian adult professional at a quiet home-office desk or modest studio workspace, calmly working with several trusted systems around them: a laptop displaying only abstract blurred interface blocks and simple non-readable status shapes, a neat stack of blank task cards, a few blank flashcards, a closed notebook, a pencil, and a small desk plant. The person is not celebrating or performing; they look focused and mentally lighter because the tools around them are organized enough to stop re-checking every assumption. Warm morning window light mixed with a soft desk lamp, lived-in but tidy surface, human natural posture, realistic hands, calm practical atmosphere. Horizontal 16:9 safe composition, desk-level editorial angle, subject and tools in the central safe area, enough quiet bottom-right space for a local watermark added later. Photorealistic high-end editorial lifestyle photography, 35mm lens feel, natural skin texture, gentle contrast, warm neutrals with muted green and charcoal accents, vivid but restrained, no text in image.

Generation:
- Export final in-article crop at `1600x900`.
- Export OG crop at `1200x630`, keeping the person, desk systems, and calm negative space inside the crop.
- Leave bottom-right corner visually quiet for local watermark post-processing.

Localized copy:
- EN alt: `A professional works at a calm desk with a laptop, blank task cards, flashcards, and a closed notebook arranged as trusted systems.`
- EN caption: `Trust can work like a stable surface: enough structure to stop re-checking every small thing before moving forward.`
- VI alt: `Một người đi làm ngồi bên bàn yên tĩnh với laptop, thẻ task trống, thẻ học và sổ tay đóng được sắp như các hệ thống đáng tin.`
- VI caption: `Niềm tin có thể giống một mặt bàn ổn định: đủ cấu trúc để ta không phải xét lại từng chuyện nhỏ trước khi đi tiếp.`

Insertion recommendation:
- EN: after the paragraph ending `trust gives you a stable basis to explore from and build upon.`
- VI: after the paragraph ending `niềm tin cho bạn một nền ổn định để khám phá từ đó và xây tiếp lên trên.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/trust/stable-basis-for-trust.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Boundary Before Decision

Primary prompt:

Create a photorealistic editorial lifestyle image about trust with a small boundary of verification. Show a Vietnamese or Southeast Asian adult professional pausing before a practical decision at a modest desk or small meeting table. One hand rests near a pencil over a blank checklist or notebook page with a simple thin drawn line, while a laptop shows only blurred abstract blocks and a few plain printed pages sit nearby with no readable text. The mood is thoughtful and calm: not suspicious, not anxious, just a small verification pause before acting. Include subtle signs of everyday work such as a ceramic cup, a phone face down, blank sticky notes, and soft daylight. The composition should make the boundary feel practical and human, not legalistic or dramatic. Vertical-leaning 3:2 / `1440x960` editorial composition, three-quarter desk view, clear foreground with the blank checklist and line, enough lower-right calm area for a local watermark added later. Photorealistic high-end editorial lifestyle photography, 50mm lens feel, natural hands, realistic texture, warm neutral palette with muted green or blue accent, no text in image.

Generation:
- Export `1440x960`.
- Keep the blank checklist/page line and decision materials visible.
- Leave lower-right corner visually quiet for local watermark post-processing.

Localized copy:
- EN alt: `A professional pauses over a blank checklist beside a laptop and papers, with a thin line drawn across the notebook page.`
- EN caption: `Boundaries keep trust from becoming blind; the pause is small, but it protects the decision that follows.`
- VI alt: `Một người đi làm dừng tay trên checklist trống cạnh laptop và giấy tờ, với một đường ranh mỏng trên trang sổ.`
- VI caption: `Ranh giới giúp niềm tin không thành mù quáng; khoảng dừng rất nhỏ, nhưng bảo vệ quyết định phía sau.`

Insertion recommendation:
- EN: after the exception list item ending `not without validating it first.`
- VI: after the exception list item ending `chừng nào chưa kiểm chứng nó trước.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/trust/boundary-before-decision.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes

- Create `public/assets/notes/trust/` if it does not exist.
- Use PNG exports with final dimensions embedded in the figure snippets.
- Add all watermarks locally after generation, never in the image prompt.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve article date, slug, title, tags, topic, SEO routes, analytics, engagement behavior, and unrelated files.
- Do not add a third in-article image unless the article body is later expanded; the current note reads best with one image for the stable basis and one image for verification/boundaries.

## Verification Checklist

- Generated files exist at the target paths.
- `file` reports PNG dimensions: OG `1200x630`, lead `1600x900`, section `1440x960`.
- EN and VI JSON include matching figure blocks with localized alt text and captions.
- Local route checks pass for `/en/notes/trust` and `/vi/notes/trust`.
- Static image checks return `200 image/png` for the OG and both in-article assets.
- `npm test`, `npm run typecheck`, and `npm run build:fast` pass after implementation.
- Nothing leaves local execution unless explicit image-generation approval is recorded.
