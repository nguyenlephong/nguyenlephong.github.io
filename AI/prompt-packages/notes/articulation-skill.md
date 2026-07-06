# Visual prompt package: articulation-skill

Scope: `notes` article only, slug `articulation-skill`.

Source read:
- `public/notes-data/posts/articulation-skill.json`
- `public/notes-data/vi/posts/articulation-skill.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with practical human context.
- Real desks, notebooks, blank cards, laptops, pens, plants, and ordinary routines.
- Calm, reflective, lived-in tone; no motivational-poster staging or abstract AI symbolism.
- No model-rendered readable text, titles, logos, UI labels, signatures, brand marks, watermarks, or caption text inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core claim: articulation is the ultimate validation of thinking.
- Core tension: the head can preserve the comfortable feeling of "I get it" because it does not force parts to fit together.
- Core mechanism: writing, speech, and prompting force vague intuition into concrete claims and reveal gaps.
- Core vocabulary point: a rich and consistent vocabulary is the interface through which the mind retrieves and connects what it knows.

## Final Assets

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/articulation-skill.png` | 1200x630 | n/a |
| Lead/page photo | `public/assets/notes/articulation-skill/page-demands-precision.png` | 1600x900 | `blog-photo-panorama` |
| Gap/revision photo | `public/assets/notes/articulation-skill/gaps-visible-on-page.png` | 1440x960 | `blog-photo-figure` |

The article is short and contains one dense reflection. Two in-article figures are enough: one after the paragraph about the page demanding fit, and one after the paragraph about verbalizing revealing gaps.

## Common Negative Prompt

No readable text, no article title, no typography, no notebook writing, no sticky-note words, no UI labels, no logos, no brand marks, no watermark, no signature, no wall signs, no company names, no exact author likeness, no celebrity likeness, no literal exposed brain, no sci-fi hologram, no fantasy glow, no motivational-poster style, no distorted hands, no extra fingers, no uncanny faces, no luxury/status signaling.

## OG And Lead Prompt

Primary prompt used:

Create a photorealistic editorial lifestyle photograph of a Vietnamese or Southeast Asian adult professional at a quiet desk turning a vague idea into concrete language. The person is seated beside an open notebook and laptop, arranging blank index cards and sticky notes into a clear sequence. The scene should suggest that the page forces precision: loose notes are becoming ordered, a pen is paused over the notebook, and the person is focused but calm. No readable writing anywhere. Modest modern home office or calm coworking corner with warm daylight, a plant, coffee cup, paper texture, realistic desk clutter, and a softly blurred background. One adult professional, natural posture, realistic hands, grounded everyday work moment, not staged like stock photography. High-end photorealistic editorial lifestyle photography, documentary feel, natural skin texture, vivid but restrained colors. Horizontal 16:9 panorama, desk-level three-quarter angle, main subject and writing tools in the central safe area, enough visual breathing room for a 1200x630 Open Graph crop, lower-right corner visually calm for a watermark added later. Soft morning or late-afternoon natural light, warm neutral tones with subtle green/teal accents, thoughtful and quiet. No model-rendered text, no article title, no typography, no logos, no brand marks, no watermark, no UI labels, no readable notebook words, no readable sticky notes, no pseudo-letters, no numbers, no motivational poster, no surreal glow, no AI robot, no exact author likeness, no celebrity likeness, no distorted hands, no extra fingers.

Generation:
- Lead export: `1600x900`.
- OG export: `1200x630`.
- Keep the person, notebook, blank note cards, laptop, and desk context in the central safe area.
- Leave the bottom-right corner visually calm for local watermark post-processing.

Localized copy:
- EN alt: `A Vietnamese professional works at a quiet desk, turning blank notes and an open notebook into a clearer order of thought.`
- EN caption: `The page makes the idea answer to order, not only to the comfortable feeling that it already makes sense.`
- VI alt: `Người Việt làm việc ở bàn yên tĩnh, sắp các ghi chú trống và cuốn sổ mở thành một trật tự suy nghĩ rõ hơn.`
- VI caption: `Trang giấy buộc ý tưởng trả lời bằng trật tự, không chỉ bằng cảm giác dễ chịu rằng mình đã hiểu.`

Insertion:
- EN: after the opening paragraph ending `The page does.`
- VI: after the opening paragraph ending `Trang giấy thì có.`

## Section Prompt: Gaps Visible On Page

Primary prompt used:

Create a photorealistic editorial lifestyle photograph of a Vietnamese or Southeast Asian adult professional at a wooden desk revising a thought until the gaps become visible. Show hands arranging blank paper strips and index cards into an ordered path beside an open notebook, with one deliberate empty space between two cards to suggest a missing bridge in the idea. A laptop can sit partly open with only soft abstract blurred blocks on screen, no readable interface. The scene should feel like writing, speech preparation, and prompt framing all becoming precise through careful articulation. Quiet home study or small office corner, warm lamp plus natural side light, simple plant, pen, coffee cup, uncluttered but lived-in workspace. One adult professional partially visible, focused body language, realistic hands, ordinary work texture, no glamour or stock-photo posing. High-end photorealistic editorial lifestyle photography, documentary desk scene, natural skin texture and paper grain, vivid but restrained. 3:2 / 1440x960-friendly composition, three-quarter top-down desk angle, the ordered cards and visible gap are clear in the foreground, lower-right corner visually calm for a watermark added later. Thoughtful, quiet, warm neutral palette with muted green/teal accents, soft shadows. No model-rendered text, no readable words, no pseudo-letters, no article title, no typography, no logos, no brand marks, no watermark, no UI labels, no notebook writing, no sticky-note writing, no numbers, no motivational poster, no surreal symbols, no AI robot, no exact author likeness, no celebrity likeness, no distorted hands, no extra fingers.

Generation:
- Export `1440x960`.
- Keep the blank cards, open notebook, and visible gap central.
- Leave the bottom-right corner visually calm for local watermark post-processing.

Localized copy:
- EN alt: `A Vietnamese professional arranges blank cards beside an open notebook, leaving one visible gap where the next sentence still needs to connect.`
- EN caption: `Gaps become easier to see when a thought has to cross from one sentence to the next.`
- VI alt: `Một người Việt sắp các thẻ trống cạnh cuốn sổ mở, chừa ra một khoảng thiếu nơi câu tiếp theo vẫn cần nối lại.`
- VI caption: `Lỗ hổng dễ hiện ra hơn khi một ý nghĩ phải đi từ câu này sang câu kế tiếp.`

Insertion:
- EN: after the paragraph about verbalizing forcing precision and revealing gaps.
- VI: after the paragraph about đặt thành lời forcing precision and revealing gaps.

## Implementation Notes

- Final assets were generated with the built-in image generation tool, then resized/cropped locally with Sharp.
- Original generated files remained outside the repo under `codex-home/generated_images/...`; only final resized/watermarked PNGs were copied into the repo.
- Add all watermarks locally after generation, not in prompts.
- Use PNG exports with final dimensions embedded in the figure snippets.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the article date, slug, tags, topic, SEO paths, analytics, engagement behavior, and unrelated files.

## Verification Checklist

- Generated files exist at the exact paths above.
- `sips` reports PNG images with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt/caption.
- Local routes load without broken images: `/en/notes/articulation-skill`, `/vi/notes/articulation-skill`.
- OG image resolves at `/og/notes/articulation-skill.png`.
- Full verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
