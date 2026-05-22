<?php


namespace App\Http\Controllers\Franchise;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // Error tracking ke liye
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class StockRequestController extends Controller
{
    public function index()
    {
        $franchiseId = Auth::id(); // Ensure this matches your franchise auth logic
        $priceColumn = $this->productPriceColumn();

        $requests = DB::table('stock_requests')
            ->where('franchise_id', $franchiseId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        foreach ($requests as $req) {
            $req->items = DB::table('stock_request_items')
                ->join('products', 'stock_request_items.product_id', '=', 'products.id')
                ->where('stock_request_id', $req->id)
                // 🚀 ALIAS ADDED: 'products.name as product_name' taaki React frontend crash na ho
                ->select('stock_request_items.*', 'products.name as product_name', "products.{$priceColumn} as franchise_price")
                ->get();
        }

        // 🚀 OPTIMIZATION: Sirf 'Active' products hi catalog mein dikhayein
        $masterProducts = DB::table('products')
            ->where('is_active', 1) 
            ->select('id', 'name', 'image_path', DB::raw("{$priceColumn} as franchise_price"))
            ->get();

        return Inertia::render('Franchise/BuyStock', [
            'requests' => $requests,
            'masterProducts' => $masterProducts
        ]);
    }

    public function store(Request $request)
    {
        // Validation update: total_amount ko hataya taaki hum isey securely backend pe calculate karein
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_proof' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $franchiseId = Auth::id();
                $priceColumn = $this->productPriceColumn();
                $proofPath = $request->hasFile('payment_proof') ? $request->file('payment_proof')->store('proofs', 'public') : null;

                // 🚀 SECURE CALCULATION: Backend khud price nikalega
                $totalAmount = 0;
                $itemsData = [];

                foreach ($request->items as $item) {
                    $product = DB::table('products')
                        ->where('id', $item['product_id'])
                        ->where('is_active', 1)
                        ->first();
                    
                    if ($product) {
                        $quantity = (int) $item['quantity'];
                        $price = (float) ($product->{$priceColumn} ?? $product->franchise_price ?? $product->base_price ?? 0);
                        $lineTotal = $price * $quantity;
                        $totalAmount += $lineTotal;
                        
                        $row = [
                            'product_id' => $item['product_id'],
                            'quantity' => $quantity,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];

                        if (Schema::hasColumn('stock_request_items', 'franchise_price')) {
                            $row['franchise_price'] = $price;
                        }

                        if (Schema::hasColumn('stock_request_items', 'total_price')) {
                            $row['total_price'] = $lineTotal;
                        }

                        if (Schema::hasColumn('stock_request_items', 'price_at_request')) {
                            $row['price_at_request'] = $price;
                        }

                        $itemsData[] = $row;
                    }
                }

                if (empty($itemsData)) {
                    throw ValidationException::withMessages([
                        'items' => 'Please select at least one active product from the catalog.',
                    ]);
                }

                // Main Request insert
                $requestPayload = [
                    'franchise_id' => $franchiseId,
                    'total_amount' => $totalAmount, // Securely calculated amount
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                if (Schema::hasColumn('stock_requests', 'request_number')) {
                    $requestPayload['request_number'] = 'REQ-' . strtoupper(uniqid());
                }

                if (Schema::hasColumn('stock_requests', 'payment_proof')) {
                    $requestPayload['payment_proof'] = $proofPath;
                }

                if (Schema::hasColumn('stock_requests', 'sku_id')) {
                    $requestPayload['sku_id'] = null;
                }

                if (Schema::hasColumn('stock_requests', 'quantity')) {
                    $requestPayload['quantity'] = collect($itemsData)->sum('quantity');
                }

                $requestId = DB::table('stock_requests')->insertGetId($requestPayload);

                // Items batch insert (Fast performance)
                foreach ($itemsData as &$data) {
                    $data['stock_request_id'] = $requestId;
                }
                DB::table('stock_request_items')->insert($itemsData);
            });

            return back()->with('success', 'Purchase Request Submitted! Awaiting Admin Approval.');

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            // Agar koi code/database phatta hai, toh log mein save hoga aur UI par error jayega
            Log::error('Stock Request Error: ' . $e->getMessage(), [
                'franchise_id' => Auth::id(),
                'items' => $request->input('items', []),
            ]);
            return back()->withErrors(['items' => 'Something went wrong while processing your request. Please try again.']);
        }
    }

    private function productPriceColumn(): string
    {
        foreach (['franchise_price', 'b2b_price', 'base_price'] as $column) {
            if (Schema::hasColumn('products', $column)) {
                return $column;
            }
        }

        return 'id';
    }
}
