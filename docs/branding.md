# Branding and independence

This integration must remain clearly independent from the compatible service.

> This is an independent community integration and is not affiliated with, endorsed by, sponsored by, or maintained by EmDash CMS. Product names and marks belong to their respective owners and are used only to identify compatibility.

For every vendor asset, record:

| Packaged path           | Asset purpose                  | Official source URL                                                                          | Immutable commit/version                                  | Access date | SHA-256                                                            | Current app reference checked | License/trademark note |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------- | ------------------------------------------------------------------ | ----------------------------- | ---------------------- |
| `icons/emdash.svg`      | Node and credential light icon | `https://raw.githubusercontent.com/emdash-cms/emdash/emdash%401.0.1/docs/public/favicon.svg` | `0e8977c221dd8e5111511eb226faa3d164c829ef (emdash@1.0.1)` | 2026-09-28  | `323512d1d707c4a7e07a1a8a9234a740a14c9aa5f479672cdf66188d0109da77` | `docs/public/favicon.svg`     | MIT license            |
| `icons/emdash.dark.svg` | Node and credential dark icon  | `https://raw.githubusercontent.com/emdash-cms/emdash/emdash%401.0.1/docs/public/favicon.svg` | `0e8977c221dd8e5111511eb226faa3d164c829ef (emdash@1.0.1)` | 2026-09-28  | `323512d1d707c4a7e07a1a8a9234a740a14c9aa5f479672cdf66188d0109da77` | `docs/public/favicon.svg`     | MIT license            |

Prefer the official square product glyph actually referenced by the current application. Do not redraw, trace, recolor, or generate vendor marks. Verify light/dark source and packed assets by hash. If licensing or current-product identity is unclear, retain a neutral original integration icon and document the blocker rather than claiming permission.

Prefer a square canvas for node-card legibility; document upstream exceptions rather than altering official assets. Verify light and dark rendering on contrasting backgrounds, every node and credential icon in the packed tarball, nonempty SVG/PNG files, SVG viewBox usability, immutable provenance, and hashes. After submitting the exact published version, visually record the Creator Portal card version and logo because portal metadata can remain stale independently.

Treat these as separate surfaces: source and packed icon files, the npm package README/homepage, and the n8n Creator Portal card. Passing one does not prove that another has refreshed. Do not redraw or AI-generate a vendor logo to compensate for stale portal metadata.
