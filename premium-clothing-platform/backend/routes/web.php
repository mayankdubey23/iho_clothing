<?php

use App\Models\Category;
use App\Models\FranchisePlan;
use App\Models\Product;
use App\Models\StorefrontSetting;
use App\Models\User;
use App\Models\UserFranchise;
use App\Models\Order;

// Controllers
use App\Http\Controllers\AdminBannerController;
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
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminStockRequestController;
use App\Http\Controllers\AdminServiceAreaController;
use App\Http\Controllers\AdminPaymentController;
use App\Http\Controllers\AdminCouponController;
use App\Http\Controllers\AdminReturnController;
use App\Http\Controllers\AdminAnalyticsController;
use App\Http\Controllers\AdminContentController;
use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\AdminTicketController;
use App\Http\Controllers\AdminStaffController;
use App\Http\Controllers\AdminInvoiceController;
use App\Http\Controllers\AdminDeliveryController;
use App\Http\Controllers\AdminSettingController;
use App\Http\Controllers\AdminActivityLogController;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\Franchise\DashboardController as FranchiseDashboardController;
use App\Http\Controllers\Franchise\OrderController as FranchiseOrderController;
use App\Http\Controllers\Franchise\StockRequestController as FranchiseStockRequestController;
use App\Http\Controllers\Franchise\InventoryController as FranchiseInventoryController;
use App\Http\Controllers\Franchise\SupportController as FranchiseSupportController;
use App\Http\Controllers\Franchise\CatalogController as FranchiseCatalogController;
use App\Http\Controllers\Franchise\CustomerController as FranchiseCustomerController;
use App\Http\Controllers\Franchise\ReturnController as FranchiseReturnController;
use App\Http\Controllers\Franchise\WalletController as FranchiseWalletController;
use App\Http\Controllers\Franchise\AnalyticsController as FranchiseAnalyticsController;
use App\Http\Controllers\Franchise\ServiceAreaController as FranchiseServiceAreaController;
use App\Http\Controllers\Franchise\NotificationController as FranchiseNotificationController;
use App\Http\Controllers\Franchise\ProfileController as FranchiseProfileController;
use App\Http\Controllers\Franchise\ActivityLogController as FranchiseActivityLogController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| 🛍️ PUBLIC STOREFRONT ROUTES
|--------------------------------------------------------------------------
*/
Route::get('/', [StorefrontController::class, 'index'])->name('home');
Route::redirect('/product', '/shop')->name('product.index');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');
Route::post('/product/{product}/review', [StorefrontController::class, 'storeReview'])->name('reviews.store');

Route::get('/cart', fn () => Inertia::render('Cart'))->name('cart');
Route::get('/wishlist', fn () => Inertia::render('Wishlist'))->name('wishlist');
Route::get('/checkout', fn () => Inertia::render('Checkout'))->name('checkout');

// Static Pages
$staticPage = function (string $slug, array $fallback) {
    $page = Schema::hasTable('pages') ? DB::table('pages')->where('slug', $slug)->where('status', 'published')->first() : null;
    return Inertia::render('StaticPage', [
        'eyebrow' => $fallback['eyebrow'],
        'title' => $page->title ?? $fallback['title'],
        'body' => $page->content ?? $fallback['body'],
        'meta_title' => $page->meta_title ?? null,
        'meta_description' => $page->meta_description ?? null,
        'slug' => $slug,
    ]);
};

Route::get('/shipping', fn () => $staticPage('shipping', ['eyebrow' => 'Delivery', 'title' => 'Shipping Policy', 'body' => 'Orders are packed from active inventory...']))->name('shipping');
Route::get('/returns', fn () => $staticPage('returns', ['eyebrow' => 'Support', 'title' => 'Returns & Refunds', 'body' => 'Eligible unused products...']))->name('returns.public');
Route::get('/privacy-policy', fn () => $staticPage('privacy-policy', ['eyebrow' => 'Legal', 'title' => 'Privacy Policy', 'body' => 'We use customer information...']))->name('privacy');
Route::get('/terms', fn () => $staticPage('terms', ['eyebrow' => 'Legal', 'title' => 'Terms & Conditions', 'body' => 'By using IHO Studio...']))->name('terms');
Route::get('/cancellation', fn () => $staticPage('cancellation', ['eyebrow' => 'Orders', 'title' => 'Cancellation Policy', 'body' => 'Orders can be cancelled...']))->name('cancellation');
Route::get('/support', fn () => $staticPage('support', ['eyebrow' => 'Help', 'title' => 'Customer Support', 'body' => 'For order help...']))->name('support.public');
Route::get('/page/{slug}', fn (string $slug) => $staticPage($slug, ['eyebrow' => 'Info', 'title' => 'Information', 'body' => 'Loading...']))->name('pages.show');

