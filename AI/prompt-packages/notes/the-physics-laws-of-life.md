# Visual prompt package: the-physics-laws-of-life

Scope: `notes` article only, slug `the-physics-laws-of-life`.

Source read:
- `content/notes-data/posts/the-physics-laws-of-life.json`
- `content/notes-data/vi/posts/the-physics-laws-of-life.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with practical human context.
- Real desks, tools, bodies in ordinary effort, and lived-in environments.
- Calm, reflective, grounded tone; physics metaphors translated into daily action rather than diagrams.
- No model-rendered readable text, article titles, formulas, UI labels, logos, signatures, brand marks, watermarks, or caption text inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

## Asset Plan

Final implemented assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/the-physics-laws-of-life.png` | 1200x630 | n/a |
| Lead / inertia photo | `public/assets/notes/the-physics-laws-of-life/first-push-inertia.png` | 1600x900 | `blog-photo-panorama` |
| Gravity / Goldilocks photo | `public/assets/notes/the-physics-laws-of-life/goldilocks-challenge-reach.png` | 1440x960 | `blog-photo-figure` |
| Entropy / upkeep photo | `public/assets/notes/the-physics-laws-of-life/maintenance-against-entropy.png` | 1440x960 | `blog-photo-figure` |

The note has explicit section breaks for momentum, gravity, entropy, and waves. Three in-article figures are enough: momentum gets the lead image and OG crop, gravity gets a physical challenge scene, and entropy gets an upkeep scene. The short closing waves section remains text-only so the article does not become visually crowded.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no logos, no brand marks, no watermark, no poster, no signs, no fake dashboard labels, no UI labels, no notebook writing, no calendar dates, no app interface, no notification text, no physics formulas, no literal infographic, no abstract law diagram, no distorted hands, no extra fingers, no uncanny faces, no celebrity likeness, no exact author likeness, no luxury/status signaling, no fantasy, no surreal glow, no motivational-poster style, no corporate stock-photo staging.

## OG / Lead Prompt: First Push Inertia

Primary prompt used:

Create a photorealistic editorial lifestyle image about inertia: the hardest part is the first push, but once motion begins the work can keep moving. Show a modest Vietnamese or Southeast Asian home-office desk in soft morning light, lived-in but tidy, with warm wood, off-white paper, and a muted green plant accent. One Vietnamese or Southeast Asian adult professional, generic and not an exact likeness of any real person, is starting a task with a small concrete action. Their hands are opening a plain notebook to a blank page and nudging a heavy ceramic mug or smooth paperweight slightly forward beside a closed laptop, suggesting a tiny first push. The person looks calm and a little hesitant but ready to begin. Use high-end photorealistic editorial lifestyle photography, natural skin texture, realistic hands, practical desk objects, vivid but restrained. Horizontal 16:9 panorama, desk-level three-quarter angle, central safe area for the person, blank notebook, closed laptop, mug/paperweight, pencil, and plant; leave a visually calm lower-right corner for a local watermark added later; should crop cleanly to 1200x630 for Open Graph. Gentle morning window light with soft shadows, grounded, reflective, ordinary. No readable writing anywhere; no model-rendered watermark; no brand marks; no text in the image; hands must be anatomically plausible.

Generation:
- Export final in-article crop at `1600x900`.
- Export OG crop at `1200x630`.
- Leave lower-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A professional opens a blank notebook and nudges a mug forward on a quiet desk before starting the first small action.`
- EN caption: `The first push matters because it gives momentum something real to continue.`
- VI alt: `Một người đi làm mở cuốn sổ trắng và đẩy nhẹ chiếc cốc trên bàn yên tĩnh trước khi bắt đầu hành động nhỏ đầu tiên.`
- VI caption: `Cú đẩy đầu tiên quan trọng vì nó cho động lượng một thứ thật để tiếp tục.`

Insertion:
- EN: after the momentum paragraph ending `a perfect plan that never leaves the page.`
- VI: after the quán tính paragraph ending `không bao giờ rời trang giấy.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/the-physics-laws-of-life/first-push-inertia.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Goldilocks Challenge Reach

Primary prompt used:

