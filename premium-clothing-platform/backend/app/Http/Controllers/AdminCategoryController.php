<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Category;

class AdminCategoryController extends Controller
{
    public function index(Request $request)
    {
        // 🚀 Fetch Categories with their related data counts
        $categories = Category::withCount(['subCategories', 'products']) // Assumes relations exist in Category model
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        $stats = [
            'total_categories' => Category::count(),
            'total_subcategories' => DB::table('sub_categories')->count(),
            'active_categories' => Category::where('status', 'active')->count(),
        ];

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search'])
        ]);
    }

    // 🚀 Store New Category with Image & Banner
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096', // Banner can be larger
        ]);

        $category = new Category();
        $category->name = $validated['name'];
        // Create a simple slug from name
        $category->slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $validated['name'])));
        $category->description = $validated['description'] ?? null;
        $category->status = 'active';

        // Handle Image Upload
        if ($request->hasFile('image')) {
            $category->image = $request->file('image')->store('categories/images', 'public');
        }

        // Handle Banner Upload
        if ($request->hasFile('banner')) {
            $category->banner = $request->file('banner')->store('categories/banners', 'public');
        }

        $category->save();

        return back()->with('success', 'Category created successfully!');
    }

    // 🚀 Toggle Status
    public function toggleStatus($id)
    {
        $category = Category::findOrFail($id);
        $category->status = ($category->status === 'active') ? 'inactive' : 'active';
        $category->save();

        return back()->with('success', 'Category status updated.');
    }
}