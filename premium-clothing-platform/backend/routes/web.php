<?php

use App\Models\Category;
use App\Models\FranchisePlan;
use App\Models\Product;
use App\Models\User;
use App\Models\UserFranchise;
use App\Models\Order;
use App\Http\Controllers\AdminInventoryController;
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

// Wishlist Route (Requires user to be logged in usually, but we will make it render for now)
Route::middleware(['auth'])->group(function () {
    Route::get('/account/wishlist', function () {
        return Inertia::render('Wishlist');
    })->name('wishlist');
});

// Single Product Page Route
Route::get('/product/{id}', function ($id) {
    // In the future, this will fetch the real product from the database:
    // $product = Product::with('images', 'skus')->findOrFail($id);
    
    return Inertia::render('Product', [
        'productId' => $id,
        // We pass null for now so the frontend uses our beautiful premium placeholders
        'product' => null 
    ]);
})->name('product.show');

// Shop / Catalog Route
Route::get('/shop', function (\Illuminate\Http\Request $request) {
    // In the future, you will query the Product model here and apply the filters
    return Inertia::render('Shop', [
        'filters' => $request->all(), // Passes search queries or filter categories to React
        'products' => null // We will use premium placeholders for now
    ]);
})->name('shop');

// User Account Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/account', function () {
        return Inertia::render('Account');
    })->name('account');
});

// Checkout Route
Route::get('/checkout', function () {
    return Inertia::render('Checkout');
})->name('checkout');

// 🛡️ SECURITY: Rate limiting added to prevent order/payment spam
Route::middleware('throttle:10,1')->group(function() {
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
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => 'customer',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended('/account')->with('success', 'Account created successfully.');
    })->name('register.store');

    Route::post('/login', function (Request $request) {
        $creds = $request->validate(['email' => 'required|email', 'password' => 'required']);
        
        if (!Auth::attempt($creds)) {
            return back()->withErrors(['email' => 'Invalid credentials.']);
        }
        
        $request->session()->regenerate();
        $role = strtolower(trim(Auth::user()->role ?? 'customer'));
        
        if (in_array($role, ['super_admin', 'admin'])) {
            return redirect()->intended('/admin');
        } elseif ($role === 'franchise') {
            return redirect()->intended('/franchise');
        } else {
            return redirect()->intended('/account');
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

        Route::get('/franchise-apply', fn () => Inertia::render('FranchiseApply', [
            'plans' => FranchisePlan::orderBy('price')->get()
        ]))->name('account.franchise-apply');
        
        Route::post('/franchise-apply', [UserFranchiseController::class, 'store'])
            ->name('account.franchise-apply.store')
            ->middleware('throttle:3,1');
    });


    // ==========================================
    // 👑 2. SUPER ADMIN SECTOR (URL: /admin)
    // ==========================================
    Route::prefix('admin')->group(function () {
        
        Route::get('/', [OrderController::class, 'dashboard'])->name('admin.dashboard');

        Route::get('/inventory', [AdminInventoryController::class, 'index'])->name('admin.inventory.index');
        Route::post('/inventory/add', [AdminInventoryController::class, 'addMasterStock'])->name('admin.inventory.add');
        Route::get('/inventory/franchise/{id}', [AdminInventoryController::class, 'viewFranchiseStock'])
            ->name('admin.inventory.franchise')->whereNumber('id');
        Route::get('/inventory/history', [AdminInventoryController::class, 'stockHistory'])->name('admin.inventory.history');
        
        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])
            ->name('admin.orders.status')->whereNumber('id');

        Route::get('/products', function () {
            return Inertia::render('Admin/Products', [
                'products'   => Product::query()->with(['category', 'skus.inventory'])->latest()->paginate(15),
                'categories' => Category::query()->orderBy('name')->get(),
            ]);
        })->name('admin.products');
        
        Route::post('/products', [ProductController::class, 'store'])->name('admin.products.store');
        Route::resource('categories', CategoryController::class);
        
        Route::get('/franchises', function () {
            return Inertia::render('Admin/Franchises', [
                'applications' => UserFranchise::query()->with(['user', 'franchisePlan'])->latest()->get(),
                'plans'        => FranchisePlan::query()->orderBy('price')->get(),
            ]);
        })->name('admin.franchises');
        
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


    // ==========================================
    // 🏢 3. FRANCHISE SECTOR (URL: /franchise)
    // ==========================================
    Route::prefix('franchise')->group(function () {

        Route::get('/', [OrderController::class, 'dashboard'])->name('franchise.dashboard');
        Route::get('/my-customers', [OrderController::class, 'franchiseCustomers'])->name('franchise.customers');

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