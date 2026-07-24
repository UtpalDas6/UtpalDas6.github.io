# vendor/

Self-hosted third-party scripts and fonts. No CDN at runtime — faster, no
external dependency at page-load, nothing to break if a CDN has a bad day.

| File | Package | Version | License | Source |
|---|---|---|---|---|
| `anime.min.js` | [animejs](https://www.npmjs.com/package/animejs) | 4.5.0 | MIT | `dist/bundles/anime.umd.min.js` |
| `lenis.min.js` | [lenis](https://www.npmjs.com/package/lenis) | 1.3.25 | MIT | `dist/lenis.min.js` |
| `fonts/geist-variable.woff2` | [geist](https://www.npmjs.com/package/geist) | 1.7.2 | SIL OFL 1.1 | `dist/fonts/geist-sans/Geist-Variable.woff2` |
| `fonts/jetbrains-mono-{400,500,600,700}.woff2` | [@fontsource/jetbrains-mono](https://www.npmjs.com/package/@fontsource/jetbrains-mono) | 5.3.0 | SIL OFL 1.1 | `files/jetbrains-mono-latin-{weight}-normal.woff2` |

To update: bump the version in the jsdelivr URL, re-download, replace the file.

```
https://cdn.jsdelivr.net/npm/animejs@<version>/dist/bundles/anime.umd.min.js
https://cdn.jsdelivr.net/npm/lenis@<version>/dist/lenis.min.js
https://cdn.jsdelivr.net/npm/geist@<version>/dist/fonts/geist-sans/Geist-Variable.woff2
https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@<version>/files/jetbrains-mono-latin-<weight>-normal.woff2
```
