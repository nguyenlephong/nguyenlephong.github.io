# Visual prompt package: modal-thinking

Scope: `notes` article only, slug `modal-thinking`.

Source read:
- `public/notes-data/posts/modal-thinking.json`
- `public/notes-data/vi/posts/modal-thinking.json`
- Approved reference: commit `48ac924f16`, `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle images with practical human context.
- Real desks, notebooks, laptops, quiet rooms, tools, light, and ordinary routines.
- Calm, reflective, lived-in tone; discipline without motivational-poster energy.
- No model-rendered readable text, titles, logos, UI labels, signatures, brand marks, watermarks, or caption text inside images.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

## Asset Plan

Final implemented assets:

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/modal-thinking.png` | 1200x630 | n/a |
| Decision mode photo | `public/assets/notes/modal-thinking/decision-mode-evidence.png` | 1600x900 | `blog-photo-panorama` |
| Execution mode photo | `public/assets/notes/modal-thinking/execution-mode-follow-through.png` | 1600x900 | `blog-photo-panorama` |

The article is short and has two clear sections, so two in-article figures are enough. The OG uses a separate crop from the same visual direction as the lead/decision-mode scene.

## Common Negative Prompt

No readable text, no article title, no typography, no logos, no brand marks, no watermark, no poster, no signs, no fake dashboard labels, no UI labels, no readable notebook pages, no readable calendar dates, no app interface, no notification text, no distorted hands, no extra fingers, no uncanny faces, no celebrity likeness, no exact author likeness, no luxury/status signaling, no trophy imagery, no literal split-screen graphic, no abstract mode-switch diagram, no fantasy, no surreal glow, no motivational-poster style, no corporate stock-photo staging.

## OG Prompt

Primary prompt used:

Photorealistic editorial lifestyle photo about separating deciding from doing. Show a calm Vietnamese or Southeast Asian professional at a tidy desk in soft daylight, with two distinct zones: on one side a notebook, pencil, and decision notes; on the other side a closed laptop or focused work setup ready for execution. The person is pausing thoughtfully, not stressed, conveying clarity and discipline. Modern home-office or quiet studio desk, real surfaces, subtle everyday details, no brand marks. One adult professional, natural posture, hands near notebook and laptop, calm expression. Photorealistic editorial lifestyle photography, high-end magazine realism, vivid but natural. Wide horizontal 16:9 safe composition with enough negative space for social preview cropping, balanced desk-level angle. Warm morning daylight, gentle shadows, quiet focus. Warm wood, white paper, muted teal or green accent, neutral clothing. No readable words, no titles, no UI labels, no logos, no watermark, no model-rendered text, no surreal split-screen graphics. Avoid diagrams, typography, posters, fake text, brand logos, hands with distorted anatomy, extra fingers, cluttered office chaos.

Generation:
- Export `1200x630`.
- Keep the person, notebook, and closed laptop inside the central safe area.
- Leave the bottom-right corner visually calm for the local watermark.

## Section Prompt: Decision Mode Evidence

Primary prompt used:

Realistic editorial photo that visualizes decision mode as calm evidence gathering from one's own history. A Vietnamese or Southeast Asian professional sits at a quiet desk reviewing a notebook, blank sticky notes, and a simple wall calendar with intentionally unreadable marks. The scene should feel empirical and grounded, as if the person is looking at past choices before choosing the next step. Compact apartment workspace or quiet office nook, daylight, personal but tidy. Adult professional, hands arranging blank note cards and a notebook, focused but relaxed. Photorealistic editorial lifestyle photography, natural human texture, not corporate stock. Horizontal 16:9, desk-level view, clear space around objects, no readable text anywhere. Soft afternoon light, reflective, composed. Neutral paper, warm desk, muted green/blue accents. No readable words, no charts with labels, no titles, no logos, no watermark, no model-rendered text. Avoid dramatic stress, fake UI screens, obvious text, messy clutter, surreal symbols, distorted fingers.

Generation:
- Export `1600x900`.
- Keep the wall calendar and note cards abstract enough that no words or numbers are readable.
- Leave lower-right corner free for local watermark.

Localized copy:
- EN alt: `A focused professional reviews blank note cards and a notebook before choosing the next action.`
- EN caption: `Decision mode gets calmer when the evidence from your own history is on the table before the next move is chosen.`
- VI alt: `Một người đi làm tập trung xem lại các tấm ghi chú trống và cuốn sổ trước khi chọn bước tiếp theo.`
- VI caption: `Chế độ quyết định bình tĩnh hơn khi dữ liệu từ chính lịch sử của mình đã nằm trên bàn trước lúc chọn nước đi kế tiếp.`

Insertion:
- EN: after the decision-mode list, before `<h2 id="execution-mode">Execution mode</h2>`.
- VI: after the decision-mode list, before `<h2 id="che-do-thuc-thi">Chế độ thực thi</h2>`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/modal-thinking/decision-mode-evidence.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
  <figcaption>...</figcaption>
</figure>
```

## Section Prompt: Execution Mode Follow-Through

Primary prompt used:

Realistic editorial photo that visualizes execution mode as following through after the decision is made. A Vietnamese or Southeast Asian professional is working steadily at a desk with a closed notebook pushed aside and a laptop open but its screen content blurred and unreadable. The posture should communicate commitment and calm momentum, not panic. Evening desk setup in a quiet room, lamp light and soft city-window background. Adult professional typing or arranging work materials, focused expression, notebook closed beside the laptop. Photorealistic editorial lifestyle photography, human, vivid, grounded. Horizontal 16:9, three-quarter desk view, enough foreground for the closed notebook and work tools, no readable text. Warm task lamp, calm determined mood, subtle contrast. Warm amber light, charcoal laptop, neutral paper, small green plant accent. No readable words, no UI labels, no logos, no watermark, no model-rendered text, keep hands anatomically plausible. Avoid motivational posters, visible app screens, brand marks, messy cables, excessive drama, surreal split imagery.

Generation:
- Export `1600x900`.
- Keep the closed notebook visible as a sign that deciding is over.
- Leave lower-right corner free for local watermark.

Localized copy:
- EN alt: `A professional works under a desk lamp with a closed notebook beside the laptop, following through after the decision is made.`
- EN caption: `Execution mode protects the work from being reopened every few minutes; the review can wait until the stride is finished.`
- VI alt: `Một người đi làm làm việc dưới ánh đèn bàn, bên cạnh cuốn sổ đã đóng, tiếp tục thực thi sau khi quyết định đã được đưa ra.`
- VI caption: `Chế độ thực thi bảo vệ công việc khỏi việc bị mở lại từng vài phút; phần đánh giá có thể đợi đến khi sải bước đã xong.`

Insertion:
- EN: after the execution-mode list, before the closing paragraph starting `This way you save`.
- VI: after the execution-mode list, before the closing paragraph starting `Bằng cách này`.

Figure snippet:

```html
<figure class="blog-figure blog-photo-panorama">
  <img src="/assets/notes/modal-thinking/execution-mode-follow-through.png" width="1600" height="900" loading="lazy" decoding="async" alt="..." />
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
- Do not add a third in-article figure unless the article body is expanded later; the current note reads best with one figure per mode.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` reports PNG with expected dimensions.
- EN and VI JSON include matching figure blocks with localized alt/caption.
- Local routes load without broken images: `/en/notes/modal-thinking`, `/vi/notes/modal-thinking`.
- OG image resolves at `/og/notes/modal-thinking.png`.
- `npm test`, `npm run typecheck`, and `npm run build:fast` pass after implementation.
- Nothing leaves local execution except the explicitly approved image-generation prompts.
