<?php

use App\Models\Category;
use App\Models\FranchisePlan;
use App\Models\Product;
use App\Models\StorefrontSetting;
use App\Models\User;
use App\Models\UserFranchise;
use App\Models\Order;
use App\Http\Controllers\AdminInventoryController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\FranchiseApplicationController;
use App\Http\Controllers\AdminDashboardController;      
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\UserFranchiseController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;



Route::get('/{category_slug}', function (string $category_slug) {
    $categoryMap = [
        'men' => 'men-sportswear',
        'women' => 'women-sportswear',
        'gym-wear' => 'gym-wear',
        'running-wear' => 'running-wear',
    ];

    return redirect()->route('shop', ['category' => $categoryMap[$category_slug]]);
})->where('category_slug', 'men|women|gym-wear|running-wear')->name('shop.category');

/*
|--------------------------------------------------------------------------
| 🛍️ PUBLIC STOREFRONT ROUTES
|--------------------------------------------------------------------------
*/


Route::post('/product/{product}/review', [StorefrontController::class, 'storeReview'])->name('reviews.store');

Route::get('/', [StorefrontController::class, 'index'])->name('home');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');


// Cart Route
Route::get('/cart', function () {
    return Inertia::render('Cart');
})->name('cart');

Route::get('/wishlist', function () {
    return Inertia::render('Wishlist');
})->name('wishlist');

Route::get('/sports-wear', function () {
    $products = Product::query()
        ->with(['category', 'skus.inventories', 'images' => fn ($q) => $q->orderByDesc('is_primary')->orderBy('sort_order')])
        ->where('is_active', true)
        ->whereHas('category', function ($query) {
            $query->where('slug', 'like', '%sport%')
                ->orWhere('name', 'like', '%sport%');
        })
        ->latest()
        ->take(8)
        ->get();

    if ($products->isEmpty()) {
        $products = Product::query()
            ->with(['category', 'skus.inventory', 'images' => fn ($q) => $q->orderByDesc('is_primary')])
            ->where('is_active', true)
            ->latest()
            ->take(8)
            ->get();
    }

    return Inertia::render('SportsWear', [
        'products' => $products,
        'categories' => Category::where('is_active', true)->orderBy('name')->get(),
        'plans' => FranchisePlan::orderBy('price')->get(),
    ]);
})->name('sports-wear');

Route::redirect('/men', '/shop?category=men-sportswear')->name('men');
Route::redirect('/women', '/shop?category=women-sportswear')->name('women');
Route::redirect('/gym-wear', '/shop?category=gym-wear')->name('gym-wear');
Route::redirect('/running-wear', '/shop?category=running-wear')->name('running-wear');
Route::get('/category/{slug}', function (string $slug) {
    return match ($slug) {
        'men' => redirect()->route('shop', ['category' => 'men-sportswear']),
        'women' => redirect()->route('shop', ['category' => 'women-sportswear']),
        default => redirect()->route('shop', ['category' => $slug]),
    };
})->name('category.show');


