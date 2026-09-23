# Self-hosted fonts

`InterVariable-latin-vi.woff2` is Inter 4.001 (SIL OFL 1.1, see `Inter-OFL.txt`) from
`google/fonts` `ofl/inter/Inter[opsz,wght].ttf`, with `opsz` pinned to 14 and the
glyph set cut down to Latin, Vietnamese, arrows and a few math/keyboard symbols
used in articles. It is declared in `src/app/document.css`, so the bundler hashes
it into `_next/static/media` and the offline worker caches it like other runtime assets.

Regenerate with fontTools:

```sh
fonttools varLib.instancer 'Inter[opsz,wght].ttf' opsz=14 -o inter-wght.ttf
pyftsubset inter-wght.ttf --flavor=woff2 --layout-features+=tnum,case \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+1EA0-1EF9,U+2000-206F,U+20AB,U+20AC,U+2122,U+2190-2199,U+21E7,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+2303,U+2318,U+2325,U+25CF,U+FEFF,U+FFFD" \
  --output-file=InterVariable-latin-vi.woff2
```

The `Inter Fallback` metric overrides in `document.css` were measured against Arial.
Recompute them if the font file changes.
