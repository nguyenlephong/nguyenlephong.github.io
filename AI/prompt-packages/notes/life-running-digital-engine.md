# Visual prompt package: life-running-digital-engine

Scope: `notes` article only, slug `life-running-digital-engine`.

Source read:
- `public/notes-data/posts/life-running-digital-engine.json`
- `public/notes-data/vi/posts/life-running-digital-engine.json`
- Approved reference: commit `48ac924f16`, article `cross-functional-teams`

Reference style:
- Photorealistic editorial/lifestyle scenes with real people, practical desks, personal tools, natural light, and ordinary human moments.
- No model-rendered readable text, article titles, UI labels, company names, logos, signatures, or watermarks.
- Add `nguyenlephong.github.io` only through local post-processing, bottom-right, subtle dark rounded label matching the approved `cross-functional-teams` sample.
- Keep generated people generic. Do not render an exact likeness of the author or any real public person.

Article read:
- Core idea: recurring decisions can be treated less like fresh daily judgment calls and more like rules decided once that simply run.
- Core implementation: apps, notifications, and first-screen cues reduce the mental tax of remembering and re-deciding.
- Core sub-systems: a driver todo system for opportunities, an accountability system for routines and obligations, and a reflection cadence that keeps the whole engine correcting itself.

## Final Assets

| Role | Target path | Size | Class |
| --- | --- | ---: | --- |
| OG image | `public/og/notes/life-running-digital-engine.png` | 1200x630 | n/a |
| Lead/intro photo | `public/assets/notes/life-running-digital-engine/first-screen-rule-engine.png` | 1600x900 | `blog-photo-panorama` |
| Section photo | `public/assets/notes/life-running-digital-engine/opportunity-backlog.png` | 1440x960 | `blog-photo-figure` |
| Section photo | `public/assets/notes/life-running-digital-engine/routine-reflection-cadence.png` | 1440x960 | `blog-photo-figure` |

Use the lead scene as the OG source direction, exported separately at `1200x630`.

## Common Negative Prompt

No readable text, no pseudo-text, no letters, no numbers, no article title, no typography, no signs, no logos, no brand marks, no UI labels, no app names, no model-rendered watermark, no signatures, no posters, no celebrity likeness, no exact author likeness, no distorted hands, no extra fingers, no uncanny faces, no fantasy glow, no motivational-poster style, no stock-photo smile, no luxury/status signaling.

## OG And Lead Prompt

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at a modest apartment work desk in soft morning light, organizing daily life through a small personal rule-engine. The person is calm and focused, with one hand near a smartphone on the first screen showing only abstract blurred notification cards and icon-like shapes with no readable words, letters, numbers, app names, logos, or UI labels. Nearby are a laptop with blurred geometric panels, a blank notebook, blank calendar cards, a pen, keys, a mug, and a small plant. The scene should make recurring decisions feel already decided once and ready to run: the right cue surfaces at the right moment, reducing mental tax without feeling cold or mechanical. Warm Vietnamese home-office setting, practical wood desk, lived-in but tidy, no luxury/status signaling. Documentary editorial photography, realistic skin texture, natural hands, real paper grain, natural fabric, 35mm lens, gentle depth of field, vivid but restrained colors. Wide 16:9-friendly composition that can also crop to 1.91:1 for OG; keep the person, phone, notebook, blank cards, and desk tools inside the central safe area; leave the lower-right corner visually calm for a local watermark added later.

Generation:
- Lead crop: export `1600x900`.
- OG crop: export `1200x630`.
- Leave the bottom-right corner visually calm for the local watermark.

Localized copy:
- EN alt: `A Vietnamese adult reviews abstract first-screen cues beside a notebook and laptop at a modest home desk.`
- EN caption: `A small system feels lighter when the right cue reaches the first screen before the day becomes another debate.`
- VI alt: `Một người Việt Nam xem các tín hiệu trừu tượng trên màn hình đầu tiên cạnh sổ tay và laptop ở bàn làm việc tại nhà.`
- VI caption: `Một hệ nhỏ nhẹ hơn khi đúng tín hiệu xuất hiện trên màn hình đầu tiên trước khi ngày mới biến thành một cuộc tranh luận nữa.`

Insertion recommendation:
- EN: after the paragraph about apps, notifications, and keeping the right things on the first screen.
- VI: after the paragraph about `thông báo` and `màn hình đầu tiên`.

