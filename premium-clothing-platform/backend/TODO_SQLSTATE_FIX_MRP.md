# SQLSTATE[42S22] Unknown column 'mrp' (1054)

## What caused it
- Seeder `DatabaseSeeder.php` inserts `mrp` into `products`.
- Migration `2026_05_04_110523_create_products_table.php` creates `products` table **without** an `mrp` column.

## Fix options (choose one)
1) **Add `mrp` column via migration** (recommended)
   - Create a new migration to `Schema::table('products', ...)` and add `decimal('mrp', 10, 2)->nullable()` (or default 0).
   - Run `php artisan migrate`.

2) **Remove `mrp` from seeder/controller**
   - Not recommended because controller validation and UI likely already expect `mrp`.

## After fix
- Run `php artisan migrate:fresh --seed` to verify seeding works.

