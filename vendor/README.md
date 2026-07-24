# vendor/

Self-hosted third-party scripts. No CDN at runtime — faster, no external
dependency at page-load, nothing to break if a CDN has a bad day.

| File | Package | Version | License | Source |
|---|---|---|---|---|
| `anime.min.js` | [animejs](https://www.npmjs.com/package/animejs) | 4.5.0 | MIT | `dist/bundles/anime.umd.min.js` |
| `lenis.min.js` | [lenis](https://www.npmjs.com/package/lenis) | 1.3.25 | MIT | `dist/lenis.min.js` |

To update: bump the version in the jsdelivr URL, re-download, replace the file.

```
https://cdn.jsdelivr.net/npm/animejs@<version>/dist/bundles/anime.umd.min.js
https://cdn.jsdelivr.net/npm/lenis@<version>/dist/lenis.min.js
```