Create a photorealistic editorial lifestyle image about the Goldilocks principle: growth happens when the challenge sits just above current capacity, not far below or far beyond it. Show a quiet indoor climbing or bouldering gym with clean, neutral walls and soft natural daylight; no visible brand names, signs, route labels, or readable text. One Vietnamese or Southeast Asian adult professional in simple athletic clothes, generic and not an exact likeness of any real person, reaches carefully for a climbing hold just slightly above comfortable reach. A second person is nearby in a calm spotting posture, partially visible and unobtrusive. The climber looks focused, not heroic or panicked. Use high-end photorealistic editorial lifestyle photography, human and grounded, realistic bodies and hands, vivid but restrained. 3:2 composition suitable for 1440x960 article figure, three-quarter side angle, the climber and the slightly higher hold clearly visible, enough calm lower-right area for a local watermark added later. Soft daylight mixed with gentle indoor light, calm effort, practical growth, no extreme sports drama. Warm neutrals, muted teal/green and chalky gray accents. No readable writing anywhere; no model-rendered watermark; no brand marks; no text in the image; hands and limbs must be anatomically plausible; climbing holds should look realistic and safe.

Generation:
- Export final in-article crop at `1440x960`.
- Keep the just-above-reach hold and calm spotter visible.
- Leave lower-right corner clear enough for local watermark post-processing.

Localized copy:
- EN alt: `A climber reaches for a hold just above comfortable reach while a spotter stays nearby in a quiet climbing gym.`
- EN caption: `Growth tends to live slightly above the current grip, where effort stretches without becoming collapse.`
- VI alt: `Một người leo tường với tay tới điểm bám hơi quá tầm thoải mái, trong khi một người hỗ trợ đứng gần bên.`
- VI caption: `Sự lớn lên thường nằm nhỉnh hơn tầm nắm hiện tại, nơi nỗ lực kéo mình giãn ra mà chưa biến thành sụp đổ.`

Insertion:
- EN: after the gravity / Goldilocks paragraph.
- VI: after the trọng lực / Goldilocks paragraph.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/the-physics-laws-of-life/goldilocks-challenge-reach.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Maintenance Against Entropy

Primary prompt used:

Create a photorealistic editorial lifestyle image about entropy: left alone, desks, habits, systems, and codebases drift toward disorder, so order needs small continuous upkeep. Show a modest Vietnamese or Southeast Asian home-office desk at late afternoon, practical and lived-in. One side of the desk has a loose tangle of cables, blank cards, a dusty keyboard, and an overgrown plant; the other side is being calmly restored into order. One Vietnamese or Southeast Asian adult professional, generic and not an exact likeness of any real person, tidies the desk with quiet attention: one hand coiling a cable or stacking blank cards, the other near a cloth or notebook. The laptop screen is closed or blurred with no visible interface. The mood is maintenance, not perfection. Use high-end photorealistic editorial lifestyle photography, natural human texture, realistic hands, ordinary materials, vivid but restrained. 3:2 composition suitable for 1440x960 article figure, slightly overhead three-quarter desk view, contrast between disorder and restored order visible without looking staged, leave a calm lower-right corner for a local watermark added later. Warm late-afternoon window light, gentle shadows, grounded, patient, reflective. Warm wood, off-white paper, charcoal laptop, muted green plant, soft gray cable tones. Paper fibers, desk grain, cloth, matte laptop surface, ceramic cup, plant leaves. No readable writing anywhere; no model-rendered watermark; no brand marks; no text in the image; hands must be anatomically plausible; the scene should feel human and useful, not a cleaning advertisement.

Generation:
- Export final in-article crop at `1440x960`.
- Keep disorder and restored order in the same lived-in desk scene.
- Leave lower-right corner clear enough for local watermark post-processing.

Localized copy:
- EN alt: `A professional restores order to a cluttered desk by coiling cables and stacking blank cards beside an overgrown plant.`
- EN caption: `Order survives through upkeep: a few small resets before the mess becomes the system.`
- VI alt: `Một người đi làm dọn lại bàn làm việc lộn xộn bằng cách cuộn dây cáp và xếp những tấm thẻ trống cạnh một chậu cây mọc lan.`
- VI caption: `Trật tự sống được nhờ bảo dưỡng: vài lần reset nhỏ trước khi sự bừa bộn trở thành cả hệ thống.`

Insertion:
- EN: after the entropy paragraph ending `the real work lives.`
- VI: after the entropy paragraph ending `công việc thật sự sống.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/the-physics-laws-of-life/maintenance-against-entropy.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
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

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt/caption.
- Local routes load without broken images: `/en/notes/the-physics-laws-of-life`, `/vi/notes/the-physics-laws-of-life`.
- OG image resolves at `/og/notes/the-physics-laws-of-life.png`.
- `npm test`, `npm run typecheck`, and `npm run build:fast` pass after implementation.
- Nothing leaves local execution except the explicitly approved image-generation prompts.
