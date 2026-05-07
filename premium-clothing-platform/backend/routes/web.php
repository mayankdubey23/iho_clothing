<?php

use App\Models\Category;
use App\Models\FranchisePlan;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\User;
use App\Models\UserFranchise;
use App\Models\Order; // Naya Order Model add kiya hai
use App\Http\Controllers\OrderController; // Smart Checkout Controller
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rules\Password;
use App\Http\Controllers\ProductController;
use Inertia\Inertia;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\CouponController;


// ==========================================
// 🛍️ STOREFRONT & PRODUCTS (Public)
// ==========================================
Route::get('/', function (Request $request) {
    $filters = $request->validate([
        'category' => ['nullable', 'string'],
        'search' => ['nullable', 'string', 'max:255'],
        'min_price' => ['nullable', 'numeric', 'min:0'],
        'max_price' => ['nullable', 'numeric', 'min:0'],
    ]);

    $products = Product::query()
        ->with([
            'category',
            'skus.inventory',
            'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
        ])
        ->where('is_active', true)
        ->when(($filters['category'] ?? 'all') !== 'all' && ($filters['category'] ?? null), function ($query) use ($filters) {
            $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $filters['category']));
        })
        ->when($filters['search'] ?? null, function ($query, $search) {
            $query->where(fn ($searchQuery) => $searchQuery
                ->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        })
        ->when($filters['min_price'] ?? null, fn ($query, $price) => $query->where('base_price', '>=', $price))
        ->when($filters['max_price'] ?? null, fn ($query, $price) => $query->where('base_price', '<=', $price))
        ->latest()
        ->paginate(12)
        ->withQueryString();

    return Inertia::render('Storefront', [
        'products' => $products,
        'categories' => Category::query()->where('is_active', true)->orderBy('name')->get(),
        'plans' => FranchisePlan::query()->orderBy('price')->get(),
        'filters' => [
            'category' => $filters['category'] ?? 'all',
            'search' => $filters['search'] ?? '',
            'min_price' => $filters['min_price'] ?? '',
            'max_price' => $filters['max_price'] ?? '',
        ],
    ]);
})->name('home');

// Sports Wear Special Page
Route::get('/sports-wear', function () {
    $sportsCategorySlugs = ['premium-tshirts', 'performance-bottoms', 'compression-sets', 'teamwear-jerseys', 'training-accessories'];

    return Inertia::render('SportsWear', [
        'products' => Product::query()
            ->with(['category', 'skus.inventory', 'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order')])
            ->where('is_active', true)
            ->whereHas('category', fn ($query) => $query->whereIn('slug', $sportsCategorySlugs))
            ->latest()
            ->get(),
        'categories' => Category::query()->where('is_active', true)->whereIn('slug', $sportsCategorySlugs)->orderBy('name')->get(),
        'plans' => FranchisePlan::query()->orderBy('price')->get(),
    ]);
});

// ==========================================
// 🛒 SMART CHECKOUT ENGINE
// ==========================================
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
Route::post('/payment/verify', [OrderController::class, 'verifyPayment'])->name('payment.verify');

// 🎁 COUPON API
Route::post('/coupons/apply', [CouponController::class, 'apply'])->name('coupons.apply');


// ==========================================
// 🔒 AUTHENTICATION (Guest)
// ==========================================
Route::middleware('guest')->group(function () {
    Route::get('/login', fn () => Inertia::render('Auth/Login'))->name('login');
    Route::get('/register', fn () => Inertia::render('Auth/Register'));

    Route::post('/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials)) {
            return back()->withErrors(['email' => 'The provided credentials are incorrect.'])->onlyInput('email');
        }

        $request->session()->regenerate();
        $role = Auth::user()->role;
        return redirect()->intended(in_array($role, ['super_admin', 'franchise']) ? '/admin' : '/account');
    });

    Route::post('/register', function (Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
        ]);

        Auth::login($user);
        $request->session()->regenerate();
        return redirect('/account')->with('success', 'Account created successfully.');
    });
});

