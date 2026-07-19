# Visual prompt package: software-engineering-fatigue

Scope: `notes` article only, slug `software-engineering-fatigue`.

Source read:
- `content/notes-data/posts/software-engineering-fatigue.json`
- `content/notes-data/vi/posts/software-engineering-fatigue.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with real people, practical workspaces, desk tools, natural light, and concrete article context.
- No model-rendered readable text, article titles, UI labels, formulas, code text, company names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core metaphor: software learning can feel like assembling interlocking bricks, then prebuilt blocks, then blocks made from other blocks.
- Core fatigue: each abstraction layer helps shipping but hides the foundation until understanding the base becomes impractical.
- Closing contrast: physics tends to reveal deeper universal layers; modern software often asks people to learn arbitrary human-made inventions that do not compound cleanly.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/software-engineering-fatigue.png` | 1200x630 | n/a |
| Lead/intro photo | `public/assets/notes/software-engineering-fatigue/abstraction-blocks-at-night.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/software-engineering-fatigue/lifting-the-layered-block.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene for the OG crop and first in-article figure. Use the second scene near the paragraph where the article names the impractical cost of finding what is underneath.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no formulas, no code text, no UI labels, no company names, no logos, no brand marks, no watermark, no signs, no exact author likeness, no celebrity likeness, no robot, no fantasy glow, no distorted hands, no extra fingers, no stock-photo smile, no dramatic despair, no motivational poster style.

## OG / Lead Prompt: Abstraction Blocks At Night

Primary prompt:

Photorealistic editorial lifestyle photograph for a reflective software engineering note about fatigue from layered abstractions. Scene: a Vietnamese software engineer at a modest wooden desk in a lived-in home office at late evening, hands paused above a laptop and a small spread of unbranded interlocking toy bricks. The bricks form a few simple base pieces near the foreground and increasingly complex prebuilt block towers toward the laptop, suggesting layers built on layers. The laptop screen must show only soft abstract blurred rectangles and muted code-like shapes with absolutely no readable text, letters, numbers, logos, UI labels, or brand marks. A notebook is open but blank, a pen rests across it, coffee mug, desk lamp, small plant, warm tungsten light mixed with cool city window light. Mood: quiet mental fatigue, curiosity still present, not burnout cliche. Documentary editorial photography, realistic skin texture, natural hands, real desk texture, 35mm lens, f/2.8, gentle grain, vivid but restrained colors. Wide 1.91:1 composition for Open Graph, central subject and brick layers clear, lower-right corner visually calm for a local watermark added later.

Generation:
- Source file: built-in image generation output `ig_01a3130d7340a0c7016a4a358c98948191836a2022edc7a8cb.png`.
- Export `1200x630` to `public/og/notes/software-engineering-fatigue.png`.
- Export `1600x900` to `public/assets/notes/software-engineering-fatigue/abstraction-blocks-at-night.png`.
- Keep laptop content abstract and leave the lower-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese software engineer studies layered toy-brick structures beside a laptop with abstract blocks on the screen.`
- EN caption: `The first bricks are easy to see; the fatigue begins when every useful block is built from another block you did not make.`
- VI alt: `Một kỹ sư phần mềm Việt Nam nhìn các khối gạch đồ chơi xếp nhiều tầng bên cạnh laptop chỉ hiện các mảng trừu tượng.`
- VI caption: `Những viên gạch đầu tiên còn dễ nhìn thấy; cảm giác mệt bắt đầu khi mỗi khối hữu ích lại được xây từ một khối khác mình không tạo ra.`

Insertion recommendation:
- EN: after the second paragraph ending `the studs each time.`
- VI: after the second paragraph ending `từng nấc gạch mỗi lần.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/software-engineering-fatigue/abstraction-blocks-at-night.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Lifting The Layered Block

Primary prompt:

Photorealistic editorial lifestyle photograph for a reflective software engineering note about learning through too many abstraction layers. Scene: a quiet Vietnamese engineer at a practical desk late at night, carefully lifting the top of a small unbranded tower of interlocking toy bricks to reveal mixed, irregular base pieces underneath. Beside the bricks are a closed laptop with a screen showing only soft abstract blurred rectangles, a blank notebook, loose blank index cards arranged in stacked layers, a simple glass prism catching desk-lamp light, and a small metal pendulum or physics desk object. The image should contrast arbitrary human-made layers with the calm pull of underlying physical reality, without becoming surreal. No readable words anywhere: all paper blank, all screens abstract, no letters, no numbers, no formulas, no logos, no labels, no brand marks, no watermark. Warm desk lamp, cool window light, natural shadows, realistic hands, grounded human posture, documentary editorial photography, 50mm lens, f/3.2, rich desk texture, vivid but restrained colors. 3:2 composition for an inline article figure, lower-right corner visually calm for a local watermark added later.

Generation:
- Source file: built-in image generation output `ig_0f0ec90a367565c5016a4a36471f848191bbc001fa68576a05.png`.
- Export `1440x960` to `public/assets/notes/software-engineering-fatigue/lifting-the-layered-block.png`.
- Keep cards, notebook, and screen blank or abstract. Do not add formula text.
- Leave the lower-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese engineer lifts the top layer of a toy-brick tower to reveal mixed pieces underneath beside a prism and pendulum.`
- EN caption: `Looking underneath has a cost: sometimes the layer you lift only reveals more layers, some useful and some merely inherited.`
- VI alt: `Một kỹ sư Việt Nam nhấc lớp trên của tháp gạch đồ chơi để lộ các mảnh lộn xộn bên dưới cạnh lăng kính và con lắc nhỏ.`
- VI caption: `Nhìn xuống bên dưới cũng có cái giá của nó: đôi khi lớp vừa được nhấc lên chỉ mở ra thêm nhiều lớp khác, có lớp hữu ích và có lớp chỉ là thứ được thừa hưởng.`

Insertion recommendation:
- EN: after the paragraph ending `that artificiality is the source of the fatigue.`
- VI: after the paragraph ending `chính sự nhân tạo đó là nguồn cơn của nỗi mệt.`

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/software-engineering-fatigue/lifting-the-layered-block.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Implementation Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated files were left outside the repository and not edited in place.
- Do not ask the image model to render the site watermark, article title, prompt text, code text, UI labels, company names, formulas, or any readable writing.
- Do not change date, slug, tags, topic, SEO paths, analytics, or engagement behavior.

## Verification Checklist

- Generated files exist at the exact paths above.
- `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/software-engineering-fatigue`, `/vi/notes/software-engineering-fatigue`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
