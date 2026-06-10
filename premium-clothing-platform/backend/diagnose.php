<?php
echo "=== Storage Diagnostics ===\n";
$base = __DIR__;

// Check public storage
$publicStorage = $base . '/public/storage';
echo "public/storage exists: " . (file_exists($publicStorage) ? 'YES' : 'NO') . "\n";
echo "public/storage is_link: " . (is_link($publicStorage) ? 'YES' : 'NO') . "\n";
echo "public/storage realpath: " . (realpath($publicStorage) ?: 'N/A') . "\n";

// Check storage app public
$storagePublic = $base . '/storage/app/public';
echo "storage/app/public exists: " . (is_dir($storagePublic) ? 'YES' : 'NO') . "\n";

// Check products
$productsDir = $storagePublic . '/products';
echo "storage/app/public/products exists: " . (is_dir($productsDir) ? 'YES' : 'NO') . "\n";
if (is_dir($productsDir)) {
    $files = scandir($productsDir);
    $files = array_diff($files, ['.', '..']);
    echo "Files in storage/app/public/products: " . count($files) . "\n";
    foreach (array_slice($files, 0, 5) as $f) echo "  - $f\n";
}

// Check public storage products
$publicProducts = $publicStorage . '/products';
echo "\npublic/storage/products exists: " . (is_dir($publicProducts) ? 'YES' : 'NO') . "\n";
if (is_dir($publicProducts)) {
    $files = scandir($publicProducts);
    $files = array_diff($files, ['.', '..']);
    echo "Files in public/storage/products: " . count($files) . "\n";
    foreach (array_slice($files, 0, 5) as $f) echo "  - $f\n";
}

// DB check
echo "\n=== Database Check ===\n";
try {
    $db = new PDO('mysql:host=127.0.0.1;port=3306;dbname=premium_clothing_db', 'root', '');
    $stmt = $db->query('SELECT id, name, sku, image_path FROM products ORDER BY id DESC LIMIT 5');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "Product #{$row['id']}: {$row['name']} (SKU: {$row['sku']})\n";
        echo "  image_path: " . ($row['image_path'] ?: 'NULL') . "\n";
    }
    
    $stmt2 = $db->query('SELECT id, product_id, image_path, media_type, is_primary FROM product_images ORDER BY id DESC LIMIT 5');
    while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
        echo "Image #{$row['id']} (Product #{$row['product_id']}): {$row['image_path']} [{$row['media_type']}] primary=" . ($row['is_primary'] ? 'yes' : 'no') . "\n";
    }
} catch (Exception $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}

echo "\n=== Checking specific product for edit ===\n";
try {
    $stmt3 = $db->query('SELECT id, name, slug, sku FROM products ORDER BY id DESC LIMIT 1');
    $product = $stmt3->fetch(PDO::FETCH_ASSOC);
    if ($product) {
        echo "Latest product #{$product['id']}: {$product['name']} (slug: {$product['slug']})\n";
        echo "Edit URL: /franchise-superadmin/products/{$product['id']}/edit\n";
        
        // Check web.php route
        echo "\nRoute in web.php: Route::get('/products/{product}/edit' ...)\n";
        echo "This should match: /franchise-superadmin/products/{$product['id']}/edit\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== Checking admin routes in web.php ===\n";
echo "The edit route is: /franchise-superadmin/products/{product}/edit\n";
echo "Route uses AdminProductController::edit\n";
echo "Route name: admin.products.edit\n";
?>