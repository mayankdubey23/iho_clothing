<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Inventory;
use App\Models\FranchisePincode;
use App\Models\Sku;
use App\Models\Coupon;
use App\Models\User;           // ✅ FIX: Missing Import Added
use App\Models\UserFranchise;
use App\Http\Requests\CheckoutOrderRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\StockTransaction;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderInvoiceMail;
use Razorpay\Api\Api;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * 🛒 THE SMART CHECKOUT ENGINE (With Razorpay Integration)
     */
    public function store(CheckoutOrderRequest $request)
    {
        $validatedData = $request->validated();

        try {
            DB::beginTransaction();

            $orderItems = [];
            $subtotal = 0;

            foreach ($validatedData['items'] as $item) {
                $sku = Sku::with('product')
                    ->where('id', $item['sku_id'])
                    ->where('product_id', $item['product_id'])
                    ->first();

                if (!$sku || !$sku->product || !$sku->product->is_active) {
                    throw new \Exception('One of the selected products is no longer available.');
                }

                $unitPrice = (float) $sku->product->base_price;
                $lineTotal = $unitPrice * (int) $item['quantity'];
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'product_id' => $sku->product_id,
                    'sku_id' => $sku->id,
                    'quantity' => (int) $item['quantity'],
                    'price' => $unitPrice,
                ];
            }

            $couponCode = $validatedData['coupon_code'] ?? null;
            $discountAmount = 0;

            if ($couponCode) {
                $coupon = Coupon::where('code', strtoupper($couponCode))->first();

                if (!$coupon || !$coupon->is_active) {
                    throw new \Exception('Invalid or inactive coupon code.');
                }

                if ($coupon->expires_at && Carbon::now()->greaterThan($coupon->expires_at)) {
                    throw new \Exception('This coupon has expired.');
                }

                if ($subtotal < (float) $coupon->min_cart_amount) {
                    throw new \Exception("Minimum order amount should be ₹{$coupon->min_cart_amount} to apply this coupon.");
                }

                $discountAmount = $coupon->type === 'percent'
                    ? ($subtotal * (float) $coupon->value) / 100
                    : (float) $coupon->value;

                $discountAmount = min($discountAmount, $subtotal);
            }

            $totalAmount = round($subtotal - $discountAmount, 2);

            // Routing Logic: Pincode ke basis par Franchise dhundhein
            $franchisePincode = FranchisePincode::where('pincode', $validatedData['pincode'])->first();
            $targetFranchiseId = $franchisePincode ? $franchisePincode->franchise_id : null;

            $finalFulfillerId = null;
            if ($targetFranchiseId && $this->canFulfillItems($orderItems, $targetFranchiseId)) {
                $finalFulfillerId = $targetFranchiseId;
            } elseif (!$this->canFulfillItems($orderItems, null)) {
                throw new \Exception('Sorry! This item is currently out of stock everywhere.');
            }

            // Payment method: 'cod' skips Razorpay, 'online' creates Razorpay order
            $paymentMethod = $validatedData['payment_method'] ?? 'online';
            $razorpayOrderId = null;

            if ($paymentMethod === 'online') {
                $api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));
                $razorpayOrder = $api->order->create([
                    'receipt' => 'rcpt_' . time(),
                    'amount' => $totalAmount * 100,
                    'currency' => 'INR',
                ]);
                $razorpayOrderId = $razorpayOrder['id'];
            }

            $shippingAddress = collect([
                $validatedData['house_flat_building'],
                $validatedData['street_area_locality'],
                $validatedData['landmark'] ?? null,
                $validatedData['city'],
                $validatedData['state'],
                $validatedData['pincode'],
                $validatedData['country'],
            ])->filter()->implode(', ');

            // DB Order Creation: Database mein order save karein
            $order = Order::create([
                'full_name' => $validatedData['full_name'],
                'mobile_number' => $validatedData['mobile_number'],
                'email' => $validatedData['email'],
                'alternate_mobile_number' => $validatedData['alternate_mobile_number'] ?? null,
                'house_flat_building' => $validatedData['house_flat_building'],
                'street_area_locality' => $validatedData['street_area_locality'],
                'landmark' => $validatedData['landmark'] ?? null,
                'city' => $validatedData['city'],
                'state' => $validatedData['state'],
                'pincode' => $validatedData['pincode'],
                'country' => $validatedData['country'],
                'customer_name' => $validatedData['full_name'],
                'customer_phone' => $validatedData['mobile_number'],
                'customer_email' => $validatedData['email'],
                'shipping_address' => $shippingAddress,
                'total_amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'status' => $paymentMethod === 'cod' ? 'confirmed' : 'pending',
                'payment_status' => 'pending',
                'franchise_id' => $finalFulfillerId,
                'razorpay_order_id' => $razorpayOrderId,
            ]);

            // Order Items & Stock Update
            foreach ($orderItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'sku_id' => $item['sku_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);

                $inventoryQuery = Inventory::where('sku_id', $item['sku_id']);
                $finalFulfillerId
                    ? $inventoryQuery->where('franchise_id', $finalFulfillerId)
                    : $inventoryQuery->whereNull('franchise_id');

                $inventory = $inventoryQuery->lockForUpdate()->first();
                if (!$inventory || $inventory->stock_quantity < $item['quantity']) {
                    throw new \Exception('Sorry! This item is currently out of stock everywhere.');
                }

                $inventory->decrement('stock_quantity', $item['quantity']);
            }

            DB::commit();

            // COD orders: send invoice immediately (Razorpay orders send after payment verification)
            if ($paymentMethod === 'cod' && $order->customer_email) {
                try {
                    Mail::to($order->customer_email)->send(new OrderInvoiceMail($order));
                } catch (\Exception $mailError) {
                    Log::error('COD invoice mail failed for order #' . $order->id . ': ' . $mailError->getMessage());
                }
            }

            $responseData = [
                'status' => true,
                'success' => true,
                'message' => $paymentMethod === 'cod'
                    ? 'Order placed successfully! Pay on delivery.'
                    : 'Order placed successfully.',
                'order_id' => $order->id,
                'amount' => $totalAmount,
                'payment_method' => $paymentMethod,
            ];

            if ($paymentMethod === 'online') {
                $responseData['razorpay_order_id'] = $razorpayOrderId;
            }

            return response()->json($responseData);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'success' => false,
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * 🔄 STATUS UPDATE: Order life cycle management
     */
    private function canFulfillItems(array $items, ?int $franchiseId): bool
    {
        foreach ($items as $item) {
            $inventoryQuery = Inventory::where('sku_id', $item['sku_id']);
            $franchiseId
                ? $inventoryQuery->where('franchise_id', $franchiseId)
                : $inventoryQuery->whereNull('franchise_id');

            $stock = $inventoryQuery->value('stock_quantity') ?? 0;
            if ($stock < $item['quantity']) {
                return false;
            }
        }

        return true;
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
        'status' => 'required|in:pending,confirmed,packed,shipped,out_for_delivery,delivered,cancelled,returned,refunded'
        ]);

        $order = Order::findOrFail($id);
        $user = auth()->user();

        // Security check
        if ($user->role === 'franchise' && $order->franchise_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $oldStatus = $order->status;
        $newStatus = $request->status;

        // Agar CANCEL ho raha hai, toh stock restore karein
        if ($newStatus === 'cancelled' && $oldStatus !== 'cancelled') {
            foreach ($order->items as $item) {
                DB::table('inventories')
                    ->where('franchise_id', $order->franchise_id)
                    ->where('sku_id', $item->sku_id)
                    ->increment('stock_quantity', $item->quantity);
            }
        }

        $order->update(['status' => $newStatus]);
        return back()->with('success', "Order status updated to {$newStatus}!");
    }

    /**
     * 📊 ADMIN DASHBOARD DATA
     */
    public function dashboard(Request $request)
{
    $user = auth()->user();
    $role = $user->role;

    if ($role === 'super_admin') {
        // Superadmin: Global View
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_sales' => (float) Order::where('status', 'delivered')->sum('total_amount'),
                'total_orders' => Order::count(),
                'total_customers' => User::where('role', 'customer')->count(),
                'total_franchises' => User::where('role', 'franchise')->count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'low_stock' => Inventory::where('stock_quantity', '<', 10)->count(),
                'recent_orders' => Order::with('items')->latest()->take(10)->get(),
            ]
        ]);
    } else {
        // Franchise Admin: Scoped View
        return Inertia::render('Franchise/Dashboard', [
            'stats' => [
                'my_sales' => (float) Order::where('franchise_id', $user->id)->where('status', 'delivered')->sum('total_amount'),
                'my_orders' => Order::where('franchise_id', $user->id)->count(),
                'available_stock' => (int) Inventory::where('franchise_id', $user->id)->sum('stock_quantity'),
                'pending_fulfillment' => Order::where('franchise_id', $user->id)->whereIn('status', ['pending', 'confirmed'])->count(),
                'recent_orders' => Order::where('franchise_id', $user->id)->latest()->take(5)->get(),
            ]
        ]);
    }
    }

    /**
     * ✅ PAYMENT VERIFICATION: Razorpay signature check
     */
    public function verifyPayment(Request $request)
    {
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        $api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));

        try {
            $attributes = [
                'razorpay_order_id'   => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature'  => $request->razorpay_signature
            ];

            // Official signature verification
            $api->utility->verifyPaymentSignature($attributes);

            $order = Order::where('razorpay_order_id', $request->razorpay_order_id)->firstOrFail();
            $order->update([
                'payment_status'      => 'success',
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'status'              => 'confirmed' 
            ]);

            // Send invoice email after successful payment
            if ($order->customer_email) {
                try {
                    Mail::to($order->customer_email)->send(new OrderInvoiceMail($order));
                } catch (\Exception $mailError) {
                    Log::error('Online payment invoice mail failed for order #' . $order->id . ': ' . $mailError->getMessage());
                }
            }

            return response()->json(['status' => true, 'success' => true, 'message' => 'Payment verified & Order confirmed!'], 200);

        } catch (\Exception $e) {
            return response()->json(['status' => false, 'success' => false, 'message' => $e->getMessage(), 'error' => $e->getMessage()], 400);
        }
    }
}
