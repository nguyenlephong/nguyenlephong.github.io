# Visual prompt package: start-new-behaviors-in-boring-easy-mode

Scope: `notes` article only, slug `start-new-behaviors-in-boring-easy-mode`.

Source read:
- `content/notes-data/posts/start-new-behaviors-in-boring-easy-mode.json`
- `content/notes-data/vi/posts/start-new-behaviors-in-boring-easy-mode.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with practical human context.
- Real desks, notebooks, simple tools, quiet rooms, and ordinary routines.
- Calm, reflective, lived-in tone; habit discipline without motivational-poster energy.
- No model-rendered readable text, titles, logos, UI labels, signatures, brand marks, watermarks, or caption text inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

## Asset Plan

Final implemented assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/start-new-behaviors-in-boring-easy-mode.png` | 1200x630 | n/a |
| Lead/small quota photo | `public/assets/notes/start-new-behaviors-in-boring-easy-mode/small-quota-evening-practice.png` | 1600x900 | `blog-photo-panorama` |
| Closing appetite photo | `public/assets/notes/start-new-behaviors-in-boring-easy-mode/leave-some-want-for-tomorrow.png` | 1440x960 | `blog-photo-figure` |

The article is short, so two in-article figures are enough. The OG image uses a crop from the lead/small-quota source.

## Common Negative Prompt

No readable text, no article title, no typography, no logos, no brand marks, no watermark, no poster, no signs, no fake dashboard labels, no UI labels, no readable notebook pages, no readable calendar dates, no app interface, no notification text, no distorted hands, no extra fingers, no uncanny faces, no celebrity likeness, no exact author likeness, no luxury/status signaling, no literal progress chart, no abstract habit diagram, no fantasy, no surreal glow, no motivational-poster style, no corporate stock-photo staging.

## OG / Lead Prompt

Primary prompt used:

Create a photorealistic editorial lifestyle image of a deliberately small evening habit setup. Show a Vietnamese or Southeast Asian adult professional at a quiet home desk after work, starting a tiny practice session instead of an ambitious marathon. Include a guitar leaning safely nearby, a small stack of blank flashcards, an open notebook with no readable writing, a pencil, and a simple timer-like object with no numbers or labels. The person is calm and a little tired but willing to begin, hands near the notebook or guitar pick, posture natural and grounded. Modest modern apartment workspace or quiet study corner, soft warm desk lamp plus faint evening window light, lived-in but tidy. Horizontal 16:9 safe composition, desk-level editorial angle, enough negative space and a visually calm bottom-right corner for a local watermark added later. Keep the main subject and practice tools in the central safe area so the same source can crop to 1200x630 for Open Graph. Photorealistic high-end editorial lifestyle photography, natural human texture, vivid but not glossy, warm neutrals with muted teal or green accents, gentle shadows, no corporate stock-photo staging. No readable text, no article title, no typography, no logos, no brand marks, no watermark, no UI labels, no notebook words, no calendar dates, no motivational poster, no surreal glow, no luxury/status signaling, no exact author likeness, no celebrity likeness, no distorted hands, no extra fingers.

Generation:
- Export final in-article crop at `1600x900`.
- Export OG crop at `1200x630`.
- Leave lower-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A professional begins a short evening practice session with a guitar, blank flashcards, and an open notebook on a quiet desk.`
- EN caption: `A habit survives better when the setup asks for a small start, not a heroic evening.`
- VI alt: `Một người đi làm bắt đầu buổi luyện tập ngắn buổi tối với cây guitar, các thẻ trống và cuốn sổ mở trên bàn yên tĩnh.`
- VI caption: `Một thói quen dễ sống sót hơn khi cách bày ra chỉ mời mình bắt đầu nhỏ, không đòi một buổi tối quá sức.`

Insertion:
- EN: after the paragraph ending `An easy target keeps the chain unbroken.`
- VI: after the paragraph ending `Một mục tiêu dễ giữ cho sợi xích không đứt.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/start-new-behaviors-in-boring-easy-mode/small-quota-evening-practice.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Leave Some Want For Tomorrow

Primary prompt used:

Create a photorealistic editorial lifestyle image of a Vietnamese or Southeast Asian adult professional gently ending a short practice session before exhaustion. The person is closing a plain notebook or placing a pencil down while a few blank flashcards remain untouched and an acoustic guitar rests nearby. The mood should suggest leaving a little energy and curiosity for tomorrow, not quitting in defeat. No readable writing anywhere. Quiet home desk in warm evening light, modest apartment workspace, a small lamp, cup of tea, a plant, maybe a soft city window blur in the background. Lived-in and calm, not luxurious. One adult professional, natural posture, relaxed face, hands closing notebook or setting down practice tools; practice materials are simple and reachable. Vertical-leaning 3:2 / 1440x960-friendly editorial composition, three-quarter desk view, enough lower-right calm area for a local watermark added later, clear foreground showing the unfinished blank cards and closed notebook. Photorealistic high-end editorial lifestyle photography, natural skin and hands, vivid but restrained, warm neutral palette with subtle green accent, thoughtful and ordinary. No readable text, no article title, no typography, no logos, no brand marks, no watermark, no UI labels, no notebook words, no calendar dates, no phone notifications, no motivational poster, no dramatic burnout scene, no luxury/status signaling, no exact author likeness, no celebrity likeness, no distorted hands, no extra fingers.

Generation:
- Export `1440x960`.
- Keep blank cards and the closed notebook visible as the sign of stopping before empty.
- Leave lower-right corner free for local watermark.

Localized copy:
- EN alt: `A professional closes a notebook while a few blank flashcards and a guitar remain nearby after a small practice session.`
- EN caption: `Stopping a little early leaves a small reason to return tomorrow, instead of turning practice into another negotiation.`
- VI alt: `Một người đi làm đóng cuốn sổ khi vài tấm thẻ trống và cây guitar vẫn còn ở gần sau một buổi tập nhỏ.`
- VI caption: `Dừng sớm một chút để ngày mai còn một lý do nhỏ quay lại, thay vì biến việc tập thành một cuộc mặc cả nữa.`

Insertion:
- EN: after the closing habit-appetite paragraph and before the related-links rule.
- VI: after the localized closing habit-appetite paragraph and before the related-links rule.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/start-new-behaviors-in-boring-easy-mode/leave-some-want-for-tomorrow.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
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
- Do not add a third in-article figure unless the article body is expanded later; the current note reads best with one figure for the small quota and one figure for stopping while appetite remains.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt/caption.
- Local routes load without broken images: `/en/notes/start-new-behaviors-in-boring-easy-mode`, `/vi/notes/start-new-behaviors-in-boring-easy-mode`.
- OG image resolves at `/og/notes/start-new-behaviors-in-boring-easy-mode.png`.
- `npm test`, `npm run typecheck`, and `npm run build:fast` pass after implementation.
- Nothing leaves local execution except the explicitly approved image-generation prompts.
