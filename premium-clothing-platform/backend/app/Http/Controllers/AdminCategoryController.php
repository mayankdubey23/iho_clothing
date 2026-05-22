<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdminCategoryController extends Controller
{
    public function index(Request $request)
    {
        $counts = ['products'];

        if (Schema::hasColumn('categories', 'parent_id')) {
            $counts[] = 'children';
        } elseif (Schema::hasTable('sub_categories')) {
            $counts[] = 'subCategories';
        }

        $categories = Category::query()
            ->with(Schema::hasColumn('categories', 'parent_id') ? ['parent:id,name,slug'] : [])
            ->withCount($counts)
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when(! $request->search && Schema::hasColumn('categories', 'parent_id'), function ($query) {
                $query->orderByRaw('parent_id is not null')->orderBy('parent_id');
            })
            ->orderBy('name')
            ->orderByDesc('created_at')
            ->paginate(24)
            ->withQueryString();

        $hasSubCategories = Schema::hasTable('sub_categories');
        $hasParentId = Schema::hasColumn('categories', 'parent_id');
        $hasStatus = Schema::hasColumn('categories', 'status');
        $hasIsActive = Schema::hasColumn('categories', 'is_active');

        $categories->getCollection()->transform(function (Category $category) use ($hasSubCategories, $hasParentId, $hasStatus, $hasIsActive) {
            if ($hasParentId) {
                $category->sub_categories_count = $category->children_count ?? 0;
            } elseif (! $hasSubCategories) {
                $category->sub_categories_count = 0;
            }

            if (! $hasStatus && $hasIsActive) {
                $category->status = $category->is_active ? 'active' : 'inactive';
            }

            return $category;
        });

        return Inertia::render('Admin/Categories', [
            'categories' => $categories,
            'parentCategories' => Schema::hasColumn('categories', 'parent_id')
                ? Category::whereNull('parent_id')->orderBy('name')->get(['id', 'name', 'slug'])
                : [],
            'capabilities' => [
                'parent_id' => Schema::hasColumn('categories', 'parent_id'),
                'description' => Schema::hasColumn('categories', 'description'),
                'image' => Schema::hasColumn('categories', 'image'),
                'banner' => Schema::hasColumn('categories', 'banner'),
            ],
            'stats' => [
                'total_categories' => Schema::hasColumn('categories', 'parent_id')
                    ? Category::whereNull('parent_id')->count()
                    : Category::count(),
                'total_subcategories' => Schema::hasColumn('categories', 'parent_id')
                    ? Category::whereNotNull('parent_id')->count()
                    : (Schema::hasTable('sub_categories')
                    ? DB::table('sub_categories')->count()
                    : 0),
                'active_categories' => $this->activeCategoriesCount(),
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|max:255',
        ];

        if (Schema::hasColumn('categories', 'description')) {
            $rules['description'] = 'nullable|string';
        }

        if (Schema::hasColumn('categories', 'image')) {
            $rules['image'] = 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048';
        }

        if (Schema::hasColumn('categories', 'banner')) {
            $rules['banner'] = 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096';
        }

        if (Schema::hasColumn('categories', 'parent_id')) {
            $rules['parent_id'] = 'nullable|exists:categories,id';
        }

        $validated = $request->validate($rules);

        $category = new Category();
        $category->name = $validated['name'];
        $category->slug = $this->uniqueSlug($validated['name'], $validated['parent_id'] ?? null);

        if (Schema::hasColumn('categories', 'parent_id')) {
            $category->parent_id = $validated['parent_id'] ?? null;
        }

        if (Schema::hasColumn('categories', 'description')) {
            $category->description = $validated['description'] ?? null;
        }

        if (Schema::hasColumn('categories', 'status')) {
            $category->status = 'active';
        }

        if (Schema::hasColumn('categories', 'is_active')) {
            $category->is_active = true;
        }

        if (Schema::hasColumn('categories', 'image') && $request->hasFile('image')) {
            $category->image = $request->file('image')->store('categories/images', 'public');
        }

        if (Schema::hasColumn('categories', 'banner') && $request->hasFile('banner')) {
            $category->banner = $request->file('banner')->store('categories/banners', 'public');
        }

        $category->save();

        return back()->with('success', 'Category created successfully!');
    }

    public function syncDefaults()
    {
        $categoryTree = [
            'Men Sportswear' => [
                'Men T-Shirts', 'Men Track Pants', 'Men Shorts', 'Men Jackets',
                'Men Gym Wear', 'Men Running Wear', 'Men Shoes', 'Men Accessories',
            ],
            'Women Sportswear' => [
                'Women T-Shirts', 'Sports Bras', 'Leggings', 'Track Pants',
                'Yoga Wear', 'Running Wear', 'Jackets', 'Shoes', 'Accessories',
            ],
            'Gym Wear' => [
                'Gym T-Shirts', 'Compression Wear', 'Track Pants', 'Shorts',
                'Sports Bras', 'Training Shoes', 'Gym Accessories',
            ],
            'Running Wear' => [
                'Running T-Shirts', 'Running Shorts', 'Running Track Pants',
                'Running Shoes', 'Lightweight Jackets', 'Socks', 'Accessories',
            ],
            'Outerwear & Jackets' => [],
            'Premium Hoodies' => [],
            'T-Shirts' => [],
            'Track Pants' => [],
            'Footwear' => [],
            'Accessories' => [],
        ];

        foreach ($categoryTree as $parentName => $subcategories) {
            $parent = Category::firstOrCreate(
                ['slug' => Str::slug($parentName)],
                [
                    'name' => $parentName,
                    'is_active' => true,
                    'parent_id' => null,
                ]
            );

            if (Schema::hasColumn('categories', 'parent_id')) {
                $parent->forceFill(['parent_id' => null, 'is_active' => true])->save();
            }

            foreach ($subcategories as $subName) {
                $existingChild = Category::query()
                    ->where('name', $subName)
                    ->where('parent_id', $parent->id)
                    ->first();

                if (! $existingChild) {
                    Category::create([
                        'name' => $subName,
                        'slug' => $this->uniqueSlug($subName, $parent->id),
                        'is_active' => true,
                        'parent_id' => $parent->id,
                    ]);
                }
            }
        }

        return back()->with('success', 'Storefront category tree synced successfully.');
    }

    public function toggleStatus($id)
    {
        $category = Category::findOrFail($id);

        if (Schema::hasColumn('categories', 'status')) {
            $category->status = ($category->status === 'active') ? 'inactive' : 'active';
        } elseif (Schema::hasColumn('categories', 'is_active')) {
            $category->is_active = ! (bool) $category->is_active;
        }

        $category->save();

        return back()->with('success', 'Category status updated.');
    }

    private function activeCategoriesCount(): int
    {
        if (Schema::hasColumn('categories', 'status')) {
            return Category::where('status', 'active')->count();
        }

        if (Schema::hasColumn('categories', 'is_active')) {
            return Category::where('is_active', true)->count();
        }

        return Category::count();
    }

    private function uniqueSlug(string $name, ?int $parentId = null): string
    {
        $base = Str::slug($name);

        if ($parentId && Category::where('slug', $base)->exists()) {
            $parent = Category::find($parentId);
            $base = Str::slug(($parent?->slug ?: 'collection') . '-' . $name);
        }

        $slug = $base;
        $counter = 2;

        while (Category::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
