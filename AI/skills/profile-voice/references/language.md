# Language rules (EN + VI)

Distilled from `AI/research/profile-voice-language-2026-11-12.md` (sources S1-S23 are cited there). Copied here so the rules survive if research notes move.

## 1. Principles (EN)

**E1. Lead with the result or the action, then the mechanism.** "Accomplished [X] as measured by [Y] by doing [Z]" (S11). Orosz: "focus on what you achieved instead of what you did" and "Accomplished {impact} as measured by {number} by doing {specific contribution}" (S8). Auburn warns against pasting the template 15 times (S11), so vary the order: number first in figures, verb first in bullets.

**E2. Every claim carries a mechanism or a number a peer could check.** "To stand out, be specific." Hand-wavy lists of responsibilities give the reader nothing (S9). Only about 15% of engineer resumes include numbers such as user counts (S8 interview context). If no number exists, name the mechanism (`retry queue`, `kill switch`, `idempotent contract`), never an adjective.

**E3. Active voice, named actor.** "Make the doer the subject" (S1). "Active voice makes it clear who should do what" (S6). Orwell rule 4: "Never use the passive where you can use the active" (S7).

**E4. Short, plain words. Cut what adds no meaning.** use > utilize, to > in order to, also > in addition (S4). Drop "quite, very, quickly, easily, effectively" (S4). Orwell rules 2 and 3 (S7). Google: avoid "leverage" if you mean use, avoid "just", "simply", "easy" (S2).

**E5. Strong verbs, no hidden verbs.** "We analyze data", not "We conduct an analysis of the data"; watch for -ment, -tion, -ance nouns with weak verbs like make, give, have (S6). Avoid "responsible for" (S12).

**E6. Tense follows the date range.** Current role in present tense, past roles in past tense, and each bullet's verb matches its job's dates (S13). Within the current role, finished launches stay in past tense ("Delivered ... launched July 2026"), ongoing duties go present ("Lead the team ...").

**E7. Implied first person in bullets, "I" in prose.** Bullets drop the pronoun (S12: avoid "I, me, my"; no full sentences needed). Bio, pillar bodies and CTA are prose and use "I". Do not mix within one block.

**E8. Evergreen over timely.** Anchor every relative time ("in seven months", "recently", "now") to a fixed date, or drop it. Avoid trend words that age (*editorial*, from Orwell rule 1 on stale figures of speech, S7). Write the mechanism ("AI suggests values, a person confirms each section") instead of the label ("AI-powered").

**E9. Credit the team honestly.** Use "led", "co-founded", "helped secure" where the result was shared; use "built", "wrote", "designed" only for the part you did (S9: "impact and your contribution should be clear").

**E10. Bold is for the one fact a skimmer needs.** "Use bold sparingly" and avoid bolding mid-sentence (S10). Overused boldface is also an AI tell (S14). Rule: at most two `<b>` per bullet, and only on a number or a proper noun.

**E11. One term per concept.** "Use one term consistently to represent one concept" (S4). Pick "Mini App" or "mini app", "résumé" or "resume", and keep it across all locales. Elegant variation (rotating synonyms) is an AI tell (S14).

**E12. Calm confidence.** Let numbers carry the weight. No superlatives, no "passionate", no "world-class" (*editorial*, consistent with `calm-content-writer` "avoid hype").

## 2. Principles (VI)

**V1. Viết lại theo ý, không dịch từng chữ.** S17 §2.1.3: dịch word-to-word làm giọng "stiff and unnatural"; được phép tách câu, bỏ bớt mô tả cho gọn. S17 §2.1.1: "re-write just like you are writing the contents yourselves".
- Trước: "Biến bài toán mơ hồ thành hệ thống đáng tin cậy bằng hands-on engineering, technical leadership và ownership xuyên suốt từ architecture đến production."
- Sau: "Tôi vừa trực tiếp viết code, vừa dẫn team đưa sản phẩm từ bản thiết kế đầu tiên lên production."

**V2. Từ ngắn, đời thường, hiện đại. Tránh Hán-Việt cứng.** S17 §2.1.4 đưa cặp mẫu: "Tải về không thành công" → "Không tải được"; "theo các bước sau đây" → "theo cách sau"; "mã định danh" → "ID". S19 #7 xếp lạm dụng Hán-Việt vào nhóm "mùi AI".
- Trước: "thực thi liên đội", "kiến tạo giá trị", "nâng cao trải nghiệm người dùng".
- Sau: "phối hợp giữa các team", nói rõ giá trị là gì, "app mở nhanh hơn" (kèm số).

