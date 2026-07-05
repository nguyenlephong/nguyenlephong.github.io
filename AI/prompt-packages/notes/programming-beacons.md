# Visual prompt package: programming-beacons

Scope: `notes` article only, slug `programming-beacons`.

Source read:
- `public/notes-data/posts/programming-beacons.json`
- `public/notes-data/vi/posts/programming-beacons.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle workplace scenes with real people, practical desks, laptops, tablets, notebooks, and natural light.
- Images should feel vivid, human, and grounded in everyday software work, not abstract tech wallpaper.
- Use real physical cues as the metaphor: highlighted shapes, blank sticky tabs, blurred diagram blocks, a pen pointing to a pattern, a small margin marker.
- No model-rendered readable text, code words, article titles, UI labels, company names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, as a subtle dark translucent rounded label with white site text matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core idea: beacons are small clues in code that trigger a usually-correct assumption before the reader traces every detail.
- Concrete example: a variable named `node` tells the reader to expect a tree, graph, or connected structure.
- Practical takeaway: engineers can deliberately enrich code with naming, structure, and sometimes comments so the next reader inherits useful shortcuts.
- Article length: short, four paragraphs including the final related-note link. Use two in-article images, not three, to avoid making the note feel like a gallery.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/programming-beacons.png` | 1200x630 | n/a |
| Lead/intro photo | `public/assets/notes/programming-beacons/code-cue-at-the-desk.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/programming-beacons/quiet-comment-for-next-reader.png` | 1440x960 | `blog-photo-figure` |

Use a separate OG export from the lead direction so the social crop can keep the human reviewer, desk context, and abstract code cues in the central safe area.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no readable code, no variable names, no article title, no typography, no logos, no brand marks, no model-rendered watermark, no poster, no signs, no fake dashboard labels, no UI labels, no company names, no exact author likeness, no celebrity likeness, no AI robot, no glowing network brain, no fantasy lighthouse, no literal ocean lighthouse, no neon cyberpunk, no motivational poster, no stock-photo handshake, no exaggerated surprise, no distorted hands, no extra fingers, no uncanny faces.

## OG Prompt

Primary prompt:

Photorealistic editorial workplace photograph for an article about small code cues that help readers understand faster. A Vietnamese software engineer sits at a warm wood desk during a quiet code review, looking at a laptop whose screen shows only soft blurred columns and abstract blocks, with no readable code or words. On the desk are a blank notebook, a pen, a tablet showing an abstract tree-like diagram made of simple unlabeled nodes, a few muted sticky tabs, coffee, and a small plant. One hand points gently toward a highlighted abstract node shape, suggesting the moment when a tiny cue makes the larger structure easier to infer. Modern Vietnamese office or home-office, natural morning window light, lived-in practical desk texture, realistic skin and fabric, documentary editorial photography, 35mm lens, calm focused posture, vivid but restrained colors, lower-right corner kept visually calm for local watermark, no text in image.

Generation:
- Export `1200x630`.
- Keep the engineer, pointing gesture, laptop, and abstract node diagram inside the central safe area.
- Keep all screens, notebooks, and sticky notes abstract or blank.
- Leave the bottom-right corner visually calm for the local watermark.

## Lead Prompt: Code Cue At The Desk

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese software engineer reviewing code at a warm desk, with a laptop showing blurred abstract code-like columns and a tablet or paper sheet showing an unlabeled tree/graph sketch made only of simple circles and connecting lines. The engineer leans in with a pen hovering over one small highlighted shape, as if recognizing a familiar cue before tracing the whole system. Desk includes a blank notebook, muted sticky tabs, coffee cup, keyboard, and small plant. The scene should communicate mental shortcut, pattern recognition, and quiet readability in everyday engineering work. Natural window light mixed with soft desk lamp, realistic hands, real paper texture, practical modern workspace, 16:9 panorama, documentary editorial style, vivid but restrained palette with warm wood, charcoal, soft green, and muted amber, lower-right corner kept visually calm for local watermark, no readable text anywhere.

