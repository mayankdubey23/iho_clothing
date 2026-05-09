<?php

use App\Models\Category;
use App\Models\FranchisePlan;
use App\Models\Product;
use App\Models\User;
use App\Models\UserFranchise;
use App\Models\Order;
use App\Http\Controllers\AdminInventoryController;
use App\Http\Controllers\AdminProductController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\FranchiseApplicationController;
use App\Http\Controllers\AdminDashboardController;      
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\UserFranchiseController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| 🛍️ PUBLIC STOREFRONT ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/', function (Request $request) {
    $filters = $request->validate([
        'category'  => ['nullable', 'string'],
        'search'    => ['nullable', 'string', 'max:255'],
        'min_price' => ['nullable', 'numeric', 'min:0'],
        'max_price' => ['nullable', 'numeric', 'min:0'],
    ]);

    $products = Product::query()
        ->with(['category', 'skus.inventory', 'images' => fn ($q) => $q->orderByDesc('is_primary')])
        ->where('is_active', true)
        ->when(($filters['category'] ?? 'all') !== 'all', fn($q) => $q->whereHas('category', fn($cq) => $cq->where('slug', $filters['category'])))
        ->when($filters['search'] ?? null, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
        ->latest()
        ->paginate(12)
        ->withQueryString();

    return Inertia::render('Storefront', [
        'products'   => $products,
        'categories' => Category::where('is_active', true)->orderBy('name')->get(),
        'plans'      => FranchisePlan::orderBy('price')->get(),
        'filters'    => $filters,
    ]);
})->name('home');


// Cart Route
Route::get('/cart', function () {
    return Inertia::render('Cart');
})->name('cart');

