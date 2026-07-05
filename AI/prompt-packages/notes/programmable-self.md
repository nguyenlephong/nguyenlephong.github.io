# Visual prompt package: programmable-self

Scope: `notes` article only, slug `programmable-self`.

Source read:
- `public/notes-data/posts/programmable-self.json`
- `public/notes-data/vi/posts/programmable-self.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical desks, paper tools, natural light, and ordinary human attention.
- Calm, reflective, lived-in tone; systems thinking should feel human, not like a sci-fi control room.
- No model-rendered readable text, article titles, UI labels, company names, logos, signatures, watermarks, caption text, app names, calendar dates, or todo words inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core metaphor: the mind can be treated like a small operating system, with calendar as process scheduler, todo lists as wait queues, and mental models as framework code above the kernel.
- Core behavior: run the system long enough that trust stops being a daily debate; visible results compound slowly.
- Core mechanism: reflection is the meta-program that rewrites flawed loops.
- Core deciding quality: reliability, or plain discipline, turns the diagram into lived operation.

## Asset Plan

Recommended final assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/programmable-self.png` | 1200x630 | n/a |
| Lead/mindset photo | `public/assets/notes/programmable-self/trusting-the-system-desk.png` | 1600x900 | `blog-photo-panorama` |
| Components photo | `public/assets/notes/programmable-self/mindos-components-board.png` | 1440x960 | `blog-photo-figure` |
| Reflection/reliability photo | `public/assets/notes/programmable-self/reflection-reliability-loop.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`. The article has four compact sections but three distinct visual beats, so three in-article figures are enough: mindset, components, and the reflection/reliability close.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no logo, no brand mark, no watermark, no signature, no posters, no wall signs, no readable calendar dates, no todo labels, no app names, no UI labels, no code snippets, no dashboard words, no company names, no exact author likeness, no celebrity likeness, no robot, no exposed brain, no sci-fi control room, no fantasy glow, no motivational-poster style, no luxury/status signaling, no distorted hands, no extra fingers, no uncanny faces.

## OG And Lead Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at a modest apartment work desk in soft morning light, beginning the day by trusting a small personal system instead of second-guessing it. The person sits calmly with one hand near a closed or dimmed laptop, a blank notebook, a simple blank calendar pad, a small stack of blank task cards, a pen, a mug, and a small plant on a warm wooden desk. The scene should suggest a system that has been run long enough to feel reliable: ordinary tools arranged with quiet intention, no dramatic productivity theater, no scoreboard, no rush. Keep all paper, screens, cards, and calendar surfaces blank or abstract with no readable words, letters, numbers, dates, app labels, logos, or UI text. Documentary editorial photography, realistic skin texture, natural hands, real paper grain, natural fabric, warm apartment detail, 35mm lens, gentle depth of field, vivid but restrained colors. Wide 16:9-friendly composition that can also crop to 1.91:1 for OG; keep the person, notebook, blank calendar pad, task cards, and desk tools inside the central safe area; leave the lower-right corner visually calm for a local watermark added later.

Generation:
- Lead crop: export `1600x900`.
- OG crop: export `1200x630`.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese adult sits at a modest morning desk with a blank calendar pad, task cards, notebook, and laptop arranged into a calm personal system.`
- EN caption: `A system becomes easier to trust when it has run long enough that every morning is not another debate.`
- VI alt: `Một người Việt Nam ngồi ở bàn làm việc buổi sáng với calendar trống, thẻ việc, sổ tay và laptop được xếp thành một hệ cá nhân bình tĩnh.`
- VI caption: `Một hệ thống dễ tin hơn khi nó đã chạy đủ lâu để mỗi buổi sáng không còn là một cuộc tranh luận mới.`

Insertion recommendation:
- EN: after the first paragraph under `<h2 id="the-mindset">The mindset</h2>`, before `<h2 id="the-components">The components</h2>`.
- VI: after the first paragraph under `<h2 id="tam-the">Tâm thế</h2>`, before `<h2 id="thanh-phan">Các thành phần</h2>`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/programmable-self/trusting-the-system-desk.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: MindOS Components Board

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult mapping a personal operating system with physical tools on a compact wooden desk. Show three distinct but unlabeled zones: a blank calendar pad representing scheduling, a loose row of blank task cards representing a wait queue, and a notebook with simple abstract line-and-block sketches representing mental models above a kernel. A laptop may sit nearby but its screen must be blurred and abstract, with no readable UI, letters, numbers, logos, or code. The person's hands are arranging the blank cards into a queue, making the metaphor tactile and human rather than technical. Warm home-office or quiet studio setting, natural daylight, real paper texture, modest desk tools, small plant, pen, and mug. Documentary editorial photography, realistic hands, natural fabric, 50mm lens, useful shallow depth of field, vivid but restrained color. 3:2 composition for a `1440x960` crop; keep calendar, task cards, notebook, and hands central; leave the lower-right corner visually calm for a local watermark added later.

Generation:
- Export `1440x960`.
- Keep every card, notebook page, calendar surface, and laptop screen blank or abstract.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese adult arranges blank task cards beside a blank calendar pad and notebook sketches on a wooden desk.`
- EN caption: `Calendar, tasks, and mental models become more useful when they are treated as parts of one operating system.`
- VI alt: `Một người Việt Nam xếp các thẻ việc trống cạnh calendar trống và các phác thảo sổ tay trên bàn gỗ.`
- VI caption: `Calendar, việc cần làm và mental model hữu ích hơn khi mình xem chúng như các phần của cùng một hệ vận hành.`

