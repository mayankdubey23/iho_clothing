# TODO - Apply Color Theme Across Whole Website

## Step 1: Baseline audit
- Inspect existing theme sources:
  - `resources/css/app.css`
  - `tailwind.config.js`
  - layout components using hard-coded colors (start with `resources/js/Layouts/AppLayout.jsx`, `resources/js/Components/Navbar.jsx`, `resources/js/Components/Footer.jsx`, `resources/js/Layouts/AdminLayout.jsx`).

## Step 2: Decide theme mapping
- Define the “whole site” palette targets (brand/navy/accent/cta/background).
- Ensure CSS variables in `resources/css/app.css` are the single source of truth.

## Step 3: Remove/replace hard-coded colors
- Replace Tailwind arbitrary hex values (e.g. `text-[#1E293B]`, `bg-[#1E293B]`, `text-red-500`, etc.) with theme tokens:
  - Prefer CSS-variable theme utilities or Tailwind config colors (e.g. `text-brand-navy`, `text-brand-accent`).

## Step 4: Tailwind config alignment
- Align `tailwind.config.js` extended colors with `resources/css/app.css` variables to avoid drift.

## Step 5: Apply globally
- Update global wrappers (`AppLayout`, `AdminLayout`) to use tokens.
- Update shared UI components (Navbar/Footer/Buttons/Cards) to use tokens.

## Step 6: Validate
- Run build/dev command and check for CSS/Tailwind build errors.
- Spot-check key pages: `/`, `/shop`, `/offers`, `/login`, account, franchise/admin areas.

## Step 7: Final cleanup
- Search remaining hard-coded brand colors and patch.

## Progress note (current)
- Applied the homepage storefront palette across global theme tokens, shared layouts, storefront components, auth/account pages, shop/product pages, franchise pages, and admin pages.
- Build validation passes with `npm run build`.