Route::get('/shop', function (\Illuminate\Http\Request $request) {
    $filters = $request->validate([
        'category' => ['nullable', 'string'],
        'gender' => ['nullable', 'string'],
        'subcategory' => ['nullable', 'string'],
        'search' => ['nullable', 'string', 'max:255'],
        'size' => ['nullable', 'string'],
        'color' => ['nullable', 'string'],
        'brand' => ['nullable', 'string'],
        'discount' => ['nullable', 'integer', 'min:0', 'max:100'],
        'min_price' => ['nullable', 'numeric', 'min:0'],
        'max_price' => ['nullable', 'numeric', 'min:0'],
        'sort' => ['nullable', 'string'],
    ]);

    $products = Product::query()
        ->with(['category', 'skus.inventory', 'images' => fn ($q) => $q->orderByDesc('is_primary')])
        ->when(Schema::hasColumn('products', 'is_active'), fn ($q) => $q->where(fn ($query) => $query->where('is_active', true)->orWhereNull('is_active')))
        ->when(($filters['category'] ?? null), function ($q, $slug) {
            $category = Category::where('slug', $slug)->first();

            if (! $category) {
                $q->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $slug));
                return;
            }

            $categoryIds = collect([$category->id]);
            if (Schema::hasColumn('categories', 'parent_id')) {
                $categoryIds = $categoryIds->merge(Category::where('parent_id', $category->id)->pluck('id'));
            }

            $q->whereIn('category_id', $categoryIds->unique()->values());
        })
        ->when(($filters['gender'] ?? null), function ($q, $gender) {
            $q->where(function ($query) use ($gender) {
                if (Schema::hasColumn('products', 'gender')) {
                    $query->where('gender', $gender);
                }

                $query->orWhereHas('category', fn ($category) => $category
                    ->where('slug', 'like', "%{$gender}%")
                    ->orWhere('name', 'like', "%{$gender}%"));
            });
        })
        ->when(($filters['subcategory'] ?? null), function ($q, $subcategory) {
            $q->where(function ($query) use ($subcategory) {
                if (Schema::hasColumn('products', 'subcategory_slug')) {
                    $query->where('subcategory_slug', $subcategory);
                }

                $readable = str_replace('-', ' ', $subcategory);
                $query->orWhereHas('category', fn ($category) => $category
                    ->where('slug', 'like', "%{$subcategory}%")
                    ->orWhere('name', 'like', "%{$readable}%"));
            });
        })
        ->when(($filters['search'] ?? null), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
        ->when(($filters['size'] ?? null), fn ($q, $size) => $q->whereHas('skus', fn ($sku) => $sku->where('size', $size)))
        ->when(($filters['color'] ?? null), fn ($q, $color) => $q->whereHas('skus', fn ($sku) => $sku->where('color', $color)))
        ->when(($filters['brand'] ?? null) && Schema::hasColumn('products', 'brand_id') && Schema::hasTable('brands'), function ($q, $brand) {
            $q->whereHas('brand', fn ($brandQuery) => $brandQuery->where('slug', $brand)->orWhere('name', $brand));
        })
        ->when(($filters['discount'] ?? null) && Schema::hasColumn('products', 'mrp'), function ($q, $discount) {
            $q->whereNotNull('mrp')
                ->whereColumn('mrp', '>', 'base_price')
                ->whereRaw('((mrp - base_price) / mrp) * 100 >= ?', [(int) $discount]);
        })
        ->when(($filters['min_price'] ?? null), fn ($q, $price) => $q->where('base_price', '>=', $price))
        ->when(($filters['max_price'] ?? null), fn ($q, $price) => $q->where('base_price', '<=', $price))
        ->when(($filters['sort'] ?? null) === 'price_asc', fn ($q) => $q->orderBy('base_price'))
        ->when(($filters['sort'] ?? null) === 'price_desc', fn ($q) => $q->orderByDesc('base_price'))
        ->when(($filters['sort'] ?? null) === 'popular' && Schema::hasColumn('products', 'is_best_seller'), fn ($q) => $q->orderByDesc('is_best_seller'))
        ->latest()
        ->paginate(12)
        ->withQueryString();

    $products->getCollection()->transform(function (Product $product) {
        $imagePath = $product->image_path ?: optional($product->images->first())->image_path;
        $stock = (int) $product->skus->sum(function ($sku) {
            return $sku->inventories
                ->whereNull('franchise_id')
                ->sum('stock_quantity');
        });

        $product->image_path = $imagePath
            ? preg_replace('#^/?storage/#', '', ltrim($imagePath, '/'))
            : null;
        $product->price = $product->base_price;
        $product->compare_at_price = $product->mrp;
        $product->stock = $stock;
        $product->in_stock = $stock > 0;
        $product->available_sizes = $product->skus
            ->pluck('size')
            ->filter()
            ->unique()
            ->values()
            ->map(fn ($size) => ['id' => $size, 'code' => $size]);
        $product->available_colors = $product->skus
            ->pluck('color')
            ->filter()
            ->unique()
            ->values()
            ->map(fn ($color) => ['id' => $color, 'name' => $color]);

        return $product;
    });

    $pageContent = Schema::hasTable('pages')
        ? DB::table('pages')->where('slug', 'shop')->first()
        : null;
    $cmsSettings = StorefrontSetting::pluck('value', 'key')->toArray();
    $categories = Category::query()
        ->where('is_active', true)
        ->when(Schema::hasColumn('categories', 'parent_id'), function ($query) {
            $query->whereNull('parent_id')
                ->with(['children' => fn ($children) => $children->where('is_active', true)->orderBy('name')]);
        })
        ->orderBy('name')
        ->get();
    $colors = Schema::hasTable('colors')
        ? DB::table('colors')->where('is_active', 1)->orderBy('name')->get()
        : collect();
    $sizes = Schema::hasTable('sizes')
        ? DB::table('sizes')->where('is_active', 1)->orderBy('name')->get()
        : collect();
    $brands = Schema::hasTable('brands')
        ? DB::table('brands')->where('is_active', 1)->orderBy('name')->get()
        : collect();

    return Inertia::render('Shop', [
        'filters' => $filters,
        'products' => $products,
        'categories' => $categories,
        'brands' => $brands,
        'colors' => $colors,
        'sizes' => $sizes,
        'pageContent' => $pageContent,
        'cms' => $cmsSettings,
    ]);
})->name('shop');

