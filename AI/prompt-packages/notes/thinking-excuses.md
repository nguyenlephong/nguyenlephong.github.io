# Visual prompt package: thinking-excuses

Scope: `notes` article only, slug `thinking-excuses`.

Source read:
- `content/notes-data/posts/thinking-excuses.json`
- `content/notes-data/vi/posts/thinking-excuses.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`
- Repo content guidance: `AI/skills/calm-content-writer/SKILL.md`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical desks, laptops, notebooks, cards, and natural light.
- Images should feel vivid, human, and grounded in ordinary work, not abstract productivity wallpaper.
- Use physical cues as the metaphor: blank thinking space, an untouched first action, and a small paper setup finally tested against reality.
- No model-rendered readable text, titles, UI labels, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core idea: thinking is useful until it becomes a comfortable excuse to avoid action.
- The trap: thought can wear the costume of diligence while the real-world scoreboard stays unchanged.
- The seduction: in the mind, an idea stays pristine; action introduces friction, ugliness, and compromise.
- Closing idea: awareness does not cure the habit, but it makes the procrastination less comfortable and may tip the balance toward doing.
- Article length: short, five prose paragraphs plus related-note links. Use two in-article images, not three, so the note does not become a gallery.

## Asset Plan

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/thinking-excuses.png` | 1200x630 | n/a |
| Lead photo | `public/assets/notes/thinking-excuses/thinking-as-diligence.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/thinking-excuses/reality-tests-the-idea.png` | 1440x960 | `blog-photo-figure` |

The OG image uses a local crop from the lead direction so the article preview keeps the hesitant professional, blank notebook, laptop, and untouched card in the central safe area.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no logos, no brand marks, no model-rendered watermark, no poster, no signs, no fake dashboard labels, no UI labels, no company names, no exact author likeness, no celebrity likeness, no AI robot, no glowing network brain, no surreal brain, no fantasy, no motivational poster, no luxury/status signaling, no distorted hands, no extra fingers, no uncanny faces.

## OG / Lead Prompt: Thinking As Diligence

Primary prompt:

Photorealistic editorial lifestyle photograph for an article about thinking becoming an excuse to avoid action. A Vietnamese or Southeast Asian adult professional sits at a modest warm home-office desk in late afternoon natural light. Their hands hover between an open blank notebook and one small practical object they should act on, such as a blank index card near the keyboard. The scene should show quiet hesitation, not drama: thinking dressed up as diligence. Include a laptop with only blurred abstract blocks on screen, a keyboard, blank notebook, blank index cards, a pen, a coffee cup, and a small plant. The image should feel human, vivid, context-aware, and calm, with productivity anxiety turning into one manageable action.

Generation:
- Export/crop locally to `1200x630` for OG and `1600x900` for the lead article image.
- Keep the person, laptop, blank notebook, and untouched card in the central safe area.
- Keep all cards, notebooks, screens, sticky notes, and papers blank or abstract.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese professional hesitates at a warm desk with a blank notebook, laptop, and one untouched card.`
- EN caption: `Thinking can look diligent from the outside, even when the real task is still waiting for one small move.`
- VI alt: `Một người Việt Nam ngồi lưỡng lự bên bàn làm việc ấm với sổ tay trống, laptop và một tấm thẻ chưa chạm tới.`
- VI caption: `Suy nghĩ đôi khi trông rất chăm chỉ từ bên ngoài, dù việc thật sự vẫn đang chờ một bước nhỏ.`

Insertion recommendation:
- EN: after the second paragraph ending `which is exactly what made it so hard to catch.`
- VI: after the second paragraph ending `khiến nó khó bắt quả tang đến vậy.`
- Rationale: this lands immediately after the article names thinking as a disguised form of procrastination.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/thinking-excuses/thinking-as-diligence.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Reality Tests The Idea

Primary prompt:

Photorealistic editorial lifestyle photograph about an idea finally meeting real-world friction after too much thinking. A Vietnamese or Southeast Asian adult professional sits at a practical home-office desk in soft evening light after a small attempted task. A laptop is off to the side, and a simple paper prototype or arrangement of blank cards has been partly disturbed by use. One hand adjusts the blank paper setup while the other holds a pen above a blank notebook, pausing after a concrete attempt. The scene should suggest that action has made the idea imperfect but useful.

Generation:
- Export/crop locally to `1440x960`.
- Focus on hands, blank paper/card setup, notebook, and practical desk texture.
- The person's face can be partial or softly out of focus.
- Keep all cards, notebooks, screens, sticky notes, and papers blank or abstract.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese professional adjusts a blank paper prototype after testing an idea at a warm desk.`
- EN caption: `The idea loses its perfect shape only when reality finally gets a turn to answer.`
- VI alt: `Một người Việt Nam chỉnh lại nguyên mẫu giấy trống sau khi thử một ý tưởng trên bàn làm việc ấm.`
- VI caption: `Ý tưởng chỉ mất vẻ hoàn hảo khi thực tại cuối cùng được lên tiếng.`

Insertion recommendation:
- EN: after the fourth paragraph ending `which is how it keeps getting away with it.`
- VI: after the fourth paragraph ending `đó là cách nó cứ thoát tội mãi.`
- Rationale: this follows the paragraph that names the retreat to the drawing board and gives the reader a physical counter-image: the idea has been touched by reality.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/thinking-excuses/reality-tests-the-idea.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Watermark And Post-Processing Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated files remained outside the repository in the Codex generated image directory. Commit only the final processed PNGs and this prompt package unless Engineer wires the article JSON in the same focused change.
- Do not ask the image model to render `nguyenlephong.github.io`, any article title, prompt text, code text, UI label, company name, or readable writing.
- Preserve the exact `width` and `height` attributes shown in the snippets.

## Implementation Notes

- Replace `public/og/notes/thinking-excuses.png` with the final local-watermarked OG export.
- Add final article assets under `public/assets/notes/thinking-excuses/`.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the existing date, slug, tags, topic, author, SEO paths, analytics, engagement behavior, and related-note links.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` reports PNG with expected dimensions:
  - `public/og/notes/thinking-excuses.png`: 1200x630
  - `public/assets/notes/thinking-excuses/thinking-as-diligence.png`: 1600x900
  - `public/assets/notes/thinking-excuses/reality-tests-the-idea.png`: 1440x960
- Visual inspection confirms no readable text, no logos, no model-rendered watermark, and no obvious hand/face defects.
- Engineer verification after JSON wiring: EN and VI JSON include matching figure blocks with localized alt text and captions; local routes load without broken images at `/en/notes/thinking-excuses` and `/vi/notes/thinking-excuses`; `npm test`, `npm run typecheck`, and `npm run build:fast` pass.
