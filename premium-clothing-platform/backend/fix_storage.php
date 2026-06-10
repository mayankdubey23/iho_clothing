<?php
$base = __DIR__;
$publicStorage = $base . '/public/storage';
$appStorage = $base . '/storage/app/public';

echo "=== FIXING STORAGE SYMLINK ===\n\n";

// Check if public/storage is a symlink or real directory
if (is_link($publicStorage)) {
    echo "public/storage is already a symlink pointing to: " . readlink($publicStorage) . "\n";
    exit;
}

// Step 1: Copy files from public/storage to storage/app/public (merge them)
echo "Step 1: Merging files from public/storage/products into storage/app/public/products...\n";
$sourceDir = $publicStorage . '/products';
$targetDir = $appStorage . '/products';

if (is_dir($sourceDir)) {
    $files = scandir($sourceDir);
    $files = array_diff($files, ['.', '..']);
    echo "Found " . count($files) . " files in public/storage/products\n";
    
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }
    
    foreach ($files as $file) {
        $source = $sourceDir . '/' . $file;
        $target = $targetDir . '/' . $file;
        if (!file_exists($target)) {
            copy($source, $target);
            echo "  Copied: $file\n";
        } else {
            echo "  Skipped (already exists): $file\n";
        }
    }
    
    // Also copy other subdirectories if they exist
    foreach (['banners', 'featured_categories', 'storefront_assets'] as $subDir) {
        $srcSub = $publicStorage . '/' . $subDir;
        $tgtSub = $appStorage . '/' . $subDir;
        if (is_dir($srcSub)) {
            if (!is_dir($tgtSub)) {
                mkdir($tgtSub, 0755, true);
            }
            $subFiles = scandir($srcSub);
            $subFiles = array_diff($subFiles, ['.', '..']);
            foreach ($subFiles as $file) {
                $source = $srcSub . '/' . $file;
                $target = $tgtSub . '/' . $file;
                if (!file_exists($target)) {
                    copy($source, $target);
                    echo "  Copied: $subDir/$file\n";
                }
            }
        }
    }
} else {
    echo "No source products directory found in public/storage\n";
}

// Step 2: Remove public/storage directory
echo "\nStep 2: Removing old public/storage directory...\n";
function rrmdir($dir) {
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (is_dir($dir . "/" . $object) && !is_link($dir . "/" . $object))
                    rrmdir($dir . "/" . $object);
                else
                    unlink($dir . "/" . $object);
            }
        }
        rmdir($dir);
    }
}

// Remove all contents
foreach (['products', 'banners', 'featured_categories', 'storefront_assets'] as $subDir) {
    $path = $publicStorage . '/' . $subDir;
    if (is_dir($path)) {
        rrmdir($path);
        echo "  Removed: $subDir\n";
    }
}
// Remove .gitignore
$gitignore = $publicStorage . '/.gitignore';
if (file_exists($gitignore)) {
    unlink($gitignore);
    echo "  Removed: .gitignore\n";
}
rmdir($publicStorage);
echo "  Removed: public/storage directory\n";

// Step 3: Create symlink
echo "\nStep 3: Creating symlink public/storage -> storage/app/public...\n";
$result = symlink($appStorage, $publicStorage);
if ($result) {
    echo "SUCCESS: Symlink created!\n";
    echo "  public/storage now points to: " . readlink($publicStorage) . "\n";
} else {
    echo "ERROR: Could not create symlink. Trying alternative method...\n";
    // On Windows, try using junction
    exec('mklink /J "' . $publicStorage . '" "' . $appStorage . '"', $output, $exitCode);
    if ($exitCode === 0) {
        echo "SUCCESS: Junction created!\n";
    } else {
        echo "ERROR: Could not create junction. You may need to run as Administrator.\n";
        echo "Run this command manually in cmd as Administrator:\n";
        echo "  mklink /J \"$publicStorage\" \"$appStorage\"\n";
    }
}

// Step 4: Verify
echo "\nStep 4: Verification\n";
echo "public/storage exists: " . (file_exists($publicStorage) ? 'YES' : 'NO') . "\n";
echo "public/storage is_link: " . (is_link($publicStorage) ? 'YES (symlink)' : 'NO') . "\n";
echo "public/storage/products exists: " . (is_dir($publicStorage . '/products') ? 'YES' : 'NO') . "\n";
$files = scandir($publicStorage . '/products');
$files = array_diff($files, ['.', '..']);
echo "Files in public/storage/products: " . count($files) . "\n";

echo "\n=== DONE ===\n";
?>