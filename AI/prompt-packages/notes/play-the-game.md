# Visual prompt package: play-the-game

Scope: `notes` article only, slug `play-the-game`.

Source read:
- `content/notes-data/posts/play-the-game.json`
- `content/notes-data/vi/posts/play-the-game.json`
- Approved reference: commit `48ac924f16`, `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with practical human context.
- Real people, ordinary tools, natural light, lived-in environments, and documentary framing.
- Calm, sincere, grounded tone; no motivational-poster energy, fantasy, trophy imagery, or brand-like sports advertising.
- No model-rendered readable text, article title, logos, jersey numbers, scoreboard text, signatures, watermarks, or caption text inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle treatment matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

## Asset Plan

Use exactly two in-article images, plus one separate OG export. The note has three short paragraphs, so two figures are enough: one for stepping into real play, and one for treating planning as warm-up rather than the match.

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/play-the-game.png` | 1200x630 | n/a |
| Lead/intro photo | `public/assets/notes/play-the-game/first-touch-on-the-field.png` | 1600x900 | `blog-photo-panorama` |
| Closing photo | `public/assets/notes/play-the-game/warm-up-before-the-match.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no article title, no typography, no logos, no brand marks, no team crests, no jersey numbers, no scoreboard text, no signage, no watermark, no poster layout, no fake magazine cover, no UI, no app screen, no trophy, no medal, no confetti, no victory celebration, no exaggerated hero pose, no celebrity athlete likeness, no luxury/status signaling, no distorted hands, no extra fingers, no uncanny faces, no fantasy glow, no surreal stadium, no spiritual aura, no abstract gradients, no clip-art, no cartoon style.

## OG And Lead Prompt: First Touch On The Field

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult stepping from the sideline onto a modest neighborhood futsal court in the early morning, one foot just crossing the painted boundary line, a worn unbranded ball close to the foot, simple athletic shoes, a small gym bag and a closed blank notebook left on the bench behind them, a few distant players softly out of focus warming up, ordinary urban court with chain-link fence and soft daylight, mood of quiet commitment before the pressure starts, human and grounded rather than heroic, documentary editorial style, 35mm lens, f/3.2, realistic skin tones, natural motion, gentle film grain, crisp foreground with the field line and ball, subtle negative space in the lower-right corner for local watermark, no text in image.

Generation:
- Lead crop: 16:9, export `1600x900`.
- OG crop: 1.91:1, export `1200x630`.
- Keep the crossing foot, field line, ball, and sideline bench inside the central safe area.
- Leave the bottom-right corner visually calm for the local watermark.
- The notebook must be blank or closed; avoid visible writing, diagrams, logos, jersey numbers, court signage, or scoreboard details.

Localized copy:
- EN alt: `A Vietnamese adult steps from the sideline onto a neighborhood futsal court with a worn ball near the field line.`
- EN caption: `The real lesson begins when the foot crosses from watching into playing.`
- VI alt: `Một người Việt bước từ ngoài biên vào sân futsal khu phố, cạnh vạch sân và một quả bóng đã cũ.`
- VI caption: `Bài học thật bắt đầu khi mình bước qua ranh giới giữa đứng xem và bước vào chơi.`

Insertion recommendation:
- EN: after the first paragraph ending `by being on the field.`
- VI: after the first paragraph ending `khi đang đứng trên sân.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/play-the-game/first-touch-on-the-field.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Closing Prompt: Warm-Up Before The Match

Primary prompt:

Photorealistic editorial lifestyle photograph on the sideline of a modest community sports court just before play, a Vietnamese adult crouches to tie their shoe and prepare to join the game, a blank clipboard or closed notebook sits beside a water bottle and towel on the bench, an unbranded ball rests partly on the court, the court surface shows real scuffs and chalk-like boundary marks, blurred movement of other players already practicing in the background, warm late-afternoon light, mood of planning giving way to action, ordinary and intimate, not a professional stadium, documentary editorial style, 50mm lens, f/3.5, realistic textures, natural shadows, lower-right corner kept quiet for local watermark, no text in image.

Generation:
- Export `1440x960`.
- Keep the image grounded in preparation becoming action, not winning or performance.
- Avoid readable notes, tactical diagrams, logos, jersey numbers, scoreboard text, banners, brand marks, or motivational signage.
- Leave lower-right corner free for local watermark.

Localized copy:
- EN alt: `A Vietnamese adult ties their shoe on the sideline beside a blank notebook, water bottle, towel, and unbranded ball.`
- EN caption: `Planning helps most when it stays close to the moment of play.`
- VI alt: `Một người Việt buộc dây giày bên ngoài sân, cạnh sổ tay trống, chai nước, khăn và một quả bóng không logo.`
- VI caption: `Lên kế hoạch hữu ích nhất khi nó vẫn dẫn mình tới khoảnh khắc thật sự chơi.`

Insertion recommendation:
- EN: after the final paragraph ending `The point is to get on the field.`, immediately before `<hr>`.
- VI: after the final paragraph ending `Mục đích là ra sân.`, immediately before `<hr>`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/play-the-game/warm-up-before-the-match.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes

- Create `public/assets/notes/play-the-game/` during implementation.
- Add all watermarks locally after generation, not in prompts.
- Use PNG exports with final dimensions embedded in the figure snippets.
- Keep the OG image realistic and context-specific; do not use abstract gradients, symbolic icons, literal maps, trophies, stadium hero shots, or rendered text.
- Do not add a third in-article figure unless the article body is expanded later. In the current short form, a third photo would crowd the note.
- Keep article metadata, date, slug, tags, topic, SEO paths, analytics, and engagement behavior unchanged.

## Generation Blockers

- No content-specific blocker found.
- Do not send source files or private local context to an external image service without explicit operator approval. If an external generator is used, send only the prompt text and constraints above.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sips` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt/caption.
- Local routes load without broken images: `/en/notes/play-the-game`, `/vi/notes/play-the-game`.
- OG image resolves at `/og/notes/play-the-game.png`.
- `npm test`, `npm run typecheck`, and `npm run build:fast` pass after implementation.
- Nothing leaves local execution except explicitly approved image-generation prompts.
