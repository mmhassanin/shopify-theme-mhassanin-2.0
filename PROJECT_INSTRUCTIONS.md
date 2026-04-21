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
- `section-list-collections-v2`: Refactored wrapper to use explicit `is_wide` variable for strict boxed vs wide layout control (`b4952a8`).