// ==========================================
// 👤 USER / CUSTOMER ROUTES (Auth)
// ==========================================
Route::middleware('auth')->group(function () {
    Route::post('/logout', function (Request $request) {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/')->with('success', 'Logged out safely.');
    });

    Route::get('/account', function () {
        return Inertia::render('Account', [
            'applications' => UserFranchise::query()->with('franchisePlan')->where('user_id', Auth::id())->latest()->get(),
        ]);
    });

    Route::get('/franchise-apply', function () {
        return Inertia::render('FranchiseApply', [
            'plans' => FranchisePlan::query()->orderBy('price')->get(),
        ]);
    });

    Route::post('/franchise-applications', function (Request $request) {
        $validated = $request->validate([
            'franchise_plan_id' => ['required', 'exists:franchise_plans,id'],
            'business_name' => ['nullable', 'string', 'max:255'],
        ]);

        UserFranchise::create([...$validated, 'user_id' => Auth::id(), 'status' => 'pending']);
        return redirect('/account')->with('success', 'Application submitted.');
    });
});

// ==========================================
// 👑 ADMIN & FRANCHISE CONTROL PANEL
// ==========================================
Route::middleware(['auth'])->prefix('admin')->group(function () {
    
    // 📊 SHARED DASHBOARD
        Route::get('/', function () {
            $role = strtolower(trim(Auth::user()->role));
            abort_unless(in_array($role, ['super_admin', 'super_adin', 'franchise', 'admin']), 403);

        $user = Auth::user();
        $ordersQuery = Order::query();

        if ($user->role === 'franchise') {
            $ordersQuery->where('franchise_id', $user->id);
            $stockCount = Inventory::where('franchise_id', $user->id)->sum('stock_quantity');
        } else {
            $stockCount = Inventory::sum('stock_quantity');
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => Product::query()->count(),
                'categories' => Category::query()->count(),
                'stock' => (int) $stockCount,
                'applications' => UserFranchise::query()->count(),
                'total_revenue' => (float) (clone $ordersQuery)->where('status', 'delivered')->sum('total_amount'),
                'total_orders' => (clone $ordersQuery)->count(),
                'recent_orders' => (clone $ordersQuery)->with('items')->latest()->take(10)->get(),
                'chart_data' => (clone $ordersQuery)->selectRaw('DATE(created_at) as name, sum(total_amount) as revenue, count(*) as orders')->where('created_at', '>=', now()->subDays(7))->groupBy('name')->orderBy('name')->get(),
            ],
        ]);
    })->name('admin.dashboard');

    // 🔄 ORDER LIFECYCLE (PATCH)
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.status');


    // 🛡️ SUPER ADMIN ONLY SECTION (Fixed Error Here)
    Route::prefix('/')->group(function () {
        Route::get('/products', function () {
            abort_unless(in_array(Auth::user()->role, ['super_admin', 'super_adin', 'admin']), 403);
            return Inertia::render('Admin/Products', [
                'products' => Product::query()->with(['category', 'skus.inventory'])->latest()->paginate(15),
                'categories' => Category::query()->orderBy('name')->get(),
            ]);
        });

        // 🎁 COUPONS MANAGEMENT (Super Admin Only)
        Route::get('/coupons', [App\Http\Controllers\CouponController::class, 'index'])->name('admin.coupons');
        Route::post('/coupons', [App\Http\Controllers\CouponController::class, 'store']);
        Route::delete('/coupons/{coupon}', [App\Http\Controllers\CouponController::class, 'destroy']);

        // 📦 INVENTORY MANAGEMENT (Shared by Franchise & Super Admin)
        Route::post('/inventory/update', [InventoryController::class, 'updateStock'])->name('admin.inventory.update');

        Route::post('/products', [ProductController::class, 'store'])->name('admin.products.store');

        Route::get('/categories', function () {
            abort_unless(in_array(Auth::user()->role, ['super_admin', 'super_adin', 'admin']), 403);
            return Inertia::render('Admin/Categories', [
                'categories' => Category::query()->withCount('products')->latest()->get(),
            ]);
        });

        Route::post('/categories', function (Request $request) {
            $role = strtolower(trim(Auth::user()->role));
            abort_unless(in_array($role, ['super_admin', 'super_adin', 'admin']), 403);

            Category::create($request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
                'slug' => ['required', 'string', 'max:255', 'unique:categories,slug'],
                'is_active' => ['boolean'],
            ]));

            return back()->with('success', 'Category created successfully.');
        });

        // 🏢 FRANCHISES MANAGEMENT (Only Super Admin can see applications)
        Route::get('/franchises', function () {
            $role = strtolower(trim(Auth::user()->role));
            abort_unless(in_array($role, ['super_admin', 'super_adin', 'admin']), 403);

            return Inertia::render('Admin/Franchises', [
                'applications' => UserFranchise::query()->with(['user', 'franchisePlan'])->latest()->get(),
                'plans' => FranchisePlan::query()->orderBy('price')->get(),
            ]);
        });
    });
});