// Shop & Collections
Route::get('/shop', [StorefrontController::class, 'shop'])->name('shop');
Route::redirect('/offers', '/')->name('offers');
Route::get('/sports-wear', [StorefrontController::class, 'sportsWear'])->name('sports-wear');
Route::redirect('/men', '/shop?gender=men')->name('men');
Route::redirect('/women', '/shop?gender=women')->name('women');
Route::redirect('/gym-wear', '/shop?category=gym-wear')->name('gym-wear');
Route::redirect('/running-wear', '/shop?category=running-wear')->name('running-wear');

Route::get('/category/{slug}', function (string $slug) {
    return match ($slug) {
        'men' => redirect()->route('shop', ['gender' => 'men']),
        'women' => redirect()->route('shop', ['gender' => 'women']),
        default => redirect()->route('shop', ['category' => $slug]),
    };
})->name('category.show');

Route::get('/{category_slug}', function (string $category_slug) {
    $categoryMap = ['men' => 'men', 'women' => 'women', 'gym-wear' => 'gym-wear', 'running-wear' => 'running-wear'];
    if (in_array($category_slug, ['men', 'women'])) return redirect()->route('shop', ['gender' => $categoryMap[$category_slug]]);
    return redirect()->route('shop', ['category' => $categoryMap[$category_slug] ?? $category_slug]);
})->where('category_slug', 'men|women|gym-wear|running-wear')->name('shop.category');

// Public Application
Route::get('/franchise-apply', function () {
    if (!Auth::check()) return redirect()->route('login')->with('error', 'Please sign in to apply.');
    return redirect()->route('account.franchise-apply');
})->name('franchise-apply');
Route::redirect('/franchise-enquiry', '/franchise/apply')->name('franchise.enquiry');
Route::get('/franchise/apply', [FranchiseApplicationController::class, 'create'])->name('franchise.apply.public');
Route::post('/franchise/apply', [FranchiseApplicationController::class, 'store']);

// Rate Limiting
Route::middleware('throttle:10,1')->group(function() {
    Route::get('/payment', [OrderController::class, 'paymentPage'])->name('payment.page');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/payment/verify', [OrderController::class, 'verifyPayment'])->name('payment.verify');
    Route::post('/coupons/apply', [CouponController::class, 'apply'])->name('coupons.apply');
});

