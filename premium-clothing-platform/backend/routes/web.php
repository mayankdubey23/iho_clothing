<?php

use App\Models\Category;
use App\Models\FranchisePlan;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\User;
use App\Models\UserFranchise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

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

        return redirect()->intended(Auth::user()->role === 'admin' ? '/admin' : '/account');
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

Route::middleware('auth')->prefix('admin')->group(function () {
    Route::get('/', function () {
        abort_unless(Auth::user()->role === 'admin', 403);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'products' => Product::query()->count(),
                'categories' => Category::query()->count(),
                'stock' => Inventory::query()->sum('stock_quantity'),
                'applications' => UserFranchise::query()->count(),
            ],
        ]);
    });

    Route::get('/products', function () {
        abort_unless(Auth::user()->role === 'admin', 403);

        return Inertia::render('Admin/Products', [
            'products' => Product::query()
                ->with(['category', 'skus.inventory', 'images' => fn ($query) => $query->orderByDesc('is_primary')->orderBy('sort_order')])
                ->latest()
                ->paginate(15),
            'categories' => Category::query()->orderBy('name')->get(),
        ]);
    });

    Route::post('/products', function (Request $request) {
        abort_unless(Auth::user()->role === 'admin', 403);

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

    Route::get('/categories', function () {
        abort_unless(Auth::user()->role === 'admin', 403);

        return Inertia::render('Admin/Categories', [
            'categories' => Category::query()->withCount('products')->latest()->get(),
        ]);
    });

    Route::post('/categories', function (Request $request) {
        abort_unless(Auth::user()->role === 'admin', 403);

        Category::create($request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug'],
            'is_active' => ['boolean'],
        ]));

        return back()->with('success', 'Category created successfully.');
    });

    Route::get('/franchises', function () {
        abort_unless(Auth::user()->role === 'admin', 403);

        return Inertia::render('Admin/Franchises', [
            'applications' => UserFranchise::query()->with(['user', 'franchisePlan'])->latest()->get(),
            'plans' => FranchisePlan::query()->orderBy('price')->get(),
        ]);
    });
});
