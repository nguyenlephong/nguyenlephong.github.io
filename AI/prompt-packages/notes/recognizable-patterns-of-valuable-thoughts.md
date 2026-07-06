# Visual prompt package: recognizable-patterns-of-valuable-thoughts

Scope: `notes` article only, slug `recognizable-patterns-of-valuable-thoughts`.

Source read:
- `public/notes-data/posts/recognizable-patterns-of-valuable-thoughts.json`
- `public/notes-data/vi/posts/recognizable-patterns-of-valuable-thoughts.json`
- `AI/skills/calm-content-writer/SKILL.md`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Generation status:
- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated files remain under the Codex generated images directory and were not edited in place.
- No article JSON, routes, analytics, engagement code, commits, pushes, or deploys were changed in this visual gate.
- Generation blockers: none. The outputs avoid readable text and have usable lower-right space for the local site mark.

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical desk tools, natural light, and everyday reflective context.
- Human, calm, vivid, grounded, and article-specific. Avoid generic meditation imagery, mystical symbolism, glowing brain graphics, and productivity influencer staging.
- No model-rendered readable text, article titles, UI labels, company names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle text treatment matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any public person.

Article read:
- Low-value thoughts are easier to notice first: replaying the past, imagining the future for its own sake, self-imaging, and circling problems with no possible action.
- The central metaphor is the mind spinning while the wheels never touch the road.
- The useful move is to settle enough to observe the thought from outside the loop and ask whether it is going anywhere.
- Valuable thoughts share one property: they can lead somewhere, either to action or to new understanding.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/recognizable-patterns-of-valuable-thoughts.png` | 1200x630 | n/a |
| Lead/intro photo | `public/assets/notes/recognizable-patterns-of-valuable-thoughts/noticing-the-loop.png` | 1600x900 | `blog-photo-panorama` |
| Closing section photo | `public/assets/notes/recognizable-patterns-of-valuable-thoughts/thought-becomes-next-step.png` | 1440x960 | `blog-photo-figure` |

Short-article recommendation:
- Use two inline images only. The article is a 2-minute note, so a third inline image would make the page feel heavier than the text.
- Let the OG image carry the overall loop-to-path metaphor. Use the inline images for the two article movements: noticing the low-value loop, then turning a useful thought into a next step.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no logos, no brand marks, no model-rendered watermark, no poster, no signs, no UI labels, no company names, no exact author likeness, no celebrity likeness, no spiritual or mystical symbols, no glowing fantasy, no surreal brain graphics, no AI robot, no distorted hands, no extra fingers, no motivational-poster style, no productivity influencer staging, no melodrama.

## OG Prompt: Loop Becomes A Path

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at a quiet apartment desk in the blue hour, paused between unhelpful mental loops and useful thought. The person sits beside a wooden desk with a notebook open to blank pages, a pencil, a few blank index cards arranged in a gentle path, a face-down phone, a ceramic cup, and a small plant. On the desk, a loose coil of plain thread or cable circles near the foreground, then straightens toward one blank card and pencil, suggesting the shift from circular thinking to a concrete next step. The person's posture is calm and observant, looking slightly down and to the side as if watching a thought instead of being carried by it. Quiet modern Vietnamese apartment workspace, window light, soft city blur outside, warm lamp mixed with cool evening light, lived-in but tidy. Documentary editorial photography, realistic skin texture, real paper texture, natural hands, 35mm lens, f/2.8, vivid but restrained colors, human and grounded, not mystical. Wide 1.91:1-friendly frame, subject, coil, blank cards, and pencil in the central safe area, lower-right corner visually calm for a local watermark.

Generation:
- Export `1200x630`.
- Keep the loop-to-path metaphor visible in the central safe area.
- Leave the bottom-right corner visually calm for the local watermark.

## Lead Prompt: Noticing The Loop

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at a wooden desk in a quiet room, with repeated blank index cards and a loose white cable or thread circling in a loop near a notebook. The person is seated slightly back from the desk, hands relaxed, looking at the loop with calm but honest awareness, as if noticing that the mind keeps replaying the same problem. The scene should show mental motion without progress through physical objects, not through surreal graphics. Lived-in apartment workspace or small study, soft morning window light, plant, ceramic cup, face-down phone, closed laptop pushed aside, blank notebook pages. Documentary editorial photography, realistic skin texture, real paper texture, natural hands, 35mm lens, f/3.2, restrained warm wood, soft green plants, quiet human mood. 16:9 panorama, loop and repeated blank cards in foreground/midground, person and notebook in central safe area, lower-right corner calm for local watermark.

Generation:
- Export `1600x900`.
- Keep cards and notebook blank or texture-only.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese adult sits at a quiet desk, observing blank cards arranged around a loose cable loop beside an open notebook.`
- EN caption: `Some thoughts look active from the inside, but from a little distance they reveal the same circle repeating.`
- VI alt: `Một người Việt ngồi ở bàn làm việc yên tĩnh, quan sát những tấm thẻ trống xếp quanh một vòng dây bên cạnh cuốn sổ mở.`
- VI caption: `Có những suy nghĩ bên trong trông rất bận rộn, nhưng khi lùi ra một chút ta mới thấy chúng chỉ đang lặp lại cùng một vòng.`

