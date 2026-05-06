<?php

use App\Models\Category;
use App\Models\FranchisePlan;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\User;
use App\Models\UserFranchise;
use App\Models\Order;
use App\Models\Sku;
use App\Http\Controllers\OrderController; // Smart Checkout Controller
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

// ==========================================
// 🛍️ STOREFRONT & PRODUCTS
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
});

Route::get('/sports-wear', function () {
    $sportsCategorySlugs = [
        'premium-tshirts',
        'performance-bottoms',
        'compression-sets',
        'teamwear-jerseys',
        'training-accessories',
    ];

    return Inertia::render('SportsWear', [
        'products' => Product::query()
            ->with([
                'category',
                'skus.inventory',
                'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order'),
            ])
            ->where('is_active', true)
            ->whereHas('category', fn ($query) => $query->whereIn('slug', $sportsCategorySlugs))
            ->latest()
            ->get(),
        'categories' => Category::query()
            ->where('is_active', true)
            ->whereIn('slug', $sportsCategorySlugs)
            ->orderBy('name')
            ->get(),
        'plans' => FranchisePlan::query()->orderBy('price')->get(),
    ]);
});

// ==========================================
// 🛒 SMART CHECKOUT API (New)
// ==========================================
// Frontend se order form submit hone par yeh route trigger hoga
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');


