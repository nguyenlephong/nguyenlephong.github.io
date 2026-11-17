---
name: blog-voice
description: Voice, research process and checks for rewriting or writing blog posts in content/blog-data (EN and VI). Use before drafting or editing any blog post title, summary, FAQ or body. Warm, upbeat, Gen Z friendly but polite and grown up; every claim checked against a real source; EN and VI each written natively.
---

# Blog voice

Blog posts on this site should read like a senior engineer who likes their job talking to a teammate over coffee. Warm, upbeat, a bit playful, always polite, never preachy. Readers are developers, tech leads, PMs and curious non-tech people in Vietnam and abroad.

This skill overrides the tone rules in `AI/skills/calm-content-writer/SKILL.md` for blog posts: no more "calm and reflective" by default, headings and lists are allowed when they help scanning, and the opening does not have to be an office scene. Everything else in calm-content-writer still applies (no selling, no spiritual framing, inclusive wording, keep technical terms). For phrasing, also read `AI/skills/profile-voice/references/language.md` (EN/VI ban lists, term policy, number formats) and `owner-voice.md` (Phong's beliefs and natural rhythm).

## Voice

### Both languages

- Talk to one reader. Short sentences, then a longer one when the idea needs room.
- Energy comes from concrete detail and a little humor, not from exclamation marks or hype words. One exclamation mark per post at most.
- Be kind about people and strict about ideas. Name the mistake, never mock the person who made it.
- Show, then tell: a real example (a PR comment, a snippet, a message, a number) before the rule.
- End on something the reader can do this week. No slogan, no "in conclusion", no question asking readers to comment.

### Vietnamese

- Xưng "mình", gọi người đọc là "bạn". Nói như đang chat với đồng nghiệp trên Slack, không như báo cáo.
- Giữ thuật ngữ nghề bằng tiếng Anh như dân trong nghề vẫn nói: PR, review, merge, deploy, commit, test, refactor, blocker, nit. Không dùng số nhiều tiếng Anh ("các comment", không "comments").
- Được dùng từ trẻ phổ thông, vừa phải, khoảng 2 đến 4 chỗ mỗi bài, đặt ở chỗ có cảm xúc thật: "xịn", "ổn áp", "chill", "căng", "toang", "đỉnh", "out trình", "mood", "real" ("chuyện real"). Không dùng kiểu "khum", "hong", không teencode, không viết tắt kiểu "ko", "dc", không meme cần giải thích, không chửi thề.
- Câu chủ động, chủ ngữ rõ. Bỏ "được ... bởi" cho hành động trung tính.
- Viết từ ý, không dịch từ bản EN. Đọc to bản VI mà không nhìn bản EN; câu nào phải đọc EN mới hiểu thì viết lại.
- Không comma trước "và". Dấu kiểu cũ: "hoá", "hoà".

### English

- Contractions, plain verbs, concrete nouns. "Ship", "merge", "break", "fix", "ask".
- A dry joke is fine. Sarcasm about people is not.
- American spelling unless the post already uses British.

## Hard bans (both locales)

Run `node scripts/report-content-tone.mjs --slug <slug>` before calling a post done. It flags these:

- Em dash (—). Use a comma, colon, period or parentheses. En dash only in number ranges.
- Contrast framing as a habit: "not X but Y", "it's not X, it's Y", "X, not Y" endings; VI "không phải X mà là Y", "không chỉ ... mà còn". Keep one per post at most, and only when the reader really holds belief X.
- Staged openers: "Picture this", "Imagine", "Let's dive in", "Here's the thing", "In today's fast-paced world"; VI "Hãy tưởng tượng", "Trong bối cảnh", "Có một điều".
- Mood filler: quiet/quietly/calm/gentle used as mood words; VI "lặng lẽ", "âm thầm", "bình tĩnh", "nhẹ nhõm", "chiêm nghiệm", "hiện diện".
- AI vocabulary: delve, tapestry, testament, pivotal, crucial, intricate, showcase, underscore, leverage, robust (figurative), seamless, game-changer, highest-leverage; VI "đóng vai trò then chốt", "biến X thành Y", "một cách + tính từ", "Việc + động từ" at sentence start.
- One-line closers that repeat the paragraph ("That's the real win.", "Read that again."), forced triads, bold labels on every bullet, decorative emojis (✦, 🚀).
- Invented first-person stories. "I once..." / "mình từng..." only when the story is in the evidence ledger (`AI/research/cv-evidence-inventory-2026-11-12.md`) or Phong told it. Otherwise write a clearly hypothetical scene with "you" / "bạn" or "say a teammate...".
- Numbers without a source. Every statistic, threshold or study claim needs a source in the post (inline link) or must go.

## Process per post

1. **Read** the current EN and VI fully. Write down the 3 to 5 ideas worth keeping. Drop ideas that are wrong, dated or generic.
2. **Research** at least two primary sources (official docs, the original paper or book, a well-known practitioner's own writing). Check every number and every "studies show". Keep the URLs; cite them inline with `<a href>` and in the PR description. For AI and tooling posts, note the date you checked.
3. **Outline**: the opening example, one main idea, the practical parts, the ending action. Reuse the post's existing figures, diagrams, tables and callouts when they still fit; fix their captions and alt text to the same voice.
4. **Write VI and EN separately**, same ideas and same numbers, different sentences. Neither is a translation of the other.
5. **Metadata**: `title` (no "The Art of", no colon-subtitle formula unless it really helps), `summary` (EN 140-170 chars; VI 150-160 chars), `tags` (keep existing tag names unless wrong), `faqs` (answers that stand alone, same facts as the body), `readingMinutes` (words / 220, rounded). Keep `slug`, `category`, `date`, `author`.
6. **Check**: read aloud, run the tone report (zero hard-ban hits), run `npm test`, and look at the page in the dev server if figures or tables changed.

## Before / after

VI, mở bài:

- Trước: "Hãy tưởng tượng: bạn mở pull request vào sáng thứ Hai, tự hào về đoạn code sạch nhất mình viết trong nhiều tháng. Chiều đến, một comment duy nhất khiến bạn sợ cả tuần. Không phải vì phản hồi sai — mà vì cách nó được truyền đạt."
- Sau: "Sáng thứ Hai bạn mở một PR, trong bụng hơi tự hào vì lâu lắm mới viết được đoạn code gọn vậy. Chiều có đúng một comment: "Sao lại làm phức tạp vậy?". Góp ý chưa chắc đã sai. Có điều đọc xong bạn chẳng biết sửa từ đâu, và cả tuần sau cứ ngại mở PR mới."

EN, a claim:

- Before: "Code review is the highest-leverage ritual in any engineering team. Done well, it ships better software, grows engineers faster, and quietly cements a culture of trust."
- After: "Most teams say they review code to catch bugs. When Microsoft researchers sat in on real reviews, bugs turned out to be a small slice of the comments. Most of the value was people learning the codebase and each other."

## Done checklist

- [ ] Tone report: zero hits on hard bans for both locales.
- [ ] Every number and study claim links to its source.
- [ ] No first-person story outside the ledger.
- [ ] VI reads natively when read aloud alone; 2 to 4 casual words at most.
- [ ] Title, summary, FAQ, alt text and captions rewritten too, not just the body.
- [ ] `slug`, `category`, `date` unchanged; `npm test` passes.