/*
|--------------------------------------------------------------------------
| 🔒 GUEST AUTHENTICATION
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', fn () => Inertia::render('Auth/Login'))->name('login');
    Route::get('/register', fn () => Inertia::render('Auth/Register'))->name('register.view');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store'); 
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:5,1')->name('login.store');
    Route::post('/login/mobile-otp', [AuthController::class, 'requestMobileOtp'])->middleware('throttle:5,1')->name('login.mobile-otp');
    Route::post('/login/mobile-otp/verify', [AuthController::class, 'verifyMobileLogin'])->middleware('throttle:5,1')->name('login.mobile-otp.verify');
    Route::get('/auth/google/status', [AuthController::class, 'googleStatus'])->name('auth.google.status');
    Route::get('/auth/google', fn () => redirect()->route('login')->with('error', 'Google login is not configured yet.'))->name('auth.google');
});

/*
|--------------------------------------------------------------------------
| 👤 SECURE SECTORS (Auth Required)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    
    // 🚪 Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // ==========================================
    // 🛒 1. CONSUMER SECTOR
    // ==========================================
    Route::prefix('account')->group(function () {
        Route::get('/', [AccountController::class, 'index'])->name('account');
        Route::patch('/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
        Route::get('/franchise-apply', fn () => Inertia::render('FranchiseApply', ['plans' => FranchisePlan::orderBy('price')->get()]))->name('account.franchise-apply');
        Route::post('/franchise-apply', [UserFranchiseController::class, 'store'])->name('account.franchise-apply.store')->middleware('throttle:3,1');
    });

    Route::put('/user/profile-information', [AccountController::class, 'updateProfile']);
    Route::put('/user/password', [AccountController::class, 'updatePassword']);
    Route::post('/user/addresses', [AccountController::class, 'storeAddress']);
    Route::post('/user/support-tickets', [AccountController::class, 'storeTicket']);
    Route::delete('/user/account', [AccountController::class, 'destroyAccount']);
    Route::post('/user/settings/notifications', [AccountController::class, 'updateNotifications']);
    Route::get('/user/data/download', [AccountController::class, 'downloadData']);
    Route::delete('/user/payment-methods/{id}', [AccountController::class, 'removePaymentMethod']);

    // Admin Redirects
    Route::get('/admin', fn () => redirect('/franchise-superadmin'));
    Route::get('/admin/{path}', fn (string $path) => redirect('/franchise-superadmin/' . $path))->where('path', '.*');

    // ==========================================
    // 👑 2. SUPER ADMIN SECTOR 
    // ==========================================
    Route::middleware(['super_admin'])->prefix('franchise-superadmin')->group(function () {
        
        // Dashboards
        Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard.base');
        Route::get('/command-center', [AdminDashboardController::class, 'index'])->name('admin.command-center');
        
        // 🚀 DYNAMIC BANNERS
        Route::get('/banners', [AdminBannerController::class, 'index'])->name('admin.banners.index');
        Route::post('/banners', [AdminBannerController::class, 'store'])->name('admin.banners.store');
        Route::post('/banners/{banner}/toggle', [AdminBannerController::class, 'toggleStatus'])->name('admin.banners.toggle');
        Route::delete('/banners/{banner}', [AdminBannerController::class, 'destroy'])->name('admin.banners.destroy');

        // Products & Categories
        Route::get('/products', [AdminProductController::class, 'index'])->name('admin.products.index');
        Route::get('/products/create', [AdminProductController::class, 'create'])->name('admin.products.create');
        Route::post('/products', [AdminProductController::class, 'store'])->name('admin.products.store');
        Route::get('/products/{product}/edit', [AdminProductController::class, 'edit'])->name('admin.products.edit');
        Route::put('/products/{product}', [AdminProductController::class, 'update'])->name('admin.products.update');
        Route::post('/products/{id}/toggle-status', [AdminProductController::class, 'toggleStatus']);
        
        // ✅ CORRECTED CATEGORY ROUTES
        Route::get('/categories', [AdminCategoryController::class, 'index'])->name('admin.categories');
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);        
        Route::post('/categories/sync-defaults', [AdminCategoryController::class, 'syncDefaults']);
        Route::post('/categories/{id}/toggle-status', [AdminCategoryController::class, 'toggleStatus']);

        // Orders & Inventory
        Route::get('/orders', [OrderController::class, 'index'])->name('admin.orders');
        Route::match(['put', 'patch'], '/orders/{id}/status', [OrderController::class, 'updateStatus'])->name('admin.orders.status');
        Route::post('/orders/{id}/reassign', [OrderController::class, 'reassignOrder']);
        
        Route::redirect('/MasterStock', '/franchise-superadmin/master-stock');
        Route::get('/master-stock', [InventoryController::class, 'index'])->name('admin.inventory.index');
        Route::post('/inventory/add', [AdminInventoryController::class, 'addMasterStock']);
        Route::get('/inventory/history', [AdminInventoryController::class, 'stockHistory']);
        Route::put('/master-stock/{id}/adjust', [InventoryController::class, 'adjustStock']);
        Route::post('/master-stock/{id}/transfer', [InventoryController::class, 'transferStock']);

        // 🚀 CRM & FRANCHISES (Corrected Order!)
        Route::get('/customers', [CustomerController::class, 'index'])->name('admin.customers');
        Route::get('/customers/export', [CustomerController::class, 'export'])->name('admin.customers.export'); // MUST BE ABOVE {id}
        Route::get('/customers/{id}', [CustomerController::class, 'show'])->name('admin.customers.show'); // MOVED DOWN
        Route::post('/customers/{id}/toggle-status', [CustomerController::class, 'toggleStatus']);
        
        Route::get('/franchises', [UserFranchiseController::class, 'index'])->name('admin.franchises');
        Route::post('/franchises', [UserFranchiseController::class, 'store']);
        Route::post('/franchises/{id}/toggle-status', [UserFranchiseController::class, 'toggleStatus']);
        Route::get('/franchises/{id}', [UserFranchiseController::class, 'show']);
        
        Route::get('/franchise-requests', [FranchiseApplicationController::class, 'index'])->name('admin.franchise_requests');
        Route::patch('/franchise-applications/{application}', [FranchiseApplicationController::class, 'updateStatus']);

        // Stock Requests
        Route::get('/stock-requests', [AdminStockRequestController::class, 'index'])->name('admin.stock-requests');
        Route::post('/stock-requests/{id}/status', [AdminStockRequestController::class, 'updateStatus'])->name('admin.stock-requests.status');
        Route::patch('/stock-requests/{id}/approve', [StockController::class, 'approve']);

        // Marketing & Content
        Route::get('/coupons', [AdminCouponController::class, 'index'])->name('admin.coupons');
        Route::post('/coupons', [AdminCouponController::class, 'store']);
        Route::post('/coupons/{id}/toggle-status', [AdminCouponController::class, 'toggleStatus']);
        Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy']);
        Route::post('/offers', [AdminCouponController::class, 'storeOffer'])->name('superadmin.offers.store');
        Route::put('/offers/{id}', [AdminCouponController::class, 'updateOffer'])->name('superadmin.offers.update');
        Route::delete('/offers/{id}', [AdminCouponController::class, 'destroyOffer'])->name('superadmin.offers.destroy');
        
        Route::get('/content', [AdminContentController::class, 'index'])->name('admin.content');
        Route::post('/content/settings', [AdminContentController::class, 'updateSettings']);
        Route::post('/content/pages', [AdminContentController::class, 'storePage']);
        Route::put('/content/pages/{id}', [AdminContentController::class, 'updatePage']);
        Route::delete('/content/pages/{id}', [AdminContentController::class, 'destroyPage']);
        
        // 🚀 TESTIMONIALS CRUD ROUTES
        Route::post('/content/testimonials', [AdminContentController::class, 'storeTestimonial']);
        Route::put('/content/testimonials/{id}', [AdminContentController::class, 'updateTestimonial']);
        Route::delete('/content/testimonials/{id}', [AdminContentController::class, 'destroyTestimonial']);
        
        // 🚀 TOGGLE STATUS FOR CMS ITEMS
        Route::post('/content/toggle-status', [AdminContentController::class, 'toggleStatus']);
        
        // 🚀 SHOP PAGE & GYM WEAR SETTINGS
        Route::post('/content/shop-page', [AdminContentController::class, 'updateSettings']);
        Route::post('/content/gym-wear', [AdminContentController::class, 'updateSettings']);
        
        // 🚀 FEATURED CATEGORIES ROUTES
        Route::post('/content/featured-categories', [AdminContentController::class, 'storeFeaturedCategory']);
        Route::put('/content/featured-categories/{id}', [AdminContentController::class, 'updateFeaturedCategory']);
        Route::delete('/content/featured-categories/{id}', [AdminContentController::class, 'destroyFeaturedCategory']);
        Route::post('/content/featured-categories/{id}/toggle', [AdminContentController::class, 'toggleFeaturedCategory']);

        // 🚀 SERVICE AREAS ROUTES
        Route::get('/service-areas', [AdminServiceAreaController::class, 'index'])->name('admin.service_areas');
        Route::post('/service-areas', [AdminServiceAreaController::class, 'store']);
        Route::post('/service-areas/{id}/transfer', [AdminServiceAreaController::class, 'transfer']);
        Route::post('/service-areas/{id}/toggle-status', [AdminServiceAreaController::class, 'toggleStatus']);
        
         // System & Misc

        Route::get('/returns', [AdminReturnController::class, 'index'])->name('admin.returns');
        Route::get('/payments', [AdminPaymentController::class, 'index'])->name('admin.payments');
        Route::get('/analytics', [AdminAnalyticsController::class, 'index'])->name('admin.analytics');
        Route::get('/analytics/export', [AdminAnalyticsController::class, 'export'])->name('admin.analytics.export');
        Route::get('/notifications', [AdminNotificationController::class, 'index'])->name('admin.notifications');
        Route::get('/tickets', [AdminTicketController::class, 'index'])->name('admin.tickets');
        Route::get('/tickets/{id}', [AdminTicketController::class, 'show'])->name('admin.tickets.show');
        Route::post('/tickets/{id}/reply', [AdminTicketController::class, 'reply'])->name('admin.tickets.reply');
        Route::post('/tickets/{id}/status', [AdminTicketController::class, 'updateStatus'])->name('admin.tickets.status');
        Route::get('/staff', [AdminStaffController::class, 'index'])->name('admin.staff');
        Route::get('/invoices', [AdminInvoiceController::class, 'index'])->name('admin.invoices');
        Route::get('/delivery', [AdminDeliveryController::class, 'index'])->name('admin.delivery');
        Route::get('/settings', [AdminSettingController::class, 'index'])->name('admin.settings');
        Route::get('/activity-logs', [AdminActivityLogController::class, 'index'])->name('admin.activity_logs');
    });

    // ==========================================
    // 🏢 3. FRANCHISE ADMIN SECTOR
    // ==========================================
    // Kept this redirect for compatibility
    Route::prefix('franchise-admin')->group(function () {
        Route::get('/', [OrderController::class, 'dashboard'])->name('franchise.dashboard.legacy');
    });

    // Main Franchise Routes
    Route::middleware(['franchise'])->prefix('franchise')->group(function () {
        Route::get('/dashboard', [FranchiseDashboardController::class, 'index'])->name('franchise.dashboard');
        
        Route::get('/orders', [FranchiseOrderController::class, 'index'])->name('franchise.orders');
        Route::post('/orders/{id}/status', [FranchiseOrderController::class, 'updateStatus']);
        Route::post('/orders/{id}/tracking', [FranchiseOrderController::class, 'updateTracking']);
        
        Route::get('/stock-requests/new', [FranchiseStockRequestController::class, 'index'])->name('franchise.buy_stock');
        Route::post('/stock-requests', [FranchiseStockRequestController::class, 'store']);
        
        Route::get('/inventory', [FranchiseInventoryController::class, 'index'])->name('franchise.inventory');    
        Route::post('/inventory/{id}/damaged', [FranchiseInventoryController::class, 'markDamaged']);
        
        Route::get('/catalog', [FranchiseCatalogController::class, 'index'])->name('franchise.catalog');
        Route::get('/customers', [FranchiseCustomerController::class, 'index'])->name('franchise.customers');
        Route::get('/returns', [FranchiseReturnController::class, 'index'])->name('franchise.returns');
        Route::get('/wallet', [FranchiseWalletController::class, 'index'])->name('franchise.wallet');
        Route::get('/analytics', [FranchiseAnalyticsController::class, 'index'])->name('franchise.analytics');
        Route::get('/service-area', [FranchiseServiceAreaController::class, 'index'])->name('franchise.service_area');
        Route::get('/notifications', [FranchiseNotificationController::class, 'index'])->name('franchise.notifications');
        Route::get('/support', [FranchiseSupportController::class, 'index'])->name('franchise.support');
        Route::post('/support', [FranchiseSupportController::class, 'store']);
        Route::post('/support/{id}/reply', [FranchiseSupportController::class, 'reply']);
        Route::post('/support/{id}/close', [FranchiseSupportController::class, 'close']);
        Route::get('/profile', [FranchiseProfileController::class, 'index'])->name('franchise.profile');
        Route::post('/profile/general', [FranchiseProfileController::class, 'updateGeneral']);
        Route::get('/activity-logs', [FranchiseActivityLogController::class, 'index'])->name('franchise.logs');
    });

}); // <-- Closes the main Auth Middleware
