import assert from 'node:assert/strict'
import { decodeHTMLAttribute } from 'entities'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import test from 'node:test'

import { transformConsumerUrls } from '../scripts/lib/consumer-url-tokens.mjs'

const ALIAS = '/en/opengraph-image-shared'
const CANONICAL = '/opengraph-image.png'

function canonicalize(value) {
  if (!value.startsWith(ALIAS)) return value
  return `${CANONICAL}${value.slice(ALIAS.length)}`
}

test('rewrites React-escaped CSS URLs in style attributes without changing URL semantics', () => {
  const markup = renderToStaticMarkup(
    createElement('div', {
      style: { backgroundImage: `url("${ALIAS}?label=one&mode=card")` },
    }),
  )
  assert.equal(
    markup,
    '<div style="background-image:url(&quot;/en/opengraph-image-shared?label=one&amp;mode=card&quot;)"></div>',
  )

  assert.equal(
    transformConsumerUrls(markup, '.html', canonicalize),
    '<div style="background-image:url(&quot;/opengraph-image.png?label=one&amp;mode=card&quot;)"></div>',
  )
})

test('decodes every URL attribute entity form and safely re-encodes only changed values', () => {
  const html = [
    `<meta content="${ALIAS}?label=&quot;card&quot;&amp;mode=wide">`,
    `<a href='${ALIAS}?label=&#34;card&#34;&amp;mode=wide'>link</a>`,
    `<a href='${ALIAS}?owner=&apos;p&apos;&amp;range=&lt;min&gt;'>named</a>`,
    `<img src=${ALIAS}?label=&#x22;card&#x22;&amp;mode=wide>`,
    `<img srcset="${ALIAS}?slot=one&amp;mode=wide 1x,${ALIAS}?slot=two&amp;mode=wide 2x">`,
    `<link imagesrcset='${ALIAS}?slot=one&amp;mode=wide 1x,${ALIAS}?slot=two&amp;mode=wide 2x'>`,
  ].join('')

  assert.equal(
    transformConsumerUrls(html, '.html', canonicalize),
    [
      `<meta content="${CANONICAL}?label=&quot;card&quot;&amp;mode=wide">`,
      `<a href='${CANONICAL}?label="card"&amp;mode=wide'>link</a>`,
      `<a href='${CANONICAL}?owner=&apos;p&apos;&amp;range=&lt;min&gt;'>named</a>`,
      `<img src=${CANONICAL}?label&#61;&quot;card&quot;&amp;mode&#61;wide>`,
      `<img srcset="${CANONICAL}?slot=one&amp;mode=wide 1x,${CANONICAL}?slot=two&amp;mode=wide 2x">`,
      `<link imagesrcset='${CANONICAL}?slot=one&amp;mode=wide 1x,${CANONICAL}?slot=two&amp;mode=wide 2x'>`,
    ].join(''),
  )
})

test('matches browser HTML attribute decoding for named, numeric, and legacy references', () => {
  const html = [
    `<img src="&sol;en&sol;opengraph-image-shared?label=one&amp;mode=wide">`,
    `<div style="background-image:url&lpar;&quot;&sol;en&sol;opengraph-image-shared?label=one&amp;mode=card&quot;&rpar;"></div>`,
    `<img srcset="&sol;en&sol;opengraph-image-shared?slot=one&amp;mode=wide 1.0x, /other.png 2x">`,
    `<img src="&#x2f;en&#47;opengraph-image-shared?currency=&#x80;">`,
    `<img src="${ALIAS}?literal=&amp=wide">`,
    `<meta content="${ALIAS}?legacy=&copy">`,
  ].join('')

  assert.equal(
    transformConsumerUrls(html, '.html', canonicalize),
    [
      `<img src="${CANONICAL}?label=one&amp;mode=wide">`,
      `<div style="background-image:url(&quot;${CANONICAL}?label=one&amp;mode=card&quot;)"></div>`,
      `<img srcset="${CANONICAL}?slot=one&amp;mode=wide 1.0x, /other.png 2x">`,
      `<img src="${CANONICAL}?currency=€">`,
      `<img src="${CANONICAL}?literal=&amp;amp=wide">`,
      `<meta content="${CANONICAL}?legacy=©">`,
    ].join(''),
  )
})

test('keeps unchanged entity attributes byte-identical', () => {
  const unchanged = [
    '<a href="https://cdn.example.com/card.png?label=&quot;external&quot;&amp;mode=wide">cdn</a>',
    '<img src="data:image/svg+xml,%3Csvg%3E&amp;%3C/svg%3E">',
    '<meta content="description &copy; remains prose">',
  ].join('')
  assert.equal(transformConsumerUrls(unchanged, '.html', canonicalize), unchanged)

  assert.equal(
    transformConsumerUrls(
      `<div style="background:url(&quot;${ALIAS}&quot;);content:&quot;&unknown;&quot;"></div>`,
      '.html',
      canonicalize,
    ),
    `<div style="background:url(&quot;${CANONICAL}&quot;);content:&quot;&amp;unknown;&quot;"></div>`,
  )
})

test('preserves unknown non-decoding references with parse-equivalent changed output', () => {
  const unchanged = '<img src="https://cdn.example.com/card.png?label=&unknown;">'
  assert.equal(transformConsumerUrls(unchanged, '.html', canonicalize), unchanged)

  const rawValue = `${ALIAS}?label=&unknown;&mode=&amp=wide`
  const transformed = transformConsumerUrls(`<img src="${rawValue}">`, '.html', canonicalize)
  assert.equal(
    transformed,
    `<img src="${CANONICAL}?label=&amp;unknown;&amp;mode=&amp;amp=wide">`,
  )
  const transformedRawValue = /^<img src="([^"]*)">$/.exec(transformed)?.[1]
  assert.equal(
    decodeHTMLAttribute(transformedRawValue ?? ''),
    canonicalize(decodeHTMLAttribute(rawValue)),
  )
})

test('accepts every positive HTML floating-point density form used by source sets', () => {
  for (const descriptor of ['1x', '1.0x', '.5x', '1e0x', '1.0e+2x']) {
    const html = `<img srcset="${ALIAS}?density=${descriptor} ${descriptor}">`
    assert.equal(
      transformConsumerUrls(html, '.html', canonicalize),
      `<img srcset="${CANONICAL}?density=${descriptor} ${descriptor}">`,
    )
  }
  assert.equal(
    transformConsumerUrls(`<img srcset="${ALIAS} 640w">`, '.html', canonicalize),
    `<img srcset="${CANONICAL} 640w">`,
  )
})

test('rejects non-positive, non-finite, malformed, and mixed source-set descriptors', () => {
  for (const descriptor of [
    '1.x',
    '1.e2x',
    '0x',
    '0e0x',
    '-1x',
    '-1e0x',
    'NaNx',
    'Infinityx',
    '1e+x',
  ]) {
    assert.throws(
      () => transformConsumerUrls(`<img srcset="${ALIAS} ${descriptor}">`, '.html', canonicalize),
      /invalid srcset/,
    )
  }
  assert.throws(
    () =>
      transformConsumerUrls(
        `<img srcset="${ALIAS} 1e0x,/other/opengraph-image.png 640w">`,
        '.html',
        canonicalize,
      ),
    /invalid srcset: mixed x and w descriptors/,
  )
})
