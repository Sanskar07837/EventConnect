# ASSETS.md — EventConnect landing-page image register

This register is authoritative for assets in `public/landing/`. Every file in that directory must map to one slot below.

## File and source rules

- The supplied generated source masters are 2048 × 1529 PNGs. Do not upscale them to 2400 px.
- The starter package contains optimised WebP derivatives at 1600 × 1195 and 800 × 597. Original generated PNG masters are retained separately and are not required at runtime.
- Naming: `slot-NN-name-1600.webp` and `slot-NN-name-800.webp`.
- Use 800px assets for mobile and 1600px for desktop through responsive art direction; preserve aspect ratio and crop with CSS `object-position`. No image should be stretched.
- Target WebP quality around 80; the current files have already been exported.
- Only use assets with confirmed project usage rights. The current register records Gemini image generation, but the applicable account/tier terms are still pending verification. Do not claim licensing clearance until checked.
- Keep the visible sparkle/provenance marks and the disclosure that the images are AI-generated illustrations. Do not remove provenance marks to obscure origin.
- No visible brand logos, readable text, product marks or UI from real products. Review crops for accidental legible signage/documents.
- Avoid prominent/recognisable faces. Where noted, crop to hands, backs, silhouettes or contextual details. Do not imply depicted people are actual EventConnect users or attendees.
- Keep the centre third calm where the fixed wordmark overlaps the collage.
- Do not copy the reference site's composition or signature motifs.

## Slot list and scene use

| Slot | Name | Subject/composition | Scene use | Status / crop notes |
|---|---|---|---|---|
| 01 | chess-overhead | OTB chess game, wooden board, hands and clock | 2 | Use board/hands; AI illustration. |
| 02 | chess-clock-detail | Close-up chess clock and scoresheet with illegible notes | 2 | Keep writing illegible. |
| 03 | hackathon-desk-night | Team desk at night, laptops, cables and hands | None by default | **FLAGGED:** cans resemble a real brand and partial face visible. Exclude from scenes until replaced and register updated. |
| 04 | sticky-note-wall | Sticky notes and wireframe sketches, shallow focus | 3 | Keep handwriting unreadable. |
| 05 | filter-coffee | South Indian filter coffee in brass dabara set | 1, 5 | Strong local detail. |
| 06 | vidhana-soudha-dusk | Vidhana Soudha at golden hour, low sun on left and open sky | 1 (initial hero/LCP candidate) | Crop out garbled jacket lettering at far left where visible. AI-generated illustrative view. |
| 07 | glasshouse | Glasshouse interior/exterior, soft natural light | 1 | AI-generated illustrative view. |
| 08 | metro-platform | Metro platform with train in motion | 1 | Review/crop signage and faces; do not imply documentary accuracy. |
| 09 | park-morning | Tree-lined park path and distant silhouettes | 1, 5 | Calm community atmosphere. |
| 10 | workshop-room | Workshop/whiteboard, group seen from behind | 3, 4 | Crop to avoid the two visible profile faces; interior is not specifically Bengaluru. |
| 11 | blank-lanyards | Blank event lanyards and name tags | 2, 3, 5 | No readable names; used as a neutral event/community tile. |
| 12 | map-pins-flatlay | Generic paper map with coloured pins and pen | 5 | Generic illustrative map, not a real Bengaluru map. |

Scene-to-slot assignments are defined in `SPEC.md` section 2A. Slot 03 is present in the asset archive but not used by the default sequence. Slot 11 is deliberately reused in different scenes; never duplicate a slot within one scene.

## Exact runtime filenames

For each slot, both files must exist:
- `slot-NN-name-800.webp`
- `slot-NN-name-1600.webp`

Current dimensions:
- 800 variant: 800 × 597 px
- 1600 variant: 1600 × 1195 px

The supplied package contains 12 pairs (24 files). The desktop and mobile variants are already generated; no additional stock images or remote image URLs are required.

## Usage and accessibility

- Use descriptive `alt` text for informative images.
- If a tile is purely decorative and its subject is already represented by accessible scene text, use empty alt text to avoid redundant screen-reader output.
- On mobile, crop intentionally; do not merely squeeze the 4:3 images into narrow tiles.
- For each scene, ensure the fixed wordmark remains legible against the underlying image. Use a restrained contrast overlay only where necessary.
- Do not load all 24 variants eagerly. Load the current scene and prepare the next scene without fetching the entire sequence at once.

## Register and provenance

All 12 slot images were generated with the Gemini image generator. Each has a visible sparkle mark and an invisible provenance watermark. Treat them as AI-generated illustrative assets.

| Slot | Runtime files | Source | Tool | Usage terms | Notes |
|---|---|---|---|---|---|
| 01 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Chess overhead. |
| 02 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Chess clock; scoresheet intentionally illegible. |
| 03 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Flagged: brand-lookalike cans and partial face; exclude pending replacement. |
| 04 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Sticky-note wall; illegible handwriting. |
| 05 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Brass filter coffee. |
| 06 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Vidhana Soudha; crop stray jacket text. |
| 07 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Glasshouse. |
| 08 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Metro platform; review signage/faces. |
| 09 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Park silhouettes. |
| 10 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Workshop; crop profile faces. |
| 11 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Blank lanyards. |
| 12 | 800 + 1600 WebP | AI-generated | Gemini image generator | Pending tier/account verification | Generic map-pin motif. |

**Shipping gate:** before public release, verify that the terms for the exact Gemini product/account tier used allow the intended website and hackathon/public-demo use. Record the verification date and applicable terms. Until then, the imagery is approved for internal prototyping only, not asserted as licence-cleared.