Route::get('/franchise-apply', function () {
    if (!Auth::check()) {
        return redirect()->route('login')->with('error', 'Please sign in to apply for a franchise.');
    }

    return redirect()->route('account.franchise-apply');
})->name('franchise-apply');
Route::redirect('/franchise-enquiry', '/franchise/apply')->name('franchise.enquiry');
Route::get('/auth/google/status', [AuthController::class, 'googleStatus'])->name('auth.google.status');
Route::get('/auth/google', fn () => redirect()->route('login')->with('error', 'Google login is not configured yet.'))->name('auth.google');

// Checkout Route
Route::get('/checkout', function () {
    return Inertia::render('Checkout');
})->name('checkout');

// 🛡️ SECURITY: Rate limiting added to prevent order/payment spam
Route::middleware('throttle:10,1')->group(function() {
    Route::get('/payment', [OrderController::class, 'paymentPage'])->name('payment.page');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/payment/verify', [OrderController::class, 'verifyPayment'])->name('payment.verify');
    Route::post('/coupons/apply', [CouponController::class, 'apply'])->name('coupons.apply');
});

/*
|--------------------------------------------------------------------------
| 🔒 AUTHENTICATION & SMART REDIRECTS
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    Route::get('/login', fn () => Inertia::render('Auth/Login'))->name('login');
    Route::get('/register', fn () => Inertia::render('Auth/Register'))->name('register.view');

    Route::post('/register', function (Request $request) {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'mobile_number' => ['required', 'digits:10', 'regex:/^[6-9][0-9]{9}$/'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'mobile_number' => $validated['mobile_number'],
            'password' => Hash::make($validated['password']),
            'role'     => 'customer',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/')->with('success', 'Account created successfully.');
    })->name('register.store');

    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:5,1')->name('login.store');
    Route::post('/login/mobile-otp', [AuthController::class, 'requestMobileOtp'])->middleware('throttle:5,1')->name('login.mobile-otp');
    Route::post('/login/mobile-otp/verify', [AuthController::class, 'verifyMobileLogin'])->middleware('throttle:5,1')->name('login.mobile-otp.verify');
});

/*
|--------------------------------------------------------------------------
| 👤 SECURE SECTORS (Consumer, Franchise, SuperAdmin)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
    
    // 🚪 Logout
    Route::post('/logout', function (Request $request) {
        if (Auth::check() && Schema::hasTable('activity_logs')) {
            $logData = [
                'user_id' => Auth::id(),
                'module' => 'Auth',
                'action' => 'Logged Out',
                'ip_address' => $request->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (Schema::hasColumn('activity_logs', 'description')) {
                $logData['description'] = 'User logged out.';
            }
            if (Schema::hasColumn('activity_logs', 'role')) {
                $logData['role'] = Auth::user()->role;
            }
            if (Schema::hasColumn('activity_logs', 'device_info')) {
                $logData['device_info'] = substr((string) $request->userAgent(), 0, 255);
            }

            DB::table('activity_logs')->insert($logData);
        }

        Auth::logout(); 
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    })->name('logout');


    // ==========================================
    // 🛒 1. CONSUMER SECTOR (URL: /account)
    // ==========================================
    Route::prefix('account')->group(function () {
        Route::get('/', fn () => Inertia::render('Account', [
            'orders'       => Order::with([
                    'items.product.images',
                    'items.sku',
                ])
                ->where(function ($query) {
                    $query->where('customer_email', Auth::user()->email);

                    if (Schema::hasColumn('orders', 'user_id')) {
                        $query->orWhere('user_id', Auth::id());
                    }
                })
                ->latest()
                ->get(),
            'applications' => UserFranchise::with('franchisePlan')->where('user_id', Auth::id())->get(),
        ]))->name('account');

        Route::patch('/profile', function (Request $request) {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore(Auth::id())],
                'mobile_number' => ['nullable', 'digits:10', 'regex:/^[6-9][0-9]{9}$/'],
                'address_line' => ['nullable', 'string', 'max:255'],
                'city' => ['nullable', 'string', 'max:100'],
                'state' => ['nullable', 'string', 'max:100'],
                'pincode' => ['nullable', 'digits:6'],
                'country' => ['nullable', 'string', 'max:100'],
            ]);

            Auth::user()->update($validated);

            return back()->with('success', 'Profile updated successfully.');
        })->name('account.profile.update');

        Route::get('/franchise-apply', fn () => Inertia::render('FranchiseApply', [
            'plans' => FranchisePlan::orderBy('price')->get()
        ]))->name('account.franchise-apply');
        
        Route::post('/franchise-apply', [UserFranchiseController::class, 'store'])
            ->name('account.franchise-apply.store')
            ->middleware('throttle:3,1');
    });


    Route::middleware(['auth'])->group(function () {
    Route::put('/user/profile-information', [AccountController::class, 'updateProfile']);
    Route::put('/user/password', [AccountController::class, 'updatePassword']);
    Route::post('/user/addresses', [AccountController::class, 'storeAddress']);
    Route::post('/user/support-tickets', [AccountController::class, 'storeTicket']);
    Route::delete('/user/account', [AccountController::class, 'destroyAccount']);
    Route::post('/user/settings/notifications', [AccountController::class, 'updateNotifications']);
    Route::get('/user/data/download', [AccountController::class, 'downloadData']);
    Route::delete('/user/payment-methods/{id}', [AccountController::class, 'removePaymentMethod']);
});


    // ==========================================
    Route::get('/admin', fn () => redirect('/franchise-superadmin'));
    Route::get('/admin/{path}', fn (string $path) => redirect('/franchise-superadmin/' . $path))->where('path', '.*');


    // Public Routes (Anyone can apply)
    Route::get('/franchise/apply', [FranchiseApplicationController::class, 'create'])->name('franchise.apply');
    Route::post('/franchise/apply', [FranchiseApplicationController::class, 'store']);

    // Super Admin Routes (To view and convert)
    Route::middleware(['auth', 'role:super_admin'])->group(function () {
    Route::get('/admin/franchise-applications', [FranchiseApplicationController::class, 'index']);
    Route::post('/admin/franchise-applications/{id}/approve', [FranchiseApplicationController::class, 'approve']);
    });



    // 👑 2. SUPER ADMIN SECTOR (URL: /franchise-superadmin)
    // ==========================================
    Route::prefix('franchise-superadmin')->group(function () {
        
        Route::get('/', [OrderController::class, 'dashboard'])->name('admin.dashboard');

        Route::redirect('/MasterStock', '/franchise-superadmin/master-stock');
        Route::redirect('/inventory', '/franchise-superadmin/master-stock');

        Route::get('/master-stock', [InventoryController::class, 'index'])->name('admin.inventory.index');
        Route::post('/inventory/add', [AdminInventoryController::class, 'addMasterStock'])->name('admin.inventory.add');
        Route::get('/inventory/franchise/{id}', [AdminInventoryController::class, 'viewFranchiseStock'])
            ->name('admin.inventory.franchise')->whereNumber('id');
        Route::get('/inventory/history', [AdminInventoryController::class, 'stockHistory'])->name('admin.inventory.history');
        
        Route::match(['put', 'patch'], '/orders/{id}/status', [OrderController::class, 'updateStatus'])
            ->name('admin.orders.status')->whereNumber('id');

        Route::get('/orders', [OrderController::class, 'index'])->name('admin.orders');

        Route::get('/products', [AdminProductController::class, 'index'])->name('admin.products');
        Route::post('/products', [AdminProductController::class, 'store'])->name('admin.products.store');
        Route::post('/products/{id}/toggle-status', [AdminProductController::class, 'toggleStatus'])
            ->name('admin.products.toggle-status')->whereNumber('id');
        Route::resource('categories', CategoryController::class);
        
        Route::get('/franchises', [UserFranchiseController::class, 'index'])->name('admin.franchises');
        Route::post('/franchises', [UserFranchiseController::class, 'store'])->name('admin.franchises.store');
        Route::post('/franchises/{id}/toggle-status', [UserFranchiseController::class, 'toggleStatus'])
            ->name('admin.franchises.toggle-status')->whereNumber('id');
        
        Route::patch('/franchise-applications/{application}', [FranchiseApplicationController::class, 'updateStatus'])
            ->name('admin.franchises.update')->whereNumber('application');
        
        Route::get('/franchises/{id}', [UserFranchiseController::class, 'show'])
            ->name('admin.franchises.show')->whereNumber('id');
        
        Route::get('/stock-requests', [StockController::class, 'index'])->name('admin.stock-requests');
        Route::patch('/stock-requests/{id}/approve', [StockController::class, 'approve'])
            ->name('admin.stock-requests.approve')->whereNumber('id');
        
        Route::get('/customers', fn() => Inertia::render('Admin/Customers', [
            'customers' => User::where('role', 'customer')->paginate(20)
        ]))->name('admin.customers');
            
        Route::get('/coupons', [CouponController::class, 'index'])->name('admin.coupons');
        Route::post('/coupons', [CouponController::class, 'store']);
        Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy'])->whereNumber('coupon');
        
    });


    // 🚀 SUPER ADMIN ROUTES
    Route::middleware(['auth'])->group(function () {
        Route::prefix('franchise-superadmin')->middleware(['auth'])->group(function () {
    
    // 1. Command Center
    Route::get('/command-center', [AdminDashboardController::class, 'index'])->name('admin.command-center');
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard.view');
    
    // 2. Network Orders (Ye lagate hi aapka 404 order page chal padega)
    Route::get('/admin/orders', [OrderController::class, 'index'])->name('admin.orders');
    Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/admin/orders/{id}/reassign', [OrderController::class, 'reassignOrder']);
        
        // 3. Master Stock / Inventory
    Route::put('/master-stock/{id}/adjust', [InventoryController::class, 'adjustStock']);
    Route::post('/master-stock/{id}/transfer', [InventoryController::class, 'transferStock']);


    // 🚀 CUSTOMER MANAGEMENT
    Route::get('/franchise-superadmin/customers', [App\Http\Controllers\CustomerController::class, 'index'])->name('admin.customers');
    Route::get('/franchise-superadmin/customers/export', [App\Http\Controllers\CustomerController::class, 'exportData']);
    Route::post('/franchise-superadmin/customers/{id}/toggle-status', [App\Http\Controllers\CustomerController::class, 'toggleStatus']);
    Route::put('/franchise-superadmin/products/{product}', [ProductController::class, 'update']);

    // 4. Franchises (Approved network)
    // 5. Franchise Requests (New applications)
    Route::get('/franchise-requests', [FranchiseApplicationController::class, 'index'])->name('admin.franchise_requests');
    
// 🚀 PRODUCT ROUTES 
    Route::middleware(['super_admin'])->group(function () {
        Route::get('/products', [AdminProductController::class, 'index'])->name('admin.products.index');
        Route::get('/products/create', [AdminProductController::class, 'create'])->name('admin.products.create');
        Route::post('/products', [AdminProductController::class, 'store'])->name('admin.products.store');
        Route::get('/products/{product}/edit', [AdminProductController::class, 'edit'])->name('admin.products.edit');
        Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('admin.products.update');
        Route::patch('/products/{product}', [AdminProductController::class, 'update']);
    });


    // 🚀 CATEGORY ROUTES
    Route::get('/categories', [App\Http\Controllers\AdminCategoryController::class, 'index'])->name('admin.categories');
    Route::post('/categories', [App\Http\Controllers\AdminCategoryController::class, 'store']);
    Route::post('/categories/sync-defaults', [App\Http\Controllers\AdminCategoryController::class, 'syncDefaults']);
    Route::post('/categories/{id}/toggle-status', [App\Http\Controllers\AdminCategoryController::class, 'toggleStatus']);

    // 🚀 STOCK REQUEST ROUTES
    Route::get('/stock-requests', [App\Http\Controllers\AdminStockRequestController::class, 'index'])->name('admin.stock_requests');
    Route::post('/stock-requests/{id}/status', [App\Http\Controllers\AdminStockRequestController::class, 'updateStatus']);

    // 🚀 SERVICE AREAS (ROUTING ZONES)
    Route::get('/service-areas', [App\Http\Controllers\AdminServiceAreaController::class, 'index'])->name('admin.service_areas');
    Route::post('/service-areas', [App\Http\Controllers\AdminServiceAreaController::class, 'store']);
    Route::post('/service-areas/{id}/transfer', [App\Http\Controllers\AdminServiceAreaController::class, 'transfer']);
    Route::post('/service-areas/{id}/toggle-status', [App\Http\Controllers\AdminServiceAreaController::class, 'toggleStatus']);



    // 🚀 FINANCIAL LEDGER (PAYMENTS)
    Route::get('/payments', [App\Http\Controllers\AdminPaymentController::class, 'index'])->name('admin.payments');
    Route::post('/payments/{id}/status', [App\Http\Controllers\AdminPaymentController::class, 'updateStatus']);


        // 🚀 COUPONS & OFFERS
    Route::get('/coupons', [App\Http\Controllers\AdminCouponController::class, 'index'])->name('admin.coupons');
    Route::post('/coupons', [App\Http\Controllers\AdminCouponController::class, 'store']);
    Route::post('/coupons/{id}/toggle-status', [App\Http\Controllers\AdminCouponController::class, 'toggleStatus']);
    Route::delete('/coupons/{id}', [App\Http\Controllers\AdminCouponController::class, 'destroy']);
    Route::put('/franchise-superadmin/offers/{id}', [App\Http\Controllers\AdminCouponController::class, 'updateOffer'])->name('superadmin.offers.update');
   

    // 🚀 RETURNS & REFUNDS
    Route::get('/returns', [App\Http\Controllers\AdminReturnController::class, 'index'])->name('admin.returns');
    Route::post('/returns/{id}/status', [App\Http\Controllers\AdminReturnController::class, 'updateStatus']);
    Route::post('/returns/{id}/inspect', [App\Http\Controllers\AdminReturnController::class, 'processInspection']);


    // 🚀 REPORTS & ANALYTICS
    Route::get('/analytics', [App\Http\Controllers\AdminAnalyticsController::class, 'index'])->name('admin.analytics');


    // 🚀 WEBSITE CONTENT (CMS)
    Route::get('/content', [App\Http\Controllers\AdminContentController::class, 'index'])->name('admin.content');
    Route::post('/content/settings', [App\Http\Controllers\AdminContentController::class, 'updateSettings'])->name('superadmin.settings.update');
    Route::post('/content/shop-page', [App\Http\Controllers\AdminContentController::class, 'updateSettings'])->name('admin.content.shop-page.update');
    Route::post('/content/gym-wear', [App\Http\Controllers\AdminContentController::class, 'updateSettings'])->name('admin.content.gym-wear.update');
    Route::post('/content/testimonials', [App\Http\Controllers\AdminContentController::class, 'storeTestimonial'])->name('admin.content.testimonials.store');
    Route::put('/content/testimonials/{id}', [App\Http\Controllers\AdminContentController::class, 'updateTestimonial'])->name('admin.content.testimonials.update');
    Route::delete('/content/testimonials/{id}', [App\Http\Controllers\AdminContentController::class, 'destroyTestimonial'])->name('admin.content.testimonials.destroy');
    Route::post('/content/toggle-status', [App\Http\Controllers\AdminContentController::class, 'toggleStatus']);

    // 🖼️ FEATURED CATEGORIES (Homepage "The Collections" section)
    Route::post('/content/featured-categories', [App\Http\Controllers\AdminContentController::class, 'storeFeaturedCategory'])->name('admin.content.featured-categories.store');
    Route::post('/content/featured-categories/{id}', [App\Http\Controllers\AdminContentController::class, 'updateFeaturedCategory'])->name('admin.content.featured-categories.update');
    Route::delete('/content/featured-categories/{id}', [App\Http\Controllers\AdminContentController::class, 'destroyFeaturedCategory'])->name('admin.content.featured-categories.destroy');
    Route::post('/content/featured-categories/{id}/toggle', [App\Http\Controllers\AdminContentController::class, 'toggleFeaturedCategory'])->name('admin.content.featured-categories.toggle');


    // 🚀 NOTIFICATIONS HUB
    Route::get('/notifications', [App\Http\Controllers\AdminNotificationController::class, 'index'])->name('admin.notifications');
    Route::post('/notifications/send', [App\Http\Controllers\AdminNotificationController::class, 'send']);

    // 🚀 HELPDESK / SUPPORT TICKETS
    Route::get('/tickets', [App\Http\Controllers\AdminTicketController::class, 'index'])->name('admin.tickets');
    Route::get('/tickets/{id}', [App\Http\Controllers\AdminTicketController::class, 'show']);
    Route::post('/tickets/{id}/reply', [App\Http\Controllers\AdminTicketController::class, 'reply']);
    Route::post('/tickets/{id}/status', [App\Http\Controllers\AdminTicketController::class, 'updateStatus']);

    // 🚀 STAFF & PERMISSIONS (RBAC)
    Route::get('/staff', [App\Http\Controllers\AdminStaffController::class, 'index'])->name('admin.staff');
    Route::post('/staff', [App\Http\Controllers\AdminStaffController::class, 'store']);
    Route::post('/staff/{id}/toggle-status', [App\Http\Controllers\AdminStaffController::class, 'toggleStatus']);

    // 🚀 INVOICE & GST MODULE
    Route::get('/invoices', [App\Http\Controllers\AdminInvoiceController::class, 'index'])->name('admin.invoices');
    Route::post('/invoices/settings', [App\Http\Controllers\AdminInvoiceController::class, 'updateSettings']);
    Route::get('/invoices/{id}/download', [App\Http\Controllers\AdminInvoiceController::class, 'downloadPdf']);
    Route::post('/invoices/{id}/email', [App\Http\Controllers\AdminInvoiceController::class, 'sendEmail']);

    // 🚀 DELIVERY & LOGISTICS SETTINGS
    Route::get('/delivery', [App\Http\Controllers\AdminDeliveryController::class, 'index'])->name('admin.delivery');
    Route::post('/delivery/pincode', [App\Http\Controllers\AdminDeliveryController::class, 'storePincode']);
    Route::post('/delivery/shipment/{id}', [App\Http\Controllers\AdminDeliveryController::class, 'updateTracking']);


    // 🚀 GLOBAL SETTINGS
    Route::get('/settings', [App\Http\Controllers\AdminSettingController::class, 'index'])->name('admin.settings');
    Route::post('/settings/general', [App\Http\Controllers\AdminSettingController::class, 'updateGeneral']);
    Route::post('/settings/gateway/{id}', [App\Http\Controllers\AdminSettingController::class, 'updateGateway']);

    // 🚀 MASTER ACTIVITY LOGS (AUDIT TRAIL)
    Route::get('/activity-logs', [App\Http\Controllers\AdminActivityLogController::class, 'index'])->name('admin.activity_logs');


    // 🚀 SECURE LOGOUT
    Route::post('/logout', [App\Http\Controllers\AdminAuthController::class, 'logout'])->name('admin.logout');

    });});


// ==========================================
    // 🏢 3. FRANCHISE SECTOR (URL: /franchise-admin)
    // ==========================================
    Route::prefix('franchise-admin')->group(function () {

        Route::get('/', [OrderController::class, 'dashboard'])->name('franchise.dashboard');

    });
// 🛡️ THE FRANCHISE ADMIN SECURE BUBBLE
Route::middleware(['auth', 'franchise'])->prefix('franchise')->group(function () {
    
    // Command Center
    Route::get('/dashboard', [App\Http\Controllers\Franchise\DashboardController::class, 'index'])->name('franchise.dashboard');

    // 1. VIEW ORDERS (Now Active & Real-time! 🚀)
    Route::get('/orders', [App\Http\Controllers\Franchise\OrderController::class, 'index'])->name('franchise.orders');
    Route::post('/orders/{id}/status', [App\Http\Controllers\Franchise\OrderController::class, 'updateStatus']);
    // 2. BUY STOCK (Stock Requests) 🚀
    Route::get('/stock-requests/new', [App\Http\Controllers\Franchise\StockRequestController::class, 'index'])->name('franchise.buy_stock');
    Route::post('/stock-requests', [App\Http\Controllers\Franchise\StockRequestController::class, 'store']);
    // 3. LOCAL INVENTORY (Check Low Stock) 🚀
    Route::get('/inventory', [App\Http\Controllers\Franchise\InventoryController::class, 'index'])->name('franchise.inventory');    
    Route::post('/inventory/{id}/damaged', [App\Http\Controllers\Franchise\InventoryController::class, 'markDamaged']);
    // 4. SUPPORT HELPDESK 🚀
    Route::get('/support', [App\Http\Controllers\Franchise\SupportController::class, 'index'])->name('franchise.support');
    Route::post('/support', [App\Http\Controllers\Franchise\SupportController::class, 'store']);

    Route::post('/orders/{id}/tracking', [App\Http\Controllers\Franchise\OrderController::class, 'updateTracking']);
    Route::get('/orders/{id}/invoice', [App\Http\Controllers\Franchise\OrderController::class, 'printInvoice']);

    // 5. LOCAL CATALOG (Assigned Products) 🚀
    Route::get('/catalog', [App\Http\Controllers\Franchise\CatalogController::class, 'index'])->name('franchise.catalog');
    Route::post('/catalog/{mappingId}/price', [App\Http\Controllers\Franchise\CatalogController::class, 'updatePrice']);
    Route::post('/catalog/{mappingId}/toggle', [App\Http\Controllers\Franchise\CatalogController::class, 'toggleVisibility']);

    // 6. LOCAL CUSTOMERS (CRM) 🚀
    Route::get('/customers', [App\Http\Controllers\Franchise\CustomerController::class, 'index'])->name('franchise.customers');
    
    // 7. RETURNS & REFUNDS (Reverse Logistics) 🚀
    Route::get('/returns', [App\Http\Controllers\Franchise\ReturnController::class, 'index'])->name('franchise.returns');
    Route::post('/returns/{id}/status', [App\Http\Controllers\Franchise\ReturnController::class, 'updateStatus']);

    // 8. PAYMENTS & WALLET (Financial Ledger) 🚀
    Route::get('/wallet', [App\Http\Controllers\Franchise\WalletController::class, 'index'])->name('franchise.wallet');

    // 9. REPORTS & ANALYTICS 🚀
    Route::get('/analytics', [App\Http\Controllers\Franchise\AnalyticsController::class, 'index'])->name('franchise.analytics');

    // 10. SERVICE AREA (Geofencing) 🚀
    Route::get('/service-area', [App\Http\Controllers\Franchise\ServiceAreaController::class, 'index'])->name('franchise.service_area');
    Route::post('/service-area/request', [App\Http\Controllers\Franchise\ServiceAreaController::class, 'storeRequest']);

    // 11. NOTIFICATIONS INBOX 🚀
    Route::get('/notifications', [App\Http\Controllers\Franchise\NotificationController::class, 'index'])->name('franchise.notifications');
    Route::post('/notifications/{id}/read', [App\Http\Controllers\Franchise\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [App\Http\Controllers\Franchise\NotificationController::class, 'markAllAsRead']);

    // 12. SUPPORT TICKETS (Helpdesk) 🚀
    Route::get('/support', [App\Http\Controllers\Franchise\SupportController::class, 'index'])->name('franchise.support');
    Route::post('/support', [App\Http\Controllers\Franchise\SupportController::class, 'store']);
    Route::post('/support/{id}/reply', [App\Http\Controllers\Franchise\SupportController::class, 'reply']);
    Route::post('/support/{id}/close', [App\Http\Controllers\Franchise\SupportController::class, 'close']);

    // 13. STORE PROFILE & SETTINGS 🚀
    Route::get('/profile', [App\Http\Controllers\Franchise\ProfileController::class, 'index'])->name('franchise.profile');
    Route::post('/profile/general', [App\Http\Controllers\Franchise\ProfileController::class, 'updateGeneral']);
    Route::post('/profile/sensitive', [App\Http\Controllers\Franchise\ProfileController::class, 'requestSensitiveUpdate']);

    // 14. ACTIVITY LOGS (Audit Trail) 🚀
    Route::get('/activity-logs', [App\Http\Controllers\Franchise\ActivityLogController::class, 'index'])->name('franchise.logs');

    });


}); // <-- Closes the main Auth Middleware