// ==========================================
// 🔒 GUEST AUTH ROUTES
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

        // 🟢 NAYA LOGIC: Super Admin aur Franchise dono ko admin dashboard bhejenge
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
// 👤 CUSTOMER ACCOUNT ROUTES
// ==========================================
Route::middleware('auth')->group(function () {
    Route::post('/logout', function (Request $request) {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'You have been logged out.');
    });

    Route::get('/account', function () {
        return Inertia::render('Account', [
            'applications' => UserFranchise::query()
                ->with('franchisePlan')
                ->where('user_id', Auth::id())
                ->latest()
                ->get(),
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

        UserFranchise::create([
            ...$validated,
            'user_id' => $request->user()->id,
            'status' => 'pending',
        ]);

        return redirect('/account')->with('success', 'Franchise application submitted successfully.');
    });
});

// ==========================================
// 👑 SUPER ADMIN & 🏬 FRANCHISE DASHBOARD
// ==========================================
Route::middleware('auth')->prefix('admin')->group(function () {
    
    // 📊 SHARED DASHBOARD (Data roles ke hisaab se filter hoga)
    Route::get('/', function () {
        // Sirf super_admin ya franchise ko andar aane do
        abort_unless(in_array(Auth::user()->role, ['super_admin', 'franchise']), 403);

        $user = Auth::user();
        $ordersQuery = Order::query();

        // Agar franchise hai, toh sirf apna stock aur apni sales dekhega
        if ($user->role === 'franchise') {
            $ordersQuery->where('franchise_id', $user->id);
            $stockCount = Inventory::where('franchise_id', $user->id)->sum('stock_quantity');
        } else {
            // Super Admin ko overall details dikhengi
            $stockCount = Inventory::sum('stock_quantity');
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => Product::query()->count(),
                'categories' => Category::query()->count(),
                'stock' => $stockCount,
                'applications' => UserFranchise::query()->count(),
                // E-Commerce Sales Stats
                'total_revenue' => (clone $ordersQuery)->where('status', 'completed')->sum('total_amount'),
                'total_orders' => (clone $ordersQuery)->count(),
                'recent_orders' => (clone $ordersQuery)->latest()->take(5)->get(),
            ],
        ]);
    });

    // 👕 PRODUCTS (Only Super Admin can manage products)
    Route::get('/products', function () {
        abort_unless(Auth::user()->role === 'super_admin', 403);

        return Inertia::render('Admin/Products', [
            'products' => Product::query()
                ->with(['category', 'skus.inventory', 'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order')])
                ->latest()
                ->paginate(15),
            'categories' => Category::query()->orderBy('name')->get(),
        ]);
    });

    Route::post('/products', function (Request $request) {
        abort_unless(Auth::user()->role === 'super_admin', 403);

        Product::create($request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'category_id' => ['required', 'exists:categories,id'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'franchise_price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]));

        return back()->with('success', 'Product created successfully.');
    });

    // 📂 CATEGORIES (Only Super Admin can manage categories)
    Route::get('/categories', function () {
        abort_unless(Auth::user()->role === 'super_admin', 403);

        return Inertia::render('Admin/Categories', [
            'categories' => Category::query()->withCount('products')->latest()->get(),
        ]);
    });

    Route::post('/categories', function (Request $request) {
        abort_unless(Auth::user()->role === 'super_admin', 403);

        Category::create($request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug'],
            'is_active' => ['boolean'],
        ]));

        return back()->with('success', 'Category created successfully.');
    });

    // ✏️ UPDATE PRODUCT
    Route::patch('/products/{product}', function (Request $request, Product $product) {
        abort_unless(Auth::user()->role === 'super_admin', 403);

        $product->update($request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'slug'            => ['required', 'string', 'max:255', 'unique:products,slug,' . $product->id],
            'category_id'     => ['required', 'exists:categories,id'],
            'base_price'      => ['required', 'numeric', 'min:0'],
            'franchise_price' => ['required', 'numeric', 'min:0'],
            'description'     => ['nullable', 'string'],
            'is_active'       => ['boolean'],
        ]));

        return back()->with('success', 'Product updated successfully.');
    });

    // 📦 ADD SKU + INVENTORY TO PRODUCT
    Route::post('/products/{product}/skus', function (Request $request, Product $product) {
        abort_unless(Auth::user()->role === 'super_admin', 403);

        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'size'           => ['nullable', 'string', 'max:50'],
            'color'          => ['nullable', 'string', 'max:50'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        $sku = $product->skus()->create([
            'name'  => $validated['name'],
            'size'  => $validated['size']  ?? null,
            'color' => $validated['color'] ?? null,
        ]);

        $sku->inventory()->create(['stock_quantity' => $validated['stock_quantity']]);

        return back()->with('success', 'SKU added and stock set successfully.');
    });

    // 🔄 UPDATE SKU STOCK (legacy — kept for compat)
    Route::patch('/skus/{sku}/stock', function (Request $request, Sku $sku) {
        abort_unless(Auth::user()->role === 'super_admin', 403);
        $validated = $request->validate(['stock_quantity' => ['required', 'integer', 'min:0']]);
        $sku->inventory ? $sku->inventory->update($validated) : $sku->inventory()->create($validated);
        return back()->with('success', 'Stock updated successfully.');
    });

    // ✏️ FULL SKU UPDATE (name + size + color + stock)
    Route::patch('/skus/{sku}', function (Request $request, Sku $sku) {
        abort_unless(Auth::user()->role === 'super_admin', 403);

        $validated = $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'size'           => ['nullable', 'string', 'max:50'],
            'color'          => ['nullable', 'string', 'max:50'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        $sku->update([
            'name'  => $validated['name'],
            'size'  => $validated['size']  ?? null,
            'color' => $validated['color'] ?? null,
        ]);

        if ($sku->inventory) {
            $sku->inventory->update(['stock_quantity' => $validated['stock_quantity']]);
        } else {
            $sku->inventory()->create(['stock_quantity' => $validated['stock_quantity']]);
        }

        return back()->with('success', 'SKU updated successfully.');
    });

    // 🗑️ DELETE SKU
    Route::delete('/skus/{sku}', function (Sku $sku) {
        abort_unless(Auth::user()->role === 'super_admin', 403);
        $sku->inventory()->delete();
        $sku->delete();
        return back()->with('success', 'SKU deleted successfully.');
    });

    // 🗑️ DELETE CATEGORY
    Route::delete('/categories/{category}', function (Category $category) {
        abort_unless(Auth::user()->role === 'super_admin', 403);
        $category->delete();
        return back()->with('success', 'Category deleted successfully.');
    });

    // ✏️ UPDATE CATEGORY
    Route::patch('/categories/{category}', function (Request $request, Category $category) {
        abort_unless(Auth::user()->role === 'super_admin', 403);

        $category->update($request->validate([
            'name'      => ['required', 'string', 'max:255', 'unique:categories,name,' . $category->id],
            'slug'      => ['required', 'string', 'max:255', 'unique:categories,slug,' . $category->id],
            'is_active' => ['boolean'],
        ]));

        return back()->with('success', 'Category updated successfully.');
    });

    // 🏢 FRANCHISES MANAGEMENT (Only Super Admin can see applications)
    Route::get('/franchises', function () {
        abort_unless(Auth::user()->role === 'super_admin', 403);

        return Inertia::render('Admin/Franchises', [
            'applications' => UserFranchise::query()->with(['user', 'franchisePlan'])->latest()->get(),
            'plans' => FranchisePlan::query()->orderBy('price')->get(),
        ]);
    });
});