Route::get('/sports-wear', function () {
    $products = Product::query()
        ->with(['category', 'skus.inventory', 'images' => fn ($q) => $q->orderByDesc('is_primary')])
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

Route::get('/about', fn () => Inertia::render('StaticPage', [
    'title' => 'About IHO Clothing',
    'eyebrow' => 'Built for movement',
    'body' => 'IHO Clothing creates premium sportswear and everyday essentials with a focus on fit, comfort, inventory reliability, and local fulfillment.',
]))->name('about');

Route::get('/faq', fn () => Inertia::render('StaticPage', [
    'title' => 'Frequently Asked Questions',
    'eyebrow' => 'Support',
    'body' => 'Find answers about orders, payments, shipping, returns, account access, and franchise opportunities.',
]))->name('faq');

Route::get('/shipping', fn () => Inertia::render('StaticPage', [
    'title' => 'Shipping & Returns',
    'eyebrow' => 'Delivery care',
    'body' => 'Orders are routed through available master or franchise stock. Standard delivery usually takes 3 to 5 business days after confirmation.',
]))->name('shipping');

Route::get('/category/{slug}', function (string $slug) {
    return redirect()->route('shop', ['category' => $slug]);
})->name('category.show');

// Wishlist Route (Requires user to be logged in usually, but we will make it render for now)
Route::middleware(['auth'])->group(function () {
    Route::get('/account/wishlist', function () {
        return Inertia::render('Wishlist');
    })->name('wishlist');
});

// Single Product Page Route
Route::get('/product/{id}', function ($id) {
    $product = Product::with(['category', 'skus.inventory', 'images' => fn ($q) => $q->orderByDesc('is_primary')])
        ->where('is_active', true)
        ->findOrFail($id);

    return Inertia::render('Product', [
        'product' => $product,
    ]);
})->name('product.show');

// Shop / Catalog Route
Route::get('/shop', function (\Illuminate\Http\Request $request) {
    $filters = $request->validate([
        'category' => ['nullable', 'string'],
        'search' => ['nullable', 'string', 'max:255'],
        'sort' => ['nullable', 'string'],
    ]);

    $products = Product::query()
        ->with(['category', 'skus.inventory', 'images' => fn ($q) => $q->orderByDesc('is_primary')])
        ->where('is_active', true)
        ->when(($filters['category'] ?? null), fn ($q, $slug) => $q->whereHas('category', fn ($cq) => $cq->where('slug', $slug)))
        ->when(($filters['search'] ?? null), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
        ->when(($filters['sort'] ?? null) === 'price_asc', fn ($q) => $q->orderBy('base_price'))
        ->when(($filters['sort'] ?? null) === 'price_desc', fn ($q) => $q->orderByDesc('base_price'))
        ->latest()
        ->paginate(12)
        ->withQueryString();

    return Inertia::render('Shop', [
        'filters' => $filters,
        'products' => $products,
        'categories' => Category::where('is_active', true)->orderBy('name')->get(),
    ]);
})->name('shop');

Route::get('/franchise-apply', function () {
    if (!Auth::check()) {
        return redirect()->route('login')->with('error', 'Please sign in to apply for a franchise.');
    }

    return redirect()->route('account.franchise-apply');
})->name('franchise-apply');

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

    Route::post('/login', function (Request $request) {
        $creds = $request->validate(['email' => 'required|email', 'password' => 'required']);
        
        if (!Auth::attempt($creds)) {
            return back()->withErrors(['email' => 'Invalid credentials.']);
        }
        
        $request->session()->regenerate();
        $role = strtolower(trim(Auth::user()->role ?? 'customer'));
        
        if ($role === 'super_admin') {
            return redirect('/franchise-superadmin');
        } elseif (in_array($role, ['admin', 'franchise', 'franchise_admin'])) {
            return redirect('/franchise-admin');
        } else {
            return redirect('/');
        }
    })->middleware('throttle:5,1')->name('login.store');
});

/*
|--------------------------------------------------------------------------
| 👤 SECURE SECTORS (Consumer, Franchise, SuperAdmin)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth'])->group(function () {
    
    // 🚪 Logout
    Route::post('/logout', function (Request $request) {
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
            'orders'       => Order::where('customer_email', Auth::user()->email)->latest()->get(),
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
    Route::get('/franchise', fn () => redirect('/franchise-admin'));
    Route::get('/franchise/{path}', fn (string $path) => redirect('/franchise-admin/' . $path))->where('path', '.*');


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
        
        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])
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
        
        Route::patch('/franchise-applications/{application}', [UserFranchiseController::class, 'updateStatus'])
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

    // 4. Franchises (Approved network)
    // 5. Franchise Requests (New applications)
    Route::get('/franchise-requests', [FranchiseApplicationController::class, 'index'])->name('admin.franchise_requests');
    
// 🚀 PRODUCT ROUTES 
    Route::get('/products', [AdminProductController::class, 'index'])->name('admin.products.index');
    Route::get('/products/create', [AdminProductController::class, 'create'])->name('admin.products.create');
    Route::post('/products', [AdminProductController::class, 'store'])->name('admin.products.store');


    // 🚀 CATEGORY ROUTES
Route::get('/categories', [App\Http\Controllers\AdminCategoryController::class, 'index'])->name('admin.categories');
Route::post('/categories', [App\Http\Controllers\AdminCategoryController::class, 'store']);
Route::post('/categories/{id}/toggle-status', [App\Http\Controllers\AdminCategoryController::class, 'toggleStatus']);

});});



    // ==========================================
    // 🏢 3. FRANCHISE SECTOR (URL: /franchise-admin)
    // ==========================================
    Route::prefix('franchise-admin')->group(function () {

        Route::get('/', [OrderController::class, 'dashboard'])->name('franchise.dashboard');
        Route::get('/my-customers', [OrderController::class, 'franchiseCustomers'])->name('franchise.customers');
        Route::get('/pos', [OrderController::class, 'pos'])->name('franchise.pos');
        Route::post('/pos/orders', [OrderController::class, 'storeOffline'])->name('franchise.pos.orders');
        Route::get('/settings', fn () => Inertia::render('Franchise/Settings'))->name('franchise.settings');
        Route::patch('/settings', [OrderController::class, 'storeSettings'])->name('franchise.settings.update');

        Route::get('/my-inventory', [InventoryController::class, 'index'])->name('franchise.inventory');
        Route::post('/inventory/update', [InventoryController::class, 'updateStock'])->name('franchise.inventory.update');

        Route::get('/buy-stock', [ProductController::class, 'franchiseCatalog'])->name('franchise.buy-stock');
        Route::post('/stock-requests', [StockController::class, 'store'])->name('franchise.stock-requests.store');
        Route::get('/my-stock-requests', [StockController::class, 'myRequests'])->name('franchise.stock-requests.history');

        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])
            ->name('franchise.orders.status')->whereNumber('id');

        Route::get('/my-wallet', function() {
            return Inertia::render('Franchise/Wallet', [
                'stats' => DB::table('wallets')->where('franchise_id', Auth::id())->first() ?? 
                           ['balance' => 0, 'total_earned' => 0, 'pending_dues' => 0]
            ]);
        })->name('franchise.wallet');

    });

}); // <-- Closes the main Auth Middleware
