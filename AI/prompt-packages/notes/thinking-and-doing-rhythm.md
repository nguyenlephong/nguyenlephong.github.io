# Visual prompt package: thinking-and-doing-rhythm

Scope: `notes` article only, slug `thinking-and-doing-rhythm`.

Source read:
- `content/notes-data/posts/thinking-and-doing-rhythm.json`
- `content/notes-data/vi/posts/thinking-and-doing-rhythm.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`
- Repo content guidance: `AI/skills/calm-content-writer/SKILL.md`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical desks, laptops, notebooks, cards, and natural light.
- Images should feel vivid, human, and grounded in ordinary work, not abstract productivity wallpaper.
- Use physical cues as the metaphor: blank cards several steps ahead, hands starting the first card, and a small paper prototype being adjusted after action.
- No model-rendered readable text, titles, UI labels, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core idea: the mind often runs several moves ahead while the hands are still on step one, and that gap can feel like failure even when nothing is wrong.
- Practical rhythm: think just enough to act, act once, then think again with what reality taught.
- Closing idea: thinking without acting is imagination; acting without thinking is impulse; agency is their steady alternation.
- Article length: short, three prose paragraphs plus related-note links. Use two in-article images, not three, so the note does not become a gallery.

## Asset Plan

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/thinking-and-doing-rhythm.png` | 1200x630 | n/a |
| Lead photo | `public/assets/notes/thinking-and-doing-rhythm/thoughts-ahead-of-hands.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/thinking-and-doing-rhythm/action-feedback-loop.png` | 1440x960 | `blog-photo-figure` |

Use a separate OG export from the same desk-action direction so the social crop keeps the human reviewer, first-step card, and blank planning cards inside the central safe area.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no logos, no brand marks, no model-rendered watermark, no poster, no signs, no fake dashboard labels, no UI labels, no company names, no exact author likeness, no celebrity likeness, no AI robot, no glowing network brain, no surreal brain, no fantasy, no motivational poster, no luxury/status signaling, no distorted hands, no extra fingers, no uncanny faces.

## OG Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph for an article about the rhythm between thinking and doing. A Vietnamese or Southeast Asian adult professional sits at a warm, practical home-office desk in natural morning light. Their hands are calmly starting the first concrete task: moving one blank index card beside a laptop, with a pen and notebook open nearby. Several other blank cards extend farther across the desk like thoughts running three steps ahead, while the person's hands stay grounded on the first step. The laptop screen shows only soft blurred abstract blocks, no readable UI. Include a coffee cup, small plant, keyboard, and practical desk texture. The scene should feel human, vivid, context-aware, and calm: productivity anxiety turning into one manageable action.

Generation:
- Export/crop locally to `1200x630`.
- Keep the desk action, person, blank cards, and abstract screen in the central safe area.
- Leave the bottom-right corner visually calm for the local watermark.

## Lead Prompt: Thoughts Ahead Of Hands

Primary prompt:

Photorealistic editorial lifestyle photograph showing the mismatch between a mind that runs ahead and hands that are still on step one. A Vietnamese or Southeast Asian adult professional works at a modest warm desk. Their left hand rests on an open blank notebook, and their right hand places the first blank card in a simple row of blank cards that continues across the desk. A laptop nearby shows only blurred abstract panels, not a real interface. The scene should make the reader feel the pressure of ideas arriving faster than action, but in an ordinary calm workspace rather than a dramatic scene. Include a plain pen, coffee cup, keyboard, small plant, and practical desk objects.

Generation:
- Export/crop locally to `1600x900`.
- Keep all cards, notebooks, screens, sticky notes, and papers blank or abstract.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese professional places the first blank card while a row of cards stretches across a warm desk.`
- EN caption: `The gap often feels larger because thought has already moved several steps ahead while the hands are still on the first one.`
- VI alt: `Một người Việt Nam đặt tấm thẻ trống đầu tiên khi một hàng thẻ trải dài trên bàn làm việc ấm.`
- VI caption: `Khoảng hở thường thấy lớn hơn vì suy nghĩ đã đi trước vài bước trong khi đôi tay vẫn ở bước đầu.`

Insertion recommendation:
- EN: after the first paragraph ending `nothing has gone wrong.`
- VI: after the first paragraph ending `chưa có gì hỏng cả.`
- Rationale: this is where the article names the anxiety created by thought moving faster than action.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/thinking-and-doing-rhythm/thoughts-ahead-of-hands.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Action Feedback Loop

Primary prompt:

Photorealistic editorial lifestyle photograph about learning from a small real action. A Vietnamese or Southeast Asian adult professional at a warm desk has just tested a simple paper prototype: a few folded blank cards form a small tabletop flow or layout, one piece is slightly moved after the test, and the person pauses with a pen above a blank notebook to rethink the next step. A laptop sits to the side with only blurred abstract shapes, while the real paper setup is the focus. The scene should make reality feel like the thing answering the question after one concrete attempt, not a long speculative plan.

Generation:
- Export/crop locally to `1440x960`.
- Keep all cards, notebooks, screens, sticky notes, and papers blank or abstract.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese professional rethinks a folded paper prototype after a small test at a warm desk.`
- EN caption: `One small action gives the next thought something real to answer.`
- VI alt: `Một người Việt Nam nghĩ lại về nguyên mẫu giấy gấp sau một thử nghiệm nhỏ trên bàn làm việc.`
- VI caption: `Sau một lần làm nhỏ, suy nghĩ tiếp theo có thứ thật để dựa vào.`

Insertion recommendation:
- EN: after the second paragraph ending `a country you have never set foot in.`
- VI: after the second paragraph ending `mình chưa từng đặt chân.`
- Rationale: the image lands immediately after the paragraph that contrasts speculative planning with reality's feedback.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/thinking-and-doing-rhythm/action-feedback-loop.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Watermark And Post-Processing Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated files remained outside the repository in the Codex generated image directory. Commit only the final processed PNGs and JSON insertions.
- Do not ask the image model to render `nguyenlephong.github.io`, any article title, prompt text, code text, UI label, company name, or readable writing.
- Preserve the exact `width` and `height` attributes shown in the snippets.

## Implementation Notes

- Replace `public/og/notes/thinking-and-doing-rhythm.png` with the final local-watermarked OG export.
- Add final article assets under `public/assets/notes/thinking-and-doing-rhythm/`.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the existing date, slug, tags, topic, author, SEO paths, analytics, engagement behavior, and related-note links.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt text and captions.
- Local routes load without broken images: `/en/notes/thinking-and-doing-rhythm`, `/vi/notes/thinking-and-doing-rhythm`.
- OG image resolves at `/og/notes/thinking-and-doing-rhythm.png`.
- Full Engineer verification after implementation: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
