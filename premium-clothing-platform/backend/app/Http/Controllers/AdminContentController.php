<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Models\StorefrontSetting;
use App\Models\FeaturedCategoryItem;
use App\Models\StorefrontBanner;
use Inertia\Inertia;

class AdminContentController extends Controller
{
    public function index(Request $request)
    {
        $activeTab = $request->get('tab', 'banners');
        $tabData = [];

        if ($activeTab === 'banners') {
            $tabData = Schema::hasTable('storefront_banners')
                ? StorefrontBanner::orderBy('sort_order')->latest()->get()
                : collect();
        } elseif ($activeTab === 'pages') {
            $tabData = Schema::hasTable('pages')
                ? DB::table('pages')->orderByDesc('updated_at')->get()
                : collect();
        } elseif ($activeTab === 'testimonials') {
            if (! Schema::hasTable('testimonials')) {
                $tabData = collect();
            } else {
            $this->ensureDefaultTestimonials();

            $testimonialsQuery = DB::table('testimonials');

            if (Schema::hasColumn('testimonials', 'is_dummy')) {
                $testimonialsQuery->orderByDesc('is_dummy');
            }

            $tabData = $testimonialsQuery
                ->orderByDesc('created_at')
                ->get()
                ->map(fn ($testimonial) => $this->formatTestimonial($testimonial));
            }
        } elseif ($activeTab === 'faqs') {
            $tabData = Schema::hasTable('faqs')
                ? DB::table('faqs')->orderBy('display_order', 'asc')->get()
                : collect();
        } elseif ($activeTab === 'settings') {
            $tabData = StorefrontSetting::pluck('value', 'key')->toArray();
        } elseif ($activeTab === 'shop_page') {
            $tabData = StorefrontSetting::whereIn('key', $this->shopPageSettingKeys())
                ->pluck('value', 'key')
                ->toArray();
        } elseif ($activeTab === 'gym_wear') {
            $tabData = StorefrontSetting::whereIn('key', $this->gymWearSettingKeys())
                ->pluck('value', 'key')
                ->toArray();
        } elseif ($activeTab === 'featured_categories') {
            $tabData = FeaturedCategoryItem::orderBy('sort_order')->get()->map(function ($item) {
                return [
                    'id'         => $item->id,
                    'name'       => $item->name,
                    'slug'       => $item->slug,
                    'image_path' => $item->image_path,
                    'image_url'  => $item->image_path ? asset('storage/' . ltrim($item->image_path, '/')) : null,
                    'sort_order' => $item->sort_order,
                    'is_active'  => $item->is_active,
                ];
            })->values()->all();
        }

        $stats = [
            'active_banners'    => Schema::hasTable('storefront_banners') ? StorefrontBanner::where('is_active', true)->count() : 0,
            'published_pages'   => Schema::hasTable('pages') ? DB::table('pages')->where('status', 'published')->count() : 0,
            'total_faqs'        => Schema::hasTable('faqs') ? DB::table('faqs')->where('status', 'active')->count() : 0,
            'featured_cats'     => Schema::hasTable('featured_category_items') ? FeaturedCategoryItem::where('is_active', true)->count() : 0,
        ];

        return Inertia::render('Admin/WebsiteContent', [
            'tabData'   => $tabData,
            'activeTab' => $activeTab,
            'stats'     => $stats,
        ]);
    }

    // ---------------------------------------------------------------
    // Static Pages CRUD
    // ---------------------------------------------------------------

    public function storePage(Request $request)
    {
        $validated = $this->validatePage($request);

        DB::table('pages')->insert([
            ...$validated,
            'slug' => $this->normalizePageSlug($validated['slug']),
            'status' => $validated['status'] ?? 'published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Static page created successfully.');
    }

    public function updatePage(Request $request, int $id)
    {
        $page = DB::table('pages')->where('id', $id)->first();

        if (! $page) {
            return back()->withErrors('Page not found.');
        }

        $validated = $this->validatePage($request, $id);

        DB::table('pages')
            ->where('id', $id)
            ->update([
                ...$validated,
                'slug' => $this->normalizePageSlug($validated['slug']),
                'status' => $validated['status'] ?? $page->status,
                'updated_at' => now(),
            ]);

        return back()->with('success', 'Static page updated successfully.');
    }

    public function destroyPage(int $id)
    {
        DB::table('pages')->where('id', $id)->delete();

        return back()->with('success', 'Static page deleted successfully.');
    }

    // ---------------------------------------------------------------
    // Featured Categories CRUD
    // ---------------------------------------------------------------

    public function storeFeaturedCategory(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'slug'       => 'required|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'image'      => 'nullable|image|max:4096',
        ]);

        $imagePath = $request->hasFile('image')
            ? $request->file('image')->store('featured_categories', 'public')
            : null;

