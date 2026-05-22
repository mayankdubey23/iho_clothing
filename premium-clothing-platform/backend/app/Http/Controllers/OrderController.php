<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\Sku;
use App\Models\User;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:100'],
            'mobile_number' => ['required', 'regex:/^[6-9][0-9]{9}$/'],
            'email' => ['nullable', 'email', 'max:150'],
            'alternate_mobile_number' => ['nullable', 'regex:/^[6-9][0-9]{9}$/'],
            'house_flat_building' => ['required', 'string', 'max:255'],
            'street_area_locality' => ['required', 'string', 'max:255'],
            'landmark' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'state' => ['required', 'string', 'max:100'],
            'pincode' => ['required', 'regex:/^[1-9][0-9]{5}$/'],
            'country' => ['required', 'string', 'max:100'],
            'payment_method' => ['required', 'in:cod,online'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.sku_id' => ['required', 'integer', 'exists:skus,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $order = DB::transaction(function () use ($request, $validated) {
            $subtotal = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                $sku = Sku::with(['product', 'inventory'])
                    ->whereKey($item['sku_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if ((int) $sku->product_id !== (int) $item['product_id']) {
                    abort(422, 'One cart item no longer matches the selected product.');
                }

                if (Schema::hasColumn('products', 'is_active') && ! ($sku->product->is_active ?? true)) {
                    abort(422, "{$sku->product->name} is no longer available.");
                }

                $availableStock = (int) optional($sku->inventory)->stock_quantity;
                if ($availableStock < (int) $item['quantity']) {
                    abort(422, "{$sku->product->name} has only {$availableStock} unit(s) available.");
                }

                $unitPrice = (float) ($sku->product->discount_price ?: $sku->product->base_price);
                $lineTotal = $unitPrice * (int) $item['quantity'];
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'product' => $sku->product,
                    'sku' => $sku,
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ];
            }

            $shipping = $subtotal > 5000 || $subtotal <= 0 ? 0 : 150;
            $taxes = round($subtotal * 0.05);
            $total = $subtotal + $shipping + $taxes;

            $address = collect([
                $validated['house_flat_building'],
                $validated['street_area_locality'],
                $validated['landmark'] ?? null,
                "{$validated['city']}, {$validated['state']} - {$validated['pincode']}",
                $validated['country'],
            ])->filter()->implode(', ');

            $orderData = [
                'full_name' => $validated['full_name'],
                'mobile_number' => $validated['mobile_number'],
                'alternate_mobile_number' => $validated['alternate_mobile_number'] ?? null,
                'email' => $validated['email'] ?? null,
                'customer_name' => $validated['full_name'],
                'customer_phone' => $validated['mobile_number'],
                'customer_email' => $validated['email'] ?? null,
                'house_flat_building' => $validated['house_flat_building'],
                'street_area_locality' => $validated['street_area_locality'],
                'landmark' => $validated['landmark'] ?? null,
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pincode' => $validated['pincode'],
                'country' => $validated['country'],
                'shipping_address' => $address,
                'total_amount' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => $validated['payment_method'] === 'cod' ? 'pending' : 'pending',
                'sales_channel' => 'online',
                'status' => 'pending',
                'fulfillment_type' => 'master',
            ];

            if (Schema::hasColumn('orders', 'user_id')) {
                $orderData['user_id'] = optional($request->user())->id;
            }

            if (Schema::hasColumn('orders', 'order_number')) {
                $orderData['order_number'] = 'IHO-' . now()->format('YmdHis') . '-' . random_int(100, 999);
            }

            $order = Order::create($orderData);

            foreach ($orderItems as $item) {
                $itemData = [
                    'product_id' => $item['product']->id,
                    'sku_id' => $item['sku']->id,
                    'quantity' => $item['quantity'],
                    'price' => $item['unit_price'],
                ];

                if (Schema::hasColumn('order_items', 'unit_price')) {
                    $itemData['unit_price'] = $item['unit_price'];
                }

                if (Schema::hasColumn('order_items', 'total_price')) {
                    $itemData['total_price'] = $item['line_total'];
                }

                $order->items()->create($itemData);
                $item['sku']->inventory()->decrement('stock_quantity', $item['quantity']);
            }

            return $order;
        });

        return response()->json([
            'success' => true,
            'message' => $validated['payment_method'] === 'cod'
                ? 'Your order has been placed successfully.'
                : 'Order created. Continue to secure payment.',
            'order_id' => $order->id,
            'payment_method' => $validated['payment_method'],
            'redirect_url' => $validated['payment_method'] === 'online'
                ? route('payment.page', ['order_id' => $order->id])
                : '/account?tab=orders&placed=1',
            'razorpay_order_id' => $order->razorpay_order_id,
        ]);
    }

    public function paymentPage(Request $request)
    {
        $order = Order::findOrFail($request->query('order_id'));

        return Inertia::render('Payment', [
            'order' => $order,
            'razorpay_key' => config('services.razorpay.key') ?? env('RAZORPAY_KEY_ID'),
        ]);
    }

    public function verifyPayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
            'razorpay_order_id' => ['nullable', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature' => ['nullable', 'string'],
        ]);

        $order = ! empty($validated['razorpay_order_id'])
            ? Order::where('razorpay_order_id', $validated['razorpay_order_id'])->first()
            : null;

        $order = $order ?: Order::find($validated['order_id'] ?? null);

        abort_unless($order, 404, 'Order not found.');

        $order->update([
            'razorpay_payment_id' => $validated['razorpay_payment_id'],
            'payment_status' => 'success',
            'status' => 'processing',
        ]);

        return response()->json([
            'status' => true,
            'redirect_url' => '/account?tab=orders&paid=1',
        ]);
    }

    public function dashboard(Request $request)
    {
        if ($request->is('franchise-admin*')) {
            return Inertia::render('Franchise/Dashboard');
        }

        $ordersQuery = Order::query();
        $activeOrdersQuery = Order::query()->whereNotIn('status', ['cancelled', 'returned', 'refunded']);

        $chartData = Order::query()
            ->selectRaw('DATE(created_at) as name, COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('name')
            ->get();

        $applicationsCount = Schema::hasTable('franchise_applications')
            ? DB::table('franchise_applications')->where('status', 'pending')->count()
            : 0;

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_revenue' => (float) (clone $activeOrdersQuery)->sum('total_amount'),
                'total_orders' => (clone $ordersQuery)->count(),
                'total_customers' => User::where('role', 'customer')->count(),
                'applications' => $applicationsCount,
                'pending_orders' => (clone $ordersQuery)->where('status', 'pending')->count(),
                'low_stock' => Inventory::whereNull('franchise_id')->where('stock_quantity', '<=', 10)->count(),
                'online_sales' => (float) (clone $activeOrdersQuery)
                    ->when(Schema::hasColumn('orders', 'sales_channel'), fn ($query) => $query->where('sales_channel', 'online'))
                    ->sum('total_amount'),
                'offline_sales' => (float) (clone $activeOrdersQuery)
                    ->when(Schema::hasColumn('orders', 'sales_channel'), fn ($query) => $query->where('sales_channel', 'offline'))
                    ->sum('total_amount'),
            ],
            'recent_orders' => Order::with('franchise:id,name')
                ->latest()
                ->take(8)
                ->get(),
            'chart_data' => $chartData,
        ]);
    }

    public function index(Request $request)
    {
        $relations = ['franchise:id,name,city,state'];

        if (Schema::hasColumn('orders', 'user_id')) {
            $relations[] = 'user:id,name,email';
        }

        $ordersQuery = Order::with($relations);

        // Search
        $ordersQuery->when($request->search, function ($q, $search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('id', 'like', "%{$search}%")
                    ->orWhere('razorpay_order_id', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('pincode', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%");
            });
        });

        // Status
        $ordersQuery->when($request->status, fn ($q, $status) => $q->where('status', $status));

        // Franchise filter
        $ordersQuery->when($request->franchise_id, function ($q, $franchise_id) {
            if ($franchise_id === 'master') {
                $q->where(function ($sub) {
                    $sub->whereNull('franchise_id')
                        ->orWhere('fulfillment_type', 'master');
                });
            } else {
                $q->where('franchise_id', $franchise_id);
            }
        });

        // City/state filters
        $ordersQuery->when($request->city, fn ($q, $city) => $q->where('city', 'like', "%{$city}%"));
        $ordersQuery->when($request->state, fn ($q, $state) => $q->where('state', 'like', "%{$state}%"));

        // Customer filter
        $ordersQuery->when($request->customer_id, function ($q, $customer_id) {
            $q->where(function ($sub) use ($customer_id) {
                if (Schema::hasColumn('orders', 'user_id')) {
                    $sub->where('user_id', $customer_id);
                }

                $sub->orWhere('customer_email', function ($x) use ($customer_id) {
                    $x->select('email')->from('users')->where('id', $customer_id);
                });
            });
        });

        $orders = $ordersQuery->latest()->paginate(15)->withQueryString();

        $franchises = User::where('role', 'franchise')->select('id', 'name', 'city', 'state')->get();

        $stats = [
            'total' => (clone $ordersQuery)->count(),
            'pending' => (clone $ordersQuery)->where('status', 'pending')->count(),
            'shipped' => (clone $ordersQuery)->whereIn('status', ['shipped', 'out_for_delivery'])->count(),
            'returned' => (clone $ordersQuery)->whereIn('status', ['returned', 'refunded'])->count(),
        ];

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
            'franchises' => $franchises,
            'filters' => $request->only(['search', 'status', 'franchise_id', 'city', 'state', 'customer_id']),
            'stats' => $stats,
        ]);
    }


    // 🚀 Manual Reassign Logic (Super Admin Tool)
    public function reassignOrder(Request $request, $id)
    {
        $request->validate([
            'franchise_id' => 'nullable|exists:users,id', // null means assigning to Master
        ]);

        $order = Order::findOrFail($id);
        $order->franchise_id = $request->franchise_id;
        $order->fulfillment_type = $request->franchise_id ? 'franchise' : 'master';
        $order->save();

        // Here you would also trigger: Send Notification to new Franchise
        
        return back()->with('success', 'Order reassigned successfully.');
    }

    // Update Order Status
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|string']);
        
        $order = Order::findOrFail($id);
        $order->status = $request->status;
        $order->save();

        // DB::table('order_status_logs')->insert([...]) logic comes here

        return back()->with('success', 'Order status updated to ' . $request->status);
    }
}
