# Project Instructions: Al-VoIP Electro Shopify Theme

## Supreme Constitution
1. **MANDATORY WORKFLOW LOOP**: READ `PROJECT_INSTRUCTIONS.md` -> EXECUTE -> UPDATE `PROJECT_INSTRUCTIONS.md`.
2. **Terminal Usage**: Always use `cmd /c` for shell executions (Windows environment).
3. **Coding Standards**:
    - Shopify OS 2.0 architecture (Liquid, JSON templates).
    - Native Web Components (`<native-slider>`) instead of legacy libraries.
    - Vanilla CSS/JS for performance.
    - SEO best practices (Semantic HTML, unique IDs).
4. **Git Workflow**:
    - Main branch: `main`.
    - Descriptive commit messages.

## Security & Secrets
- **Secret Scanning**: Never commit API keys or secrets (e.g., Mapbox, Shopify API credentials) to the repository.
- **Redaction**: If a secret is detected by GitHub, redact it from the file and amend the commit history before pushing.

## Overlap Pattern (Reusable)
- Floating overlap between sections is achieved via **dynamic inline `<style>`** targeting `#shopify-section-{{ section.id }}` with negative `margin-top`.
- Schema settings: `enable_overlap` (checkbox) + `overlap_amount` (range slider).
- Mobile breakpoint (`max-width: 767px`) halves the overlap value.
- Cards use solid `background-color: #ffffff` and `box-shadow` to pop over the section beneath.

## Current State
- Git repository initialized and pushed to GitHub.
- Remote URL: `https://github.com/mmhassanin/shopify-theme-mhassanin-2.0.git` (HTTPS).
- `section-list-collections-v2`: Floating overlap effect committed and pushed (`47c7026`).
- `section-slideshow`: Added `dots_bottom_offset` px-based range setting with mobile responsive halving (`b4952a8`).
- Resolved Z-Index Conflict: Lowered `section-list-collections-v2` overlap z-index from 10 to 1, and reinforced `.header-sticky` with `z-index: 999 !important` in `header.css` to guarantee header visibility during scroll.
- `section-slideshow`: Implemented advanced matrix flexbox caption positioning (per-slide desktop/mobile axes controls) overriding legacy absolute positioning blocks (`7bda450`).
- **Global Architecture**: Implemented theme-wide Section Visibility logic via custom CSS utilities (`.v-desktop-only` and `.v-mobile-only`) mapped into `assets/themes.css`. Systematically retrofitted core sections (`section-slideshow`, `section-list-collections-v2`, `featured-collection`) with a new `section_visibility` schema select to allow macro-level toggling mapped directly to the root bounding HTML container, ensuring zero functional breakage of internal block rendering (`ef25155`).
- `section-list-collections-v2`: Implemented **ABSOLUTE STRUCTURAL FIX** for "Boxed vs Wide" layout constraint. Resolved logic bug in Liquid wrapper that was defaulting to Wide layout on both settings. Enforced edge-to-edge breakout for `container-fluid` via CSS utility overrides (`max-width: 100% !important; width: 100% !important; padding: 0 !important`) while maintaining rigid Boxed dimensions for `container` mode (`47c7026`, `eaff743`).
- **Layout Architecture Fix**: Systematically retrofitted `section-slideshow`, `section-single-banner`, and `multicolumn` to support edge-to-edge "Wide" layouts on all page templates. Removed restrictive `{% if template ... %}` conditions from wrappers and enforced full-width CSS properties (`max-width: 100% !important; width: 100% !important; padding: 0 !important`) for `.layout-wide` and `.container-fluid` within these sections to guarantee visual breakout regardless of parent container limits.