## Section Prompt: Opportunity Backlog

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at a compact wooden desk choosing one opportunity from a personal backlog. The person is in the driver's seat posture, leaning forward with focused but cheerful urgency, moving one blank task card from a loose spread of blank cards into a small next area with no readable text, letters, numbers, labels, or symbols. A laptop nearby shows only abstract blurred task blocks and soft panels, no UI labels or words. Include a timer-shaped object with no numbers, a pen, coffee cup, and simple desk tools. The scene should communicate that these tasks are opportunities with positive outcomes, not scheduled obligations: quick movement, agency, and progress without pressure theater. Warm apartment or small home-office setting, practical wood, natural daylight, modest and lived-in. Documentary editorial photography, realistic skin texture, natural hands, real paper grain, natural fabric, 50mm lens, shallow but useful depth of field, vivid but restrained colors. 3:2 composition for a `1440x960` crop; hand, blank cards, laptop, and chosen opportunity card should be central; lower-right corner visually calm for a local watermark added later.

Generation:
- Export `1440x960`.
- Keep all cards, notebooks, and screens blank or abstract.
- Leave lower-right corner free for local watermark.

Localized copy:
- EN alt: `A Vietnamese adult moves one blank task card from a personal backlog into focus beside an abstract laptop board.`
- EN caption: `The driver system keeps the backlog as opportunities to pick up, not obligations already arguing for time.`
- VI alt: `Một người Việt Nam chuyển một thẻ việc trống từ backlog cá nhân vào vùng tập trung bên cạnh bảng laptop trừu tượng.`
- VI caption: `Hệ người lái giữ backlog như các cơ hội để nhặt lấy, không phải nghĩa vụ đã chen vào lịch.`

Insertion recommendation:
- EN: after the paragraph explaining that routine and scheduled tasks are excluded from the driver backlog.
- VI: after the paragraph explaining that the backlog contains opportunities, not obligations.

## Section Prompt: Routine Reflection Cadence

Primary prompt:

Photorealistic editorial lifestyle photograph of a Vietnamese adult at an evening apartment table reviewing a small life system after the day has run. The person sits slightly left of center and calmly moves one blank recurring review card into place. On the table are a smartphone with only abstract blurred notification cards, keys, a folded grocery tote, a blank planner page, three blank recurring review cards arranged as a rhythm, a plain habit tracker made only of dots or soft shapes with no letters or numbers, a pen, and a tea cup. Keep all objects in the left and center of the frame; the lower-right corner must be a quiet empty area of warm wooden table for a local watermark added later. The scene should show non-negotiable routines and a reflection cadence that keeps the system correcting itself instead of drifting. Warm Vietnamese apartment evening light, modest wood table, everyday objects, lived-in texture, grounded and quiet, no productivity theater. Documentary editorial photography, realistic hands, natural fabric, real paper grain, 50mm lens, shallow but useful depth of field, vivid but restrained colors.

Generation:
- Export `1440x960`.
- Keep all pages, cards, tracker dots, and phone content blank or abstract.
- Leave lower-right corner free for local watermark.

Localized copy:
- EN alt: `A Vietnamese adult arranges blank review cards beside a planner, phone, keys, and grocery tote at an evening table.`
- EN caption: `Routines stay useful when they can run with little debate and still return to a quiet review before they drift.`
- VI alt: `Một người Việt Nam xếp các thẻ review trống cạnh planner, điện thoại, chìa khóa và túi đi chợ vào buổi tối.`
- VI caption: `Những routine có ích hơn khi chúng chạy với ít tranh luận, rồi vẫn quay về một nhịp chiêm nghiệm đủ yên để không trôi dạt.`

Insertion recommendation:
- EN: after the paragraph about the daily, weekly, and monthly reflection cadence.
- VI: after the paragraph about the `ngày`, `tuần`, and `tháng` cycles.

## Implementation Notes

- Final PNGs were generated with the built-in image generation tool, resized/cropped locally with `sharp`, and watermarked locally after generation.
- Original generated source files were left under `codex-home/generated_images/...`; only final resized/watermarked PNGs were copied into the repo.
- The article has clear section breaks and multiple themes, so three in-article images are used.
- Do not change date, slug, tags, topic, SEO paths, analytics, or engagement behavior.

## Verification Checklist

- Generated files exist at the exact paths above.
- `file` or `sharp.metadata()` reports PNG with expected dimensions.
- EN and VI JSON contain matching figure blocks with localized alt text and captions.
- Local routes to verify after insertion: `/en/notes/life-running-digital-engine`, `/vi/notes/life-running-digital-engine`.
- Full Engineer verification after insertion: `npm test`, `npm run typecheck`, `npm run build:fast`, plus route and image asset `200 image/png` checks.