Generation:
- Export `1600x900`.
- Keep all code, diagram labels, notebooks, and sticky notes unreadable: abstract blocks and blank shapes only.
- Avoid literal signposts or lighthouse imagery; the article uses "beacon" as a code-reading metaphor.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese software engineer points to an abstract node diagram beside a laptop with blurred code-like blocks.`
- EN caption: `A small cue can let the next reader recognize the shape of the code before tracing every line.`
- VI alt: `Một software engineer Việt Nam chỉ vào sơ đồ node trừu tượng bên cạnh laptop có các khối code được làm mờ.`
- VI caption: `Một tín hiệu nhỏ có thể giúp người đọc sau nhận ra hình dạng của code trước khi truy từng dòng.`

Insertion recommendation:
- EN: after the first paragraph ending `recognize a familiar signal and move on.`
- VI: after the first paragraph ending `bạn nhận ra một tín hiệu quen và đi tiếp.`
- Rationale: this is the point where the article first defines the mental saving. The image should make that saving visible as a quiet desk moment, before the naming example narrows the idea.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/programming-beacons/code-cue-at-the-desk.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Quiet Comment For Next Reader

Primary prompt:

Photorealistic editorial photograph of a calm paired code review moment in a modern Vietnamese workspace. Two Vietnamese engineers sit at a modest desk, one person holding a pen near a blank margin note while the other looks at a laptop with a blurred abstract interface, no readable words or code. On the table are plain sticky tabs, an open notebook with blank pages, a tablet showing simple unlabeled flow blocks, a coffee cup, and practical desk tools. The scene should suggest leaving a helpful cue for the next reader when the code itself cannot carry the whole hint. Human, grounded, collaborative without being staged, warm afternoon office light, realistic hands and paper, 3:2 composition, lower-right corner kept visually calm for local watermark, no text in image.

Generation:
- Export `1440x960`.
- Keep the margin note, notebook, sticky tabs, tablet, and laptop completely blank or abstract.
- Avoid whiteboards filled with writing, fake code, real IDE labels, comments rendered as text, or brand marks.
- Leave lower-right corner clear for local watermark.

Localized copy:
- EN alt: `Two Vietnamese engineers review a laptop and blank margin note, preparing a small cue for the next reader.`
- EN caption: `When a name or structure cannot carry the whole hint, a quiet comment can preserve the shortcut.`
- VI alt: `Hai engineer Việt Nam xem laptop và ghi chú lề trống, chuẩn bị một tín hiệu nhỏ cho người đọc tiếp theo.`
- VI caption: `Khi tên gọi hay cấu trúc không chở hết gợi ý, một dòng comment lặng lẽ có thể giữ lại lối tắt ấy.`

Insertion recommendation:
- EN: after the third paragraph ending `the same shortcut you would have wanted.`, before the final related-note link.
- VI: after the third paragraph ending `đúng lối tắt mà bạn từng ước có.`, before the final related-note link.
- Rationale: this placement lands immediately after the practical advice about adding comments when naming and structure are not enough, then gives the final link room to close the note.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/programming-beacons/quiet-comment-for-next-reader.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Watermark And Post-Processing Notes

- Do not ask the image model to render `nguyenlephong.github.io`, any watermark, any article title, any code text, or any UI text.
- Resize/crop locally to the exact target dimensions before watermarking.
- Apply the watermark locally after generation: bottom-right, subtle dark translucent rounded label, white `nguyenlephong.github.io` text, matching the approved `cross-functional-teams` sample.
- Keep the original generated files outside the repo untouched when applicable. Commit only final processed PNGs and JSON insertions during implementation.
- Use PNG exports and preserve the exact `width`/`height` attributes shown in the snippets.

## Implementation Notes

- Create `public/assets/notes/programming-beacons/` during implementation if it does not already exist.
- Replace `public/og/notes/programming-beacons.png` with the final local-watermarked OG export.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the existing date, slug, tags, topic, author, SEO paths, analytics, engagement behavior, and final related-note link.
- Do not add a third in-article image unless the article body is substantially expanded later; the current note is too short for three figures.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt text and captions.
- Local routes load without broken images: `/en/notes/programming-beacons`, `/vi/notes/programming-beacons`.
- OG image resolves at `/og/notes/programming-beacons.png`.
- Full Engineer verification after implementation: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
- Nothing leaves local execution unless explicit image-generation approval is recorded.
