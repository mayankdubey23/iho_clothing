<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Inventory;
use App\Models\FranchisePincode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderInvoiceMail;
use Razorpay\Api\Api; // Razorpay SDK import kiya

class OrderController extends Controller
{
    /**
     * 🛒 THE SMART CHECKOUT ENGINE (With Razorpay Integration)
     */
    public function store(Request $request)
    {
        // 1. Validation: Sabse pehle input check karein
        $validatedData = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email',
            'shipping_address' => 'required|string',
            'pincode' => 'required|string|max:10', 
            'total_amount' => 'required|numeric',
            'items' => 'required|array',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.sku_id' => 'required|integer|exists:skus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric'
        ]);

        try {
            DB::beginTransaction();

            // 2. Routing Logic: Pincode ke basis par Franchise dhundhein
            $franchisePincode = FranchisePincode::where('pincode', $validatedData['pincode'])->first();
            $targetFranchiseId = $franchisePincode ? $franchisePincode->franchise_id : null;

            $finalFulfillerId = $targetFranchiseId; 
            $canFranchiseFulfill = true;

            // 3. Stock Check: Franchise ke paas stock hai ya nahi?
            if ($targetFranchiseId) {
                foreach ($validatedData['items'] as $item) {
                    $franchiseStock = Inventory::where('franchise_id', $targetFranchiseId)
                        ->where('sku_id', $item['sku_id'])
                        ->value('stock_quantity') ?? 0;

                    if ($franchiseStock < $item['quantity']) {
                        $canFranchiseFulfill = false;
                        break; 
                    }
                }
            } else {
                $canFranchiseFulfill = false;
            }

            // 4. Fallback: Agar Franchise ke paas nahi hai toh Main Warehouse check karein
            if (!$canFranchiseFulfill) {
                $finalFulfillerId = null; 
                foreach ($validatedData['items'] as $item) {
                    $superAdminStock = Inventory::whereNull('franchise_id')
                        ->where('sku_id', $item['sku_id'])
                        ->value('stock_quantity') ?? 0;

                    if ($superAdminStock < $item['quantity']) {
                        throw new \Exception("Sorry! This item is currently out of stock everywhere.");
                    }
                }
            }

            // 5. Razorpay Order Creation: Payment Gateway ko batayein kitne ka order hai
            $api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));
            $razorpayOrder = $api->order->create([
                'receipt'         => 'rcpt_' . time(),
                'amount'          => $validatedData['total_amount'] * 100, // Amount in paise
                'currency'        => 'INR',
            ]);

            // 6. DB Order Creation: Database mein order save karein
            $order = Order::create([
                'customer_name'     => $validatedData['customer_name'],
                'customer_phone'    => $validatedData['customer_phone'],
                'customer_email'    => $validatedData['customer_email'] ?? null,
                'shipping_address'  => $validatedData['shipping_address'],
                'total_amount'      => $validatedData['total_amount'],
                'status'            => 'pending',
                'payment_status'    => 'pending',
                'franchise_id'      => $finalFulfillerId,
                'razorpay_order_id' => $razorpayOrder['id'], // Razorpay ID yahan save hogi
            ]);

            // 7. Order Items & Stock Update
            foreach ($validatedData['items'] as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['product_id'],
                    'sku_id'     => $item['sku_id'],
                    'quantity'   => $item['quantity'],
                    'price'      => $item['price']
                ]);

                DB::table('inventories')
                    ->where('franchise_id', $finalFulfillerId)
                    ->where('sku_id', $item['sku_id'])
                    ->decrement('stock_quantity', $item['quantity']);
            }

            DB::commit();

            // Frontend ko Razorpay ID bhej rahe hain taaki modal khul sake
            return response()->json([
                'success' => true,
                'razorpay_order_id' => $razorpayOrder['id'],
                'order_id' => $order->id,
                'amount' => $validatedData['total_amount']
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * 🔄 STATUS UPDATE: Order life cycle management
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,shipped,delivered,cancelled'
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
        $query = Order::query();

        if ($user && $user->role === 'franchise') {
            $query->where('franchise_id', $user->id);
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_revenue' => (clone $query)->where('status', 'delivered')->sum('total_amount'),
                'total_orders'  => (clone $query)->count(),
                'recent_orders' => (clone $query)->latest()->take(10)->get(),
                'stock'         => (int) Inventory::when($user->role === 'franchise', fn($q) => $q->where('franchise_id', $user->id))->sum('stock_quantity'),
            ]
        ]);
    }

    /**
     * ✅ PAYMENT VERIFICATION: Razorpay signature check
     */
    public function verifyPayment(Request $request)
    {
        $api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));

        try {
            $attributes = [
                'razorpay_order_id'   => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature'  => $request->razorpay_signature
            ];

            // Official signature verification
            $api->utility->verifyPaymentSignature($attributes);

            $order = Order::where('razorpay_order_id', $request->razorpay_order_id)->first();
            $order->update([
                'payment_status'      => 'success',
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'status'              => 'confirmed' 
            ]);

            // 📩 NEW LOGIC: Send Email Invoice automatically
            if ($order->customer_email) {
                Mail::to($order->customer_email)->send(new OrderInvoiceMail($order));
            }

            return response()->json(['success' => true, 'message' => 'Payment verified & Invoice sent!'], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 400);
        }
    }
}