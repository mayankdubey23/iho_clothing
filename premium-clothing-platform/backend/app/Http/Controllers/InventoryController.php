<?php

namespace App\Http\Controllers;

use App\Models\Inventory;
use App\Models\Sku;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * Franchise ya Super Admin apna stock update kar sakein
     */
    public function updateStock(Request $request)
    {
        $request->validate([
            'sku_id' => 'required|exists:skus,id',
            'quantity' => 'required|integer',
            'action' => 'required|in:add,subtract,set' // Stock badhana hai, ghatana hai, ya fix karna hai
        ]);

        $user = auth()->user();
        
        // Agar super admin hai toh wo kisi ka bhi stock manage kar sakta hai (abhi default null yani Main Warehouse le rahe hain)
        // Agar franchise hai toh sirf apna hi stock update karega
        $franchiseId = $user->role === 'franchise' ? $user->id : null;

        // Inventory record dhundho, agar nahi hai toh naya bana do
        $inventory = Inventory::firstOrCreate(
            ['sku_id' => $request->sku_id, 'franchise_id' => $franchiseId],
            ['stock_quantity' => 0]
        );

        // Action ke hisaab se stock update karo
        if ($request->action === 'add') {
            $inventory->increment('stock_quantity', $request->quantity);
            $message = "Stock added successfully!";
        } elseif ($request->action === 'subtract') {
            if ($inventory->stock_quantity >= $request->quantity) {
                $inventory->decrement('stock_quantity', $request->quantity);
                $message = "Stock reduced successfully!";
            } else {
                return back()->withErrors(['error' => 'Not enough stock to subtract.']);
            }
        } else {
            // 'set' action - exact stock set karne ke liye
            $inventory->update(['stock_quantity' => max(0, $request->quantity)]);
            $message = "Stock level updated!";
        }

        return back()->with('success', $message);
    }
}