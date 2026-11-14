import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  indexSearchFields,
  parseSearchQuery,
  scoreSearch,
} from '../src/lib/content/search.ts'

const notes = [
  { slug: 'nhan-tin', title: 'Nhắn tin công việc cho nhanh và rõ', meta: 'Sự nghiệp', summary: 'Nhất là khi cả nhóm cần hiểu nhau.' },
  { slug: 'lai-xe', title: 'Lại chuyện hai chiếc xe', meta: 'Mua xe', summary: 'Khai báo, đăng ký và bảo hiểm.' },
  { slug: 'mua-nha-vay', title: 'Vay ngân hàng mua nhà', meta: 'Mua nhà', summary: 'Dùng đòn bẩy tỉnh táo.' },
  { slug: 'phong-thuy', title: 'Phong thủy và ánh sáng', meta: 'Mua nhà', summary: 'Đọc ngôi nhà bằng gió và thói quen.' },
  { slug: 'ky-luat', title: 'Kỷ luật bắt đầu từ lời hứa', meta: 'Sự nghiệp', summary: 'Giữ nhịp nhỏ mỗi ngày.' },
  { slug: 'ai-agents', title: 'AI agents explained', meta: 'AI', summary: 'How an agent loop works.' },
  { slug: 'hoa-binh', title: 'Sống hòa nhã ở công sở', meta: 'Sự nghiệp', summary: 'Ít tranh cãi hơn.' },
]
const indexed = notes.map((note) => ({ slug: note.slug, index: indexSearchFields(note) }))

function search(query) {
  const terms = parseSearchQuery(query, 'vi')
  return indexed
    .map(({ slug, index }) => ({ slug, score: scoreSearch(index, terms) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ slug }) => slug)
}

test('an accented term matches its own word, not every word that shares the letters', () => {
  // "nhà" used to match nhắn, nhanh, nhất, nhau after accent stripping.
  assert.deepEqual(search('nhà'), ['mua-nha-vay', 'phong-thuy'])
})

test('title hits rank above topic and summary hits', () => {
  assert.equal(search('nhà')[0], 'mua-nha-vay')
  assert.deepEqual(search('mua nha'), ['mua-nha-vay', 'phong-thuy'])
})

test('a term matches the start of a word, never a letter run inside it', () => {
  // "ai" used to match lại, hai, khai.
  assert.deepEqual(search('ai'), ['ai-agents'])
  assert.deepEqual(search('agen'), ['ai-agents'])
})

test('unaccented and accented queries return the same set when the text agrees', () => {
  assert.deepEqual(search('ky luat'), ['ky-luat'])
  assert.deepEqual(search('kỷ luật'), search('ky luat'))
  assert.deepEqual(search('KỶ LUẬT'), search('ky luat'))
})

test('tone mark placement does not matter (hòa / hoà)', () => {
  assert.deepEqual(search('hoà'), ['hoa-binh'])
  assert.deepEqual(search('hòa'), ['hoa-binh'])
})

test('every term must match and an empty query matches nothing', () => {
  assert.deepEqual(search('nhà ai'), [])
  assert.deepEqual(parseSearchQuery('  '), [])
  assert.equal(scoreSearch(indexed[0].index, []), 0)
})

function matches(query, text, locale = 'vi') {
  return scoreSearch(indexSearchFields({ title: text, meta: '', summary: '' }), parseSearchQuery(query, locale)) > 0
}

test('typed marks must be present, extra marks in the word are allowed', () => {
  assert.equal(matches('đa', 'Đà Nẵng'), true)
  assert.equal(matches('da', 'Đà Nẵng'), true)
  assert.equal(matches('tâm', 'tấm lòng'), true)
  assert.equal(matches('tấm', 'tâm sự'), false)
  assert.equal(matches('nhà', 'nhắn tin'), false)
  assert.equal(matches('nhà', 'nhanh'), false)
  // A typed tone ends the syllable: no prefix match into a longer one.
  assert.equal(matches('nhà', 'nhàm chán'), false)
  assert.equal(matches('nhà', 'Nhà lãnh đạo'), true)
  assert.equal(matches('nha', 'nhàm chán'), true)
  assert.equal(matches('hoà', 'hòa nhã'), true)
  assert.equal(matches('hòa', 'hoà nhã'), true)
  assert.equal(matches('ơ', 'ô tô'), false)
})

test('the whole-syllable tone rule is Vietnamese only; French accents stay prefixes', () => {
  for (const locale of ['fr', 'en']) {
    assert.equal(matches('dévelop', 'Développement durable', locale), true)
    assert.equal(matches('développ', 'Développement durable', locale), true)
    assert.equal(matches('résil', 'Résilience des systèmes', locale), true)
    assert.equal(matches('dévelop', 'Developer notes', locale), false)
  }
  assert.equal(matches('nhà', 'nhàm chán', 'vi'), false)
  assert.equal(matches('nhà', 'Nhà lãnh đạo', 'vi'), true)
  assert.equal(matches('nha', 'nhàm chán', 'vi'), true)
})

test('the explorer shell never opens the filter palette from the search field', () => {
  const shell = readFileSync(new URL('../src/components/explorer/ExplorerShell.tsx', import.meta.url), 'utf8')
  const input = shell.slice(shell.indexOf('<input'), shell.indexOf('/>', shell.indexOf('<input')))
  assert.doesNotMatch(input, /openPalette|togglePalette/)
  assert.match(input, /onChange=\{\(e\) => \{[^}]*closePalette\(\)/)
  assert.doesNotMatch(input, /aria-controls/)
  assert.equal(shell.match(/'explorer_palette_toggle'/g)?.length, 1)
  // While the index loads, the count must not claim the static total matches the query.
  assert.match(shell, /hasFilters && isStaticBrowsing && searchStatus !== 'error'\s*\?\s*labels\.searching/)
})
