<?php

namespace App\Http\Controllers;

use App\Models\FranchiseApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FranchiseApplicationController extends Controller
{
    public function index()
    {
        abort_unless(auth()->user()?->role === 'super_admin', 403);

        $applications = FranchiseApplication::latest()
            ->get()
            ->map(fn ($application) => [
                ...$application->toArray(),
                'user' => [
                    'name' => $application->full_name,
                    'email' => $application->email,
                ],
                'franchise_plan' => [
                    'name' => ucfirst((string) ($application->franchise_type ?: 'Franchise')),
                ],
            ]);

        return Inertia::render('Admin/Franchises', [
            'applications' => $applications,
        ]);
    }

    public function create()
{
    return Inertia::render('FranchiseApply');
}

public function store(Request $request)
{
    $validated = $request->validate([
        'full_name' => ['required', 'string', 'min:3', 'regex:/^[A-Za-z\s]+$/'],
        'email' => 'required|email|max:255',
        'mobile_number' => ['required', 'regex:/^[6-9]\d{9}$/'],
        'whatsapp_number' => ['required', 'regex:/^[6-9]\d{9}$/'],
        'gender' => 'required|in:male,female,other',
        'age' => 'required|numeric|min:18|max:80',
        
        'current_city' => 'required|string|max:120',
        'current_state' => 'required|string|max:120',
        'full_address' => 'required|string|max:1000',
        'pincode' => ['required', 'regex:/^\d{6}$/'],
        'house_no' => 'nullable|string|max:255',
        'area_locality' => 'nullable|string|max:255',
        'state' => 'nullable|string',
        'city' => 'nullable|string',

        'owns_business' => 'required|in:yes,no',
        'business_name' => ['nullable', 'string', 'max:255', 'regex:/^[A-Za-z0-9\s&\-\.]+$/'],
        'business_type' => 'nullable|string|max:255',
        'experience_years' => 'nullable|string|max:255',
        'clothing_experience' => 'required|string|max:255',
        'gst_number' => ['nullable', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i'],
        'pan_number' => ['required', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i'],
        'business_registration' => 'nullable|string|max:255',

        'franchise_type' => 'required|in:online,offline,both',
        'preferred_state' => 'required|string',
        'preferred_city' => 'required|string',
        'preferred_area' => 'required|string|max:255',
        'preferred_pincode' => ['required', 'regex:/^\d{6}$/'],
        'has_shop' => 'required|in:yes,no',
        'location_type' => 'nullable|string',
        'shop_size' => 'nullable|string|max:255',

        'investment_budget' => 'required|string',
        'can_purchase_initial_stock' => 'required|in:yes,no',
        'expected_sales' => 'required|string|max:255',
        'ready_for_marketing_investment' => 'required|in:yes,no',
        
        'has_storage_space' => 'required|in:yes,no',
        'has_staff' => 'required|in:yes,no',
        'can_manage_packing' => 'required|in:yes,no',
        'can_manage_local_delivery' => 'required|in:yes,no',
        'can_handle_returns' => 'required|in:yes,no',
        'has_computer_internet' => 'required|in:yes,no',
        'can_manage_customer_support' => 'required|in:yes,no',

        'can_promote_social' => 'required|in:yes,no',
        'has_social_page' => 'required|in:yes,no',
        'has_local_network' => 'required|in:yes,no',
        'can_run_ads' => 'required|in:yes,no',
        'can_promote_events' => 'required|in:yes,no',
        'social_media_links' => 'nullable|string|max:1000',

        'why_franchise' => 'required|string|min:20',
        'cover_area' => 'required|string|max:1000',
        'start_timeline' => 'required|string|max:255',
        'agree_pricing_policy' => 'accepted',
        'additional_message' => 'nullable|string|max:1000',
        'terms_accepted' => 'accepted',
        'privacy_accepted' => 'accepted',
        'verification_consent' => 'accepted',

        // Document handling
        'aadhaar_doc' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        'pan_doc' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        'gst_doc' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        'address_proof_doc' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        'shop_proof_doc' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        'business_registration_doc' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
        'bank_proof_doc' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:4096',
    ], [
        // Custom Backend Error Messages
        'full_name.regex' => 'Name cannot contain numbers or special characters.',
        'mobile_number.regex' => 'Please enter a valid 10-digit Indian mobile number.',
        'pincode.regex' => 'Please enter a valid 6-digit pincode.',
        'pan_number.regex' => 'Invalid PAN format.',
        'gst_number.regex' => 'Invalid GST format.',
    ]);

    $validated['state'] = $validated['current_state'];
    $validated['city'] = $validated['current_city'];
    $validated['area_locality'] = $validated['preferred_area'];
    $validated['house_no'] = $validated['full_address'];
    $validated['country'] = 'India';

    $currentLocation = $this->lookupPincode($validated['pincode']);
    if ($currentLocation) {
        $validated['current_state'] = $currentLocation['state'];
        $validated['current_city'] = $currentLocation['city'];
        $validated['state'] = $currentLocation['state'];
        $validated['city'] = $currentLocation['city'];
    }

    $preferredLocation = $this->lookupPincode($validated['preferred_pincode']);
    if ($preferredLocation) {
        $validated['preferred_state'] = $preferredLocation['state'];
        $validated['preferred_city'] = $preferredLocation['city'];
    }

    // File processing logic
    foreach ([
        'aadhaar_doc' => 'aadhaar_card_path',
        'pan_doc' => 'pan_card_path',
        'gst_doc' => 'gst_certificate_path',
        'address_proof_doc' => 'address_proof_path',
        'shop_proof_doc' => 'shop_proof_path',
        'business_registration_doc' => 'business_registration_path',
        'bank_proof_doc' => 'bank_proof_path',
    ] as $input => $column) {
        if ($request->hasFile($input)) {
            $validated[$column] = $request->file($input)->store('franchise_docs', 'public');
        }
        unset($validated[$input]);
    }

    FranchiseApplication::create($validated);

    return back()->with('success', 'Thank you for applying for our franchise. Our team will review your details and contact you soon.');
}

public function updateStatus(Request $request, FranchiseApplication $application)
{
    abort_unless(auth()->user()?->role === 'super_admin', 403);

    $validated = $request->validate([
        'status' => 'required|in:pending,reviewed,approved,rejected',
        'admin_notes' => 'nullable|string|max:1000',
    ]);

    $application->update($validated);

    if ($validated['status'] === 'approved') {
        $this->createFranchiseLogin($application->fresh());
    }

    return back()->with('success', 'Franchise application updated successfully.');
}

public function approve($id)
{
    abort_unless(auth()->user()?->role === 'super_admin', 403);

    FranchiseApplication::whereKey($id)->update(['status' => 'approved']);
    $this->createFranchiseLogin(FranchiseApplication::findOrFail($id));

    return back()->with('success', 'Franchise application approved successfully.');
}

private function lookupPincode(string $pincode): ?array
{
    try {
        $response = Http::timeout(5)->get("https://api.postalpincode.in/pincode/{$pincode}");
        $payload = $response->json();
        $postOffice = $payload[0]['PostOffice'][0] ?? null;

        if (($payload[0]['Status'] ?? null) === 'Success' && $postOffice) {
            return [
                'city' => $postOffice['District'] ?? '',
                'state' => $postOffice['State'] ?? '',
            ];
        }
    } catch (\Throwable $e) {
        report($e);
    }

    return null;
}

private function createFranchiseLogin(FranchiseApplication $application): void
{
    $password = Str::password(12);

    $user = User::updateOrCreate(
        ['email' => $application->email],
        [
            'name' => $application->full_name,
            'mobile_number' => $application->mobile_number,
            'role' => 'franchise_admin',
            'password' => Hash::make($password),
        ]
    );

    if (in_array('status', $user->getFillable(), true) || \Illuminate\Support\Facades\Schema::hasColumn('users', 'status')) {
        $user->forceFill(['status' => 'active'])->save();
    }

    $application->update([
        'approved_user_id' => $user->id,
        'login_email' => $user->email,
        'temporary_password' => $password,
    ]);
}
}
