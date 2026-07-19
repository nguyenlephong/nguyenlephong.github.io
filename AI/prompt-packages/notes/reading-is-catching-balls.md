# Visual prompt package: reading-is-catching-balls

Scope: `notes` article only, slug `reading-is-catching-balls`.

Source read:
- `content/notes-data/posts/reading-is-catching-balls.json`
- `content/notes-data/vi/posts/reading-is-catching-balls.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical tools, natural light, and a lived-in desk or everyday environment.
- No model-rendered readable text, article titles, book titles, UI labels, scoreboards, jersey numbers, company names, logos, signatures, brand marks, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core image: Adler and Van Doren's analogy that the writer-reader relationship is like pitcher-catcher.
- Core claim: both writing and reading are active efforts; meaning does not arrive by itself.
- Core tension: a throw can be too hard to catch or too easy to keep attention alive.
- Core takeaway: the best exchange depends on cooperation and a responsible level of challenge.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/reading-is-catching-balls.png` | 1200x630 | n/a |
| Lead/active reading photo | `public/assets/notes/reading-is-catching-balls/active-reading-desk.png` | 1600x900 | `blog-photo-panorama` |
| Section/cooperation photo | `public/assets/notes/reading-is-catching-balls/calibrated-catch-practice.png` | 1440x960 | `blog-photo-figure` |

The note is short, so two in-article figures are enough. The lead image grounds the analogy in a reader's desk, while the section image carries the pitcher-catcher cooperation and challenge calibration.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no book title, no article title, no typography, no logos, no brand marks, no watermark, no signage, no scoreboard, no jersey numbers, no UI labels, no company names, no exact author likeness, no celebrity likeness, no distorted hands, no extra fingers, no uncanny faces, no aggressive competition, no stadium spectacle, no fantasy glow, no motivational-poster style.

## OG Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph for an article about reading as an active act like catching a pitch. A Vietnamese adult reader sits at a warm, lived-in desk beside a window near a quiet urban sports court, leaning forward over an open book with blank pages and a blank notebook. One hand holds a pen and the other rests near a plain unbranded baseball glove with a ball beside it. The posture should feel attentive and active, as if the reader is reaching toward meaning rather than passively consuming. In the distant background, softly blurred through the window, two people practice a gentle pitch-and-catch. Natural late-afternoon light, documentary editorial feel, realistic skin texture, natural fabric, wood grain, paper texture, vivid but restrained colors. Wide 1.91:1-friendly composition, with the reader, blank book, pen, glove, and ball inside the central safe area; lower-right corner kept visually calm for a local watermark.

Generation:
- Export `1200x630`.
- Keep all book and notebook pages blank or softly textured.
- Leave the bottom-right corner visually calm for local watermark.

## Lead Prompt: Active Reading Desk

Primary prompt:

Photorealistic editorial lifestyle photograph about active reading as catching meaning. A Vietnamese adult reader leans over an open book and blank notebook at a quiet personal desk by a window, pen in hand, with a plain unbranded baseball glove and a baseball on the desk. The reader's body language is focused and engaged, showing reading as an active effort. A small urban sports court is softly blurred outside. Warm late-afternoon light, lived-in apartment or study, real paper texture, wood grain, natural hands, realistic skin texture, calm reflective mood, documentary editorial photography. 16:9 panorama composition; keep the reader, book, notebook, pen, glove, and ball central; lower-right corner kept visually calm for a local watermark.

Generation:
- Export `1600x900`.
- Keep all book and notebook pages blank or softly textured.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese reader writes beside a blank open book, a notebook, a plain baseball glove, and a ball on a warm desk.`
- EN caption: `Reading becomes active when the reader reaches toward meaning instead of waiting for it to land by itself.`
- VI alt: `Một người đọc Việt Nam ghi chú bên cuốn sách mở trống, sổ tay, găng bóng chày trơn và quả bóng trên chiếc bàn ấm.`
- VI caption: `Việc đọc trở nên chủ động khi người đọc vươn tới ý nghĩa, thay vì chờ nó tự hạ cánh.`

Insertion recommendation:
- EN: after the paragraph ending `meaning does not arrive in the mind by itself either.`
- VI: after the paragraph ending `ý nghĩa cũng không tự bay vào tâm trí.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/reading-is-catching-balls/active-reading-desk.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Calibrated Catch Practice

Primary prompt:

Photorealistic editorial lifestyle photograph about writer-reader cooperation as a careful pitch and catch. Two Vietnamese friends practice a careful pitch-and-catch on a quiet community sports field near an urban neighborhood. One person is mid-throw with relaxed form, and the catcher is focused with an open plain unbranded glove, ready for a challenging but catchable ball. Nearby on a bench or low table are a blank notebook, a pen, and an open book with no readable text, linking the sports scene back to reading and writing. Warm afternoon light, calm everyday atmosphere, natural movement, realistic hands, ordinary sports equipment, vivid but restrained colors. 3:2 composition; keep pitcher, catcher, ball path, glove, and blank book/notebook central; lower-right corner kept visually calm for a local watermark.

Generation:
- Export `1440x960`.
- Keep the book and notebook blank.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `Two Vietnamese friends practice a careful pitch and catch on a quiet field, with a blank notebook and open book resting nearby.`
- EN caption: `The best exchange sits between too easy and impossible, where the throw still asks the catcher to grow.`
- VI alt: `Hai người bạn Việt Nam tập một cú ném và bắt vừa sức trên sân yên tĩnh, với sổ tay trống và sách mở đặt gần đó.`
- VI caption: `Cuộc trao đổi tốt nằm giữa quá dễ và bất khả thi, nơi cú ném vẫn mời người bắt lớn lên một chút.`

Insertion recommendation:
- EN: after the paragraph ending `the reader&rsquo;s attention swats it away.`
- VI: after the paragraph ending `sự chú ý của người đọc sẽ phang nó văng đi.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/reading-is-catching-balls/calibrated-catch-practice.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Watermark Guidance

- Do not include any watermark request in the image-generation prompts.
- Add `nguyenlephong.github.io` only after generation through local post-processing.
- Match the approved `cross-functional-teams` treatment: bottom-right placement, small white text, low-contrast translucent dark rounded rectangle, subtle enough that it does not compete with the subject.
- Reserve calm visual space in the lower-right corner of every generated crop before watermarking.

## Implementation Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated source files were left under the Codex generated image directory and not edited in place.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the article date, slug, tags, topic, SEO paths, analytics, engagement behavior, and unrelated files.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/reading-is-catching-balls`, `/vi/notes/reading-is-catching-balls`.
- OG image resolves at `/og/notes/reading-is-catching-balls.png`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
