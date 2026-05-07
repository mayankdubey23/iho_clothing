# TODO

## Account dropdown + navigation
- [ ] Update `resources/js/Layouts/AppLayout.jsx`
  - [ ] Add `ACCOUNT_MENU` export (10 items, includes Logout).
  - [ ] Replace current account button(s) with avatar-triggered dropdown (desktop) showing all menu items.
  - [ ] Expand mobile menu to show full account options (not just “My Account”).
  - [ ] Use new icons (lucide-react) consistent with the menu.

## Account page redesign
- [ ] Redesign `resources/js/Pages/Account.jsx`
  - [ ] Replace current dashboard UI with dark hero banner.
  - [ ] Add animated 3-column card grid for all 9 items + Logout.
  - [ ] Ensure Logout triggers the same `/logout` POST behavior.

## Validation
- [ ] Run frontend build/lint (if available) or at least `npm run dev`/`npm run build`.
- [ ] Smoke test: dropdown opens, mobile menu shows all items, account cards navigate.