        FeaturedCategoryItem::create([
            'name'       => $validated['name'],
            'slug'       => $validated['slug'],
            'sort_order' => $validated['sort_order'] ?? 0,
            'image_path' => $imagePath,
            'is_active'  => true,
        ]);

        return back()->with('success', 'Featured category added successfully!');
    }

    public function updateFeaturedCategory(Request $request, int $id)
    {
        $item = FeaturedCategoryItem::findOrFail($id);

        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'slug'       => 'required|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'image'      => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($item->image_path) {
                Storage::disk('public')->delete($item->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('featured_categories', 'public');
        }

        $item->update([
            'name'       => $validated['name'],
            'slug'       => $validated['slug'],
            'sort_order' => $validated['sort_order'] ?? $item->sort_order,
            'image_path' => $validated['image_path'] ?? $item->image_path,
        ]);

        return back()->with('success', 'Featured category updated successfully!');
    }

    public function destroyFeaturedCategory(int $id)
    {
        $item = FeaturedCategoryItem::findOrFail($id);

        if ($item->image_path) {
            Storage::disk('public')->delete($item->image_path);
        }

        $item->delete();

        return back()->with('success', 'Featured category deleted.');
    }

    public function toggleFeaturedCategory(int $id)
    {
        $item = FeaturedCategoryItem::findOrFail($id);
        $item->update(['is_active' => ! $item->is_active]);

        return back()->with('success', 'Status updated.');
    }

    // ---------------------------------------------------------------
    // General Settings
    // ---------------------------------------------------------------

    public function updateSettings(Request $request)
    {
        $settings = $request->except(['_token', '_method', 'group']);

        foreach ($settings as $key => $value) {
            $type = is_array($value) ? 'json' : 'text';

            if ($request->hasFile($key)) {
                $request->validate([
                    $key => ['file', 'mimes:jpg,jpeg,png,webp,mp4,webm', 'max:10240'],
                ]);

                $value = $request->file($key)->store('storefront_assets', 'public');
                $type  = str_starts_with((string) $request->file($key)->getMimeType(), 'video/') ? 'video' : 'image';
            } elseif ($value === null) {
                continue;
            } elseif (str_ends_with($key, '_json') && is_string($value) && trim($value) !== '') {
                json_decode($value);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    return back()->withErrors([
                        $key => 'Please enter valid JSON.',
                    ])->withInput();
                }

                $type = 'json';
            } elseif (is_array($value)) {
                $value = json_encode($value);
            }

            StorefrontSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'type'  => $type,
                ]
            );
        }

        return back()->with('success', 'Storefront settings updated successfully.');
    }

    // ---------------------------------------------------------------
    // Testimonials CRUD
    // ---------------------------------------------------------------

    public function storeTestimonial(Request $request)
    {
        $validated = $this->validateTestimonial($request);
        $imagePath = $request->hasFile('image')
            ? $request->file('image')->store('testimonials', 'public')
            : null;

        DB::table('testimonials')->insert($this->testimonialPayload($validated, $imagePath, false));

        return back()->with('success', 'Review added successfully!');
    }

    public function updateTestimonial(Request $request, int $id)
    {
        $testimonial = DB::table('testimonials')->where('id', $id)->first();

        if (! $testimonial) {
            return back()->withErrors('Review not found.');
        }

        $validated = $this->validateTestimonial($request);
        $imagePath = $testimonial->image_path;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('testimonials', 'public');
        }

        DB::table('testimonials')
            ->where('id', $id)
            ->update($this->testimonialPayload($validated, $imagePath, (bool) ($testimonial->is_dummy ?? false), false));

        return back()->with('success', 'Review updated successfully!');
    }

    public function destroyTestimonial(int $id)
    {
        DB::table('testimonials')->where('id', $id)->delete();

        return back()->with('success', 'Review deleted successfully!');
    }

    public function toggleStatus(Request $request)
    {
        $request->validate([
            'id'    => 'required|integer',
            'table' => 'required|string|in:banners,pages,testimonials,faqs',
        ]);

        $record = DB::table($request->table)->where('id', $request->id)->first();

        if (! $record) {
            return back()->withErrors('Record not found.');
        }

        $newStatus = $request->table === 'pages'
            ? ($record->status === 'published' ? 'draft' : 'published')
            : ($record->status === 'active' ? 'inactive' : 'active');

        DB::table($request->table)->where('id', $request->id)->update([
            'status'     => $newStatus,
            'updated_at' => now(),
        ]);

        return back()->with('success', ucfirst($request->table) . ' status updated successfully.');
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    private function validateTestimonial(Request $request): array
    {
        return $request->validate([
            'customer_name'    => 'required|string|max:255',
            'rating'           => 'required|integer|min:1|max:5',
            'review_text'      => 'required|string',
            'product_purchased' => 'nullable|string|max:255',
            'image'            => 'nullable|image|max:2048',
        ]);
    }

    private function validatePage(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'slug' => [
                'required',
                'string',
                'max:120',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('pages', 'slug')->ignore($ignoreId),
            ],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'status' => ['required', 'in:published,draft'],
        ]);
    }

    private function normalizePageSlug(string $slug): string
    {
        return trim(strtolower($slug), '/');
    }

    private function testimonialPayload(array $validated, ?string $imagePath, bool $isDummy, bool $isNew = true): array
    {
        $payload = [
            'customer_name' => $validated['customer_name'],
            'rating'        => $validated['rating'],
            'image_path'    => $imagePath,
            'status'        => 'active',
            'updated_at'    => now(),
        ];

        if ($isNew) {
            $payload['created_at'] = now();
        }

        if (Schema::hasColumn('testimonials', 'review_text')) {
            $payload['review_text'] = $validated['review_text'];
        } else {
            $payload['review'] = $validated['review_text'];
        }

        if (Schema::hasColumn('testimonials', 'product_purchased')) {
            $payload['product_purchased'] = $validated['product_purchased'] ?? null;
        }

        if (Schema::hasColumn('testimonials', 'is_dummy')) {
            $payload['is_dummy'] = $isDummy;
        }

        return $payload;
    }

    private function formatTestimonial(object $testimonial): object
    {
        $testimonial->review_text      = $testimonial->review_text ?? $testimonial->review ?? '';
        $testimonial->product_purchased = $testimonial->product_purchased ?? null;
        $testimonial->is_dummy         = (bool) ($testimonial->is_dummy ?? false);

        return $testimonial;
    }

    private function ensureDefaultTestimonials(): void
    {
        if (! Schema::hasColumn('testimonials', 'is_dummy') || DB::table('testimonials')->exists()) {
            return;
        }

        $now      = now();
        $defaults = collect($this->defaultTestimonials())->map(function (array $testimonial) use ($now) {
            $payload = [
                'customer_name' => $testimonial['customer_name'],
                'image_path'    => $testimonial['image_path'],
                'rating'        => $testimonial['rating'],
                'status'        => 'active',
                'created_at'    => $now,
                'updated_at'    => $now,
            ];

            if (Schema::hasColumn('testimonials', 'review_text')) {
                $payload['review_text'] = $testimonial['review_text'];
            } elseif (Schema::hasColumn('testimonials', 'review')) {
                $payload['review'] = $testimonial['review_text'];
            }

            if (Schema::hasColumn('testimonials', 'product_purchased')) {
                $payload['product_purchased'] = $testimonial['product_purchased'];
            }

            if (Schema::hasColumn('testimonials', 'is_dummy')) {
                $payload['is_dummy'] = true;
            }

            return $payload;
        })->all();

        DB::table('testimonials')->insert($defaults);
    }

    private function shopPageSettingKeys(): array
    {
        return [
            'shop_hero_title',
            'shop_hero_subtitle',
            'shop_promo_banner',
            'shop_seo_title',
            'shop_hero_bg_image',
        ];
    }

    private function gymWearSettingKeys(): array
    {
        return [
            'gym_wear_title',
            'gym_wear_subtitle',
            'gym_wear_description',
            'gym_wear_promo_banner',
            'gym_wear_seo_title',
            'gym_wear_header_image',
        ];
    }

    private function defaultTestimonials(): array
    {
        return [
            [
                'customer_name'    => 'Rahul Sharma',
                'rating'           => 5,
                'review_text'      => "The Aero-Weave tee is incredibly light. I use it for my marathon training and it barely feels like it's there. The sweat-wicking is next level.",
                'product_purchased' => 'Titanium Aero-Weave Running Tee',
                'image_path'       => null,
            ],
            [
                'customer_name'    => 'Priya Malik',
                'rating'           => 5,
                'review_text'      => "Perfect fit. Finally found premium gym wear that doesn't cost a kidney. The fabric stretch is amazing for deep squats.",
                'product_purchased' => 'Core Tech Track Pants',
                'image_path'       => null,
            ],
            [
                'customer_name'    => 'Amit Kumar',
                'rating'           => 4,
                'review_text'      => 'Good quality fabric. The packaging was also very premium. Delivery took one extra day but the product completely makes up for it.',
                'product_purchased' => 'Signature Black Hoodie',
                'image_path'       => null,
            ],
            [
                'customer_name'    => 'Vikram S.',
                'rating'           => 5,
                'review_text'      => 'Bought this for my daily workouts. The material feels cold to the touch and super breathable. Will definitely buy more colors.',
                'product_purchased' => 'Thermal Adapt Base Layer',
                'image_path'       => null,
            ],
            [
                'customer_name'    => 'Neha D.',
                'rating'           => 5,
                'review_text'      => "The compression shorts are fantastic. They don't ride up while running and the pocket placement is perfect for my phone.",
                'product_purchased' => 'Titanium Compression Shorts',
                'image_path'       => null,
            ],
        ];
    }
}
