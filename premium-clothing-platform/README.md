# IHO Clothing Platform

Laravel + Inertia + React app for the IHO clothing storefront, sportswear catalog, franchise flow, and admin panel.

## Project Structure

- `backend/` - main application. Run Composer, npm, Artisan, migrations, and tests from here.
- `backend/resources/js/Pages/` - Inertia React pages.
- `backend/resources/js/Layouts/` - shared React layouts and UI helpers.
- `backend/routes/web.php` - storefront, sportswear, account, franchise, and admin pages.
- `backend/routes/api.php` - API endpoints for catalog, auth, franchise, and admin tools.

## Useful Commands

```bash
cd backend
composer install
npm install
php artisan migrate --seed
npm run dev
```

For a production build:

```bash
cd backend
npm run build
```