**V3. Câu chủ động, có người làm.** Tiếng Việt định nghĩa nghĩa bằng trật tự từ ("Tôi quản lý hệ thống" khác "Hệ thống quản lý tôi", S17 §4.1 Grammatical voice). "được" mang nghĩa có lợi, "bị" mang nghĩa bất lợi (S18 Passivization), nên "được thực hiện bởi" cho hành động trung tính là cấu trúc dịch từ tiếng Anh.
- Trước: "Tính năng được phát triển bởi team và được ra mắt vào tháng 7/2026."
- Sau: "Team ra mắt tính năng vào tháng 7/2026."
- Giữ "được" khi có nghĩa nhận lợi: "được VnExpress đưa tin" là tự nhiên.

**V4. Xưng "tôi" trong đoạn văn, bỏ chủ ngữ trong gạch đầu dòng.** "tôi" là đại từ duy nhất dùng được trong văn lịch sự, "mình" dùng cho quan hệ thân (S18 Pronouns). Trang hồ sơ đang dùng "tôi" nhất quán, giữ nguyên. Với người đọc, dùng "bạn" (S17 §4.1.13 và phần Microsoft voice). Gạch đầu dòng CV bỏ chủ ngữ, mở bằng động từ, giống S12 bên EN.
- Trước: "Tham gia 8+ dự án ..., tôi đã thu được ..." (vừa bỏ chủ ngữ vừa thêm "tôi" giữa câu).
- Sau: "Làm 8+ dự án web và mobile cho ..."

**V5. Tự tin nhưng khiêm tốn: để con số nói.** Không tự khen ("chuyên môn sâu", "hiểu biết quý giá", "vượt trội"). Dùng động từ đúng mức đóng góp: "góp phần", "cùng team", "dẫn dắt", "tự viết". (*editorial*, thống nhất với `calm-content-writer`.)

**V6. Liên từ ngắn, câu ngắn.** S17 §4.1.7 khuyến khích liên từ đời thường, ví dụ "Bởi vì mọi kết nối được hình thành qua ..., nên ..." → "Nhờ kết nối qua ..., nên ...". S19 #3: câu dài nhiều "đồng thời", "tuy nhiên", "bên cạnh đó" là câu Tây hoá; tách ra.

**V7. Thuật ngữ: giữ tiếng Anh khi dịch ra gây mơ hồ, dài hơn, hoặc dân trong nghề không dùng.** S17 §4.1.4 liệt kê lý do giữ từ mượn: từ phổ biến dễ mơ hồ nếu dịch (OK, tab), tên riêng, viết tắt (PC, USB), từ dịch ra quá dài, khái niệm công nghệ mới mà bản dịch "could be confusing". Bảng chi tiết ở mục 4.
- Không biến tiếng Việt thành tiếng Anh có dấu: không giữ số nhiều tiếng Anh ("RBAC hooks", "modular UI patterns", "shared utilities" → "các RBAC hook", "UI pattern dùng chung"). *editorial*
- Tối đa khoảng 2 cụm tiếng Anh liền nhau trong một mệnh đề; nhiều hơn thì viết lại (*editorial heuristic*).

**V8. Thì: thêm trạng từ thời gian khi cần, đừng rải "đã/đang" khắp nơi.** S17 §4.2 (Tense of verbs): tiếng Việt thêm trạng từ trước động từ, và thường bỏ "đang/đã" nếu không cần nhấn mạnh. Vai trò hiện tại dùng "đang" một lần ở câu mở, các ý sau không cần lặp.

**V9. Dấu thanh: chọn một kiểu, giữ cả site.** "hoà" và "hòa" là hai chuỗi Unicode khác nhau, trộn lẫn làm hỏng tìm kiếm và sắp xếp (S20). `vi.json` hiện dùng kiểu cũ nhất quán ("mã hoá" 6 lần, "hoà" 4 lần, kiểu mới 0 lần). Giữ kiểu cũ, chỉ đổi cả site một lượt nếu muốn chuyển.

**V10. CTA mời trò chuyện, không thúc.** "Liên hệ ngay" mang giọng bán hàng; `calm-content-writer` cấm pitch. Dùng "Liên hệ", "Trao đổi".

## 3. AI-tell ban list

### 3a. English