Insertion recommendation:
- EN: after the low-value-thoughts list and before the paragraph beginning `The common thread:`.
- VI: after the low-value-thoughts list and before the paragraph beginning `Sợi chỉ chung:`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/recognizable-patterns-of-valuable-thoughts/noticing-the-loop.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Closing Prompt: Thought Becomes Next Step

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at a warm wooden desk, turning an abstract thought into a concrete next step. The person writes or points with a pencil beside blank index cards arranged as a simple path from a loose white loop toward one open notebook and a small practical object like a calendar block or plain checklist card, but all surfaces must be blank and unreadable. The scene should feel like consolidating something recently learned: calm, disciplined, and observant, with the thought now connected to action or understanding. Quiet apartment workspace, late afternoon light, small plant, ceramic cup, closed laptop partly out of frame, face-down phone, paper cards, notebook with blank pages. Documentary editorial photography, realistic skin texture, real paper texture, natural hands, 50mm lens, f/3.5, calm human mood, vivid but restrained colors, practical not symbolic. 3:2 frame, hands, pencil, blank cards, and open notebook visible, lower-right corner visually calm for local watermark.

Generation:
- Export `1440x960`.
- Cards and notebook pages must remain blank or texture-only.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese adult uses a pencil to turn blank cards and an open notebook into a simple next-step path on a wooden desk.`
- EN caption: `A valuable thought does not need to be dramatic; it only needs to leave a clearer next movement behind.`
- VI alt: `Một người Việt dùng bút chì sắp xếp các tấm thẻ trống và cuốn sổ mở thành một lối đi kế tiếp trên bàn gỗ.`
- VI caption: `Một suy nghĩ có giá trị không cần phải kịch tính; nó chỉ cần để lại một chuyển động kế tiếp rõ hơn.`

Insertion recommendation:
- EN: after the paragraph beginning `And the probably-valuable thoughts?` and before the references heading.
- VI: after the paragraph beginning `Còn những suy nghĩ nhiều-khả-năng-giá-trị?` and before the references heading.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/recognizable-patterns-of-valuable-thoughts/thought-becomes-next-step.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes For Engineer

- Insert matching localized figure blocks into both EN and VI article JSON at the recommendations above.
- Preserve article date, slug, topic, tags, author, locale routes, SEO behavior, analytics, and engagement behavior.
- Do not ask the image model to render the site watermark, article title, prompt text, code text, UI labels, company names, or any readable writing.
- Keep this to the two inline figures above unless the layout review explicitly asks for more imagery.

## Verification Checklist

- Prompt package exists at `AI/prompt-packages/notes/recognizable-patterns-of-valuable-thoughts.md`.
- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions after Engineer integration.
- Local routes to verify after insertion: `/en/notes/recognizable-patterns-of-valuable-thoughts`, `/vi/notes/recognizable-patterns-of-valuable-thoughts`.
- OG image should resolve at `/og/notes/recognizable-patterns-of-valuable-thoughts.png`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
- Privacy: no private files, source screenshots, credentials, exact personal likenesses, or non-public repository content were sent to image generation.