Insertion recommendation:
- EN: after the components list, before `<h2 id="processes">Types of processes</h2>`.
- VI: after the components list, before `<h2 id="tien-trinh">Các kiểu tiến trình</h2>`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/programmable-self/mindos-components-board.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Reflection Reliability Loop

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at an evening apartment table reviewing a small personal system after the day has run. The person calmly moves one blank review card back into a neat cycle of blank cards around a closed notebook, a pen, a dim blank phone, and a small timer-shaped object with no numbers. The composition should suggest reflection at the start and end of a cycle, and reliability as the quiet discipline that makes the plan more than a diagram. Avoid any literal flowchart text; use only abstract shapes, blank cards, soft circular arrangement, and ordinary table objects. Warm evening lamp light, modest wooden table, lived-in apartment context, realistic hands, real paper grain, natural fabric, grounded and quiet. Documentary editorial photography, 50mm lens, shallow but useful depth of field, vivid but restrained colors. 3:2 composition for a `1440x960` crop; keep the card cycle, hands, notebook, and timer central; leave lower-right corner visually calm for local watermark.

Generation:
- Export `1440x960`.
- Keep all pages, cards, timer surfaces, and phone content blank or abstract.
- Leave the bottom-right corner visually calm for local watermark.

Localized copy:
- EN alt: `A Vietnamese adult moves a blank review card into a quiet cycle beside a notebook, phone, pen, and timer at an evening table.`
- EN caption: `Reflection gives the system plasticity; reliability is what keeps the rewritten rule alive tomorrow.`
- VI alt: `Một người Việt Nam đặt một thẻ review trống vào một vòng nhỏ cạnh sổ tay, điện thoại, bút và đồng hồ hẹn giờ trên bàn buổi tối.`
- VI caption: `Reflection giúp hệ thống mềm dẻo hơn; độ tin cậy là thứ giữ luật mới còn sống vào ngày mai.`

Insertion recommendation:
- EN: after the `Types of processes` list, before `<h2 id="qualities">The quality that decides everything</h2>`.
- VI: after the `Các kiểu tiến trình` list, before `<h2 id="pham-chat">Phẩm chất quyết định tất cả</h2>`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-figure">
  <img src="/assets/notes/programmable-self/reflection-reliability-loop.png" width="1440" height="960" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Watermark Guidance

- Do not include any watermark request in the image-generation prompts.
- Add `nguyenlephong.github.io` only after generation through local post-processing.
- Match the approved `cross-functional-teams` treatment: subtle bottom-right placement, low-contrast dark rounded label, readable only on close inspection, not competing with the subject.
- Reserve calm visual space in the lower-right corner of every generated crop before watermarking.

## Generation Blockers And Risks

- No external image-generation service should receive private repo files or unpublished source content without explicit operator approval; this package is the local handoff artifact.
- The main generation risk is accidental readable text on calendars, todo cards, timers, laptop screens, and notebooks. Use blank or abstract surfaces only.
- Avoid making the concept look like a literal operating-system dashboard, code editor, robot assistant, brain diagram, or productivity advertisement.
- Keep the scenes Vietnamese/Southeast Asian and human, but generic; do not attempt author likeness.

## Implementation Notes

- Generate final PNGs, resize/crop locally, and watermark locally after generation.
- Original generated source files should remain outside the repo; only final resized/watermarked PNGs should be copied into the target asset paths.
- Insert the same image paths in EN and VI; localize only `alt` and `figcaption`.
- Preserve the article date, slug, tags, topic, SEO paths, analytics, engagement behavior, and unrelated files.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/programmable-self`, `/vi/notes/programmable-self`.
- OG image resolves at `/og/notes/programmable-self.png`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