| Avoid | Use instead | Source |
|---|---|---|
| delve, tapestry, testament, vibrant, intricate, pivotal, crucial, enduring, foster, underscore (verb), showcase, boasts | say the fact; "has" for boasts; cut the adjective | S14 vocabulary list |
| realm, intricate, showcasing, pivotal (top LLM-skewed words in arXiv CS abstracts after 2023) | cut, or name the thing | S16 |
| excess "style words" in general (13.5%+ of 2024 PubMed abstracts show them) | plain verbs and nouns | S15 |
| leverage | use, or name the mechanism | S2 |
| utilize, make use of | use | S2, S4 |
| in order to, as a means to | to | S2, S4 |
| allows you to, enables | lets, or rewrite with the actor | S2 |
| just, simply, easy/easily, very, quite, quickly, effectively | delete | S2, S4 |
| serves as, stands as, features, offers (as copula) | is, has | S14 copula avoidance |
| trailing -ing clause: "..., ensuring X", "highlighting", "enabling", "contributing to", "turning X into Y" | new sentence with the mechanism, or delete | S14 superficial analyses |
| "not only X but also Y", "it's not X, it's Y", "Y rather than X" (as a habit) | state Y; mention X only if a reader expects it | S14 negative parallelism |
| triads of abstract nouns ("delivery, reliability, and leadership") | one concrete thing, or two with numbers | S14 rule of three |
| "plays a key role", "setting the stage", "laying the groundwork", "indelible mark" | what actually happened next | S14 puffery |
| "In summary", "Overall", "Despite these challenges" | end on the last fact | S14 |
| em dash (—) | comma, colon, period, parentheses | S14 (formulaic em dashes), S5 (don't overuse); project rule: zero |
| Title Case Headings, bold mid-sentence, bold in every line | sentence case; bold one number | S14 style, S10 |
| "responsible for", "worked on various" | the verb of what you did; the count | S12, S9 ("fixing various bugs") |
| passionate, results-driven, dynamic, innovative, cutting-edge, world-class, best-in-class, seamless, robust, spearheaded, synergy, game-changer | the measured outcome; "led" for spearheaded | *editorial*, from S4/S7 and S8 "be specific" |
| "in today's fast-paced world", "next-gen", "AI-powered", "modern" | the mechanism ("AI suggests, a person confirms") | *editorial*, S7 rule 1 |
| "With expertise in ...", "Gained invaluable insights" | drop self-assessment; state the result | *editorial*, S8 |

### 3b. Vietnamese

| Tránh | Thay bằng | Nguồn |
|---|---|---|
| "Không chỉ ... mà còn ...", "Trong bối cảnh ...", "đóng vai trò then chốt/quan trọng" | nói thẳng ý cụ thể | S19 #1 |
| "giá trị to lớn", "quý giá", "vượt trội", "toàn diện", "một cách toàn diện" | con số hoặc cơ chế | S19 #1, #7 |
| "tối ưu hoá X" (không kèm số) | "X nhanh hơn N lần", "giảm từ A xuống B" | S19 #7 |
| "được thực hiện bởi", "được ... bởi" cho hành động trung tính | câu chủ động có chủ ngữ | S17 §4.1, S18 |
| "một cách + tính từ" ("ổn định một cách đáng kể") | bỏ, hoặc thay bằng số | *editorial*, S17 §2.1.3 |
| "Việc + động từ" đầu câu ("Việc triển khai X giúp ...") | "Triển khai X giúp ..." hoặc đưa người làm lên đầu | *editorial*, S17 §2.1.3 |
| "chịu trách nhiệm cho" | "phụ trách", "lo", "own" (trong team kỹ thuật) | *editorial*, S12 tương đương EN |
| "trong khi vẫn" (dịch "while keeping") | tách câu, hoặc bỏ vế không kiểm chứng được | *editorial* |
| "biến X thành Y" (dịch "turn X into Y") | nói kết quả: "lỗi lặp lại giờ truy được nguyên nhân" | *editorial*, S14 |
| "đảm bảo", "giải pháp", "hệ sinh thái" dùng chung chung | nói cơ chế; "hệ sinh thái" chỉ khi đối tác tự gọi vậy (VETC) | *editorial* |
| "bên cạnh đó", "đồng thời", "tuy nhiên" dồn trong một đoạn | câu ngắn | S19 #3 |
| "Tóm lại", kết bài theo khuôn | dừng ở ý cuối | S19 #4 |
| gạch ngang dài "—" | dấu phẩy, dấu hai chấm, dấu chấm | S19 #5, quy tắc dự án |
| "Tải về không thành công" kiểu cổ, "theo các bước sau đây" | "Không tải được", "theo cách sau" | S17 §2.1.4 |
| "Liên hệ ngay", "Đừng bỏ lỡ" | "Liên hệ", "Trao đổi" | `calm-content-writer` |
| số nhiều tiếng Anh trong câu Việt ("users", "hooks", "patterns") | danh từ số ít + "các" nếu cần | *editorial* |
| label tả format của chính nó ("Tất cả dự án, mỗi dự án một dòng", "All projects, one line each") | nói nội dung là gì, như người viết: "Những dự án tôi đã làm", "Xem đủ 6 việc". Guard: `vi-format-narration`, `en-format-narration` | *owner feedback 2026-11-13* |

## 4. Term policy (VI copy)

Rule of thumb: keep English when (a) it is a name, acronym or protocol, (b) VN engineers say it in English at work and a translation would slow them down, or (c) the Vietnamese is longer or vague (S17 §4.1.4). Translate when it is ordinary business language or a user-facing feature name that the product itself shows in Vietnamese. S23 shows VN dev writing using both "deploy" and "triển khai"; the tie-breaker is the reader (recruiter or non-tech reader → Vietnamese, engineer → English).

| Term | Policy | Example in VI copy |
|---|---|---|
| Product, company, tool, protocol names: Zalo PC, VETC, PostHog, ArgoCD, OAuth 2.1, OIDC, mTLS, RSA-4096 | Keep | "dùng chung OAuth 2.1/OIDC provider cho web và Electron" |
| Metrics, acronyms: MAU, DAU, p95, API, SDK, RBAC, PII, QC, UAT, MVP | Keep | "cảnh báo p95", "hơn 15 triệu MAU" |
| feature flag, kill switch, rollout, release, deploy, commit, repo, merge, code review, hot path, retry, idempotent, tenant, multi-tenant, sync, payload, token, monorepo, pilot, pre-seed | Keep (no settled VN term, or VN term is longer) | "thay đổi rủi ro nằm sau kill switch, mặc định tắt" |
| backup / restore when naming the Zalo feature | Prefer the product's own VN label ("sao lưu", "khôi phục"); verify against the Zalo UI string | "sao lưu tin nhắn trên PC, khôi phục trên điện thoại" |
| deploy (in a sentence for general readers) | "triển khai" or "đưa lên production" | "triển khai độc lập từng module" |
| users, customers, team size | Translate: người dùng, khách hàng, người | "team bốn người" |
| performance, stability, maintainability, reliability | Translate: hiệu năng, độ ổn định, dễ bảo trì, độ tin cậy | "giữ app ổn định trên đường truyền chập chờn" |
| ownership, technical leadership, hands-on, end-to-end | Rewrite as verbs: phụ trách, dẫn dắt kỹ thuật, trực tiếp viết code, lo từ đầu đến cuối | "lo từ thiết kế đến production" |
| stakeholder, onboarding, runbook, RFC | Keep (VN alternatives "các bên liên quan", "hội nhập" read stiff) | "viết runbook và RFC" |
| design system, Storybook, Micro-Frontend | Keep | "design system trên Storybook cho hơn 50 developer" |
| "delivery" as a team name | Keep ("team delivery"); as a verb, translate ("ra tính năng", "giao") | "team delivery 8 developer và 3 QC" |
| Job titles: Lead Software Engineer, Tech Lead, Co-founder | Keep title in English; "Đồng sáng lập" is fine and already used | "Lead Software Engineer tại Zalo PC" |
| Abstract nouns: "release confidence", "regression surface", "feature isolation" | Do not keep or translate literally; rewrite as the effect | "lỗi ở module này không kéo theo module khác" |

## 5. Formatting conventions

| Item | EN | VI | Source |
|---|---|---|---|
| Thousands / decimal | 4,000+ · 1.8 s | 4.000+ · 1,8 s | S3; S17 §4.1.16; S21 (`vi-VN` → `4.300.000,5`) |
| Large approximations | 4.3M users; "nearly 80M" | 4,3 triệu người dùng; "gần 80 triệu" (CLDR long compact gives "4,3 triệu") | S3, S21 |
| "M/K" suffix | OK in figures and stat tiles (`80M+`, `$500K`) | Avoid in prose; use "triệu", "nghìn". `MAU` stays | S21, *editorial* |
| Currency | $500K in tiles; $500,000 in prose | 500.000 USD (matches current copy); never "$20,000" in VI | S17 ("2.400VND"), S21 |
| Units | space between number and unit: 1.8 s, 4 ms, 200 KB, 256 MiB | same: 1,8 s, 200 KB | S3 (nonbreaking space), S17 ("5,25 cm") |
| Percent | 85% (no space) | 85% | S3 |
| Ranges | 2025–2026 (en dash, no spaces) or hyphen, consistent | 2025–2026; "2-5 giờ" | S5, S3, S17 |
| Dates | "March 2026", "July 2026"; full date only when it matters ("March 2, 2026") | "tháng 7/2026", "03/2026"; full date dd/mm/yyyy ("02/03/2026"), never mm/dd | S21 (`vi-VN` → `2/3/2026`, `tháng 3 năm 2026`) |
| Numbers in prose | zero through nine as words, 10+ as numerals; metrics always numerals | same for prose; metrics numerals | S3 |
| Comma before "and"/"và" | Oxford comma: pick one style for EN and keep it | no comma before "và", "hoặc" | S17 §4.1.16 |
| Spaces and punctuation | no space before . , ? ! : | same | S17 |
| Dashes | no em dash anywhere; en dash only in ranges | same | S5, S14, S19, project rule |
| Quotes | match the site's existing quote style; do not mix straight and curly | VI: period after closing quote when quoting | S17, S14 |
| Bold | max two `<b>` per bullet, on numbers or names | same | S10, S14 |

Current violations found in `messages/vi.json`: `10,000+`, `3,000+`, `1,000+`, `20,000+` (x2) and `$20,000` use EN separators while `4.000+` and `500.000 USD` use VI ones. Two ", và" occurrences. Em dashes exist in `Pages` intros and empty states (en lines 464, 471, 553, 556; vi lines 464, 471, 556), outside the profile namespaces but against the project rule.

## 7. Pre-ship checklist

Run on every changed key, in both `en` and `vi`.

Truth and structure
- [ ] Every number matches the source of truth (`src/content/experience.ts`, `AI/research/*impact-evidence*`) and the same fact has the same number in every locale and namespace (Hero, Summary, Experience, About).
- [ ] Each bullet answers "what changed, measured how, by doing what" (S11). No number? Then a named mechanism.
- [ ] Credit verbs match the real share: "co-founded", "led", "helped secure" vs "built", "wrote".
- [ ] Tense matches the date range: current role present for ongoing work, past for launches and past roles (S13). Meta lines like "since 2025" checked against real dates.
- [ ] No relative time without an anchor ("recently", "now", "in seven months").

Voice
- [ ] Bullets have no pronoun; prose uses "I" / "tôi"; reader is "you" / "bạn".
- [ ] No triad of abstract nouns; no "turn X into Y"; no trailing -ing clause; no "not X but Y".
- [ ] No sales urgency ("ngay", "don't miss"); CTA invites a conversation.
- [ ] VI reads as written by a VN engineer, not translated: read it aloud without looking at EN. If a sentence only makes sense after reading the EN, rewrite it (S17 §2.1.3).
- [ ] VI clause has at most about two English noun phrases; no English plurals.

Mechanics
- [ ] Zero em dashes. En dash only in ranges.
- [ ] EN: `4,000+`, `1.8 s`; VI: `4.000+`, `1,8 s`, `500.000 USD`, `tháng 7/2026`, dd/mm order.
- [ ] Space between number and unit (`200 KB`, `4 ms`).
- [ ] No comma before "và"/"hoặc" in VI.
- [ ] Old-style tone marks kept ("hoá", "hoà"); no mixing.
- [ ] At most two `<b>` per bullet, on numbers or names.
- [ ] One term per concept across locales (Mini App, résumé, kill switch).

Quick grep (prints lines to review, not auto-fail):

```bash
grep -n -i -E "—|delv|tapestry|testament|pivotal|crucial|intricate|showcas|underscor|leverag|utiliz|seamless|robust|spearhead|passionate|cutting-edge|world-class|in order to|invaluable|ensuring|enabling|turning .* into|not only|rather than" messages/en.json
grep -n -E "—|một cách|được thực hiện bởi|chịu trách nhiệm cho|không chỉ.*mà còn|trong bối cảnh|đóng vai trò|quý giá|vượt trội|toàn diện|trong khi vẫn|biến .* thành|Liên hệ ngay|, và |\\\$[0-9]|[0-9],[0-9]{3}" messages/vi.json
```

Analytics note: copy-only edits do not touch `track(...)` calls, but if a CTA label changes, check `src/lib/analytics.ts` for any event property that stores the label text.
