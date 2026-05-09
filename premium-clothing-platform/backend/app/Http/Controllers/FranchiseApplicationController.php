<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\FranchiseApplication;

class FranchiseApplicationController extends Controller
{
    public function create()
{
    return Inertia::render('Frontend/FranchiseApply');
}

public function store(Request $request)
{
    $validated = $request->validate([
        'full_name' => ['required', 'string', 'min:3', 'regex:/^[A-Za-z\s]+$/'],
        'email' => 'required|email|max:255',
        'mobile_number' => ['required', 'regex:/^[6-9]\d{9}$/'],
        'whatsapp_number' => ['nullable', 'regex:/^[6-9]\d{9}$/'],
        'gender' => 'required|in:male,female',
        'age' => 'required|numeric|min:18|max:80',
        
        'house_no' => 'required|string|max:255',
        'area_locality' => 'required|string|max:255',
        'state' => 'required|string',
        'city' => 'required|string',
        'pincode' => ['required', 'regex:/^\d{6}$/'],

        'owns_business' => 'required|in:yes,no',
        'business_name' => ['nullable', 'required_if:owns_business,yes', 'regex:/^[A-Za-z0-9\s&\-\.]+$/'],
        'business_type' => 'nullable|required_if:owns_business,yes|string',
        'experience_years' => 'nullable|required_if:owns_business,yes|string',
        'gst_number' => ['nullable', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i'],

        'franchise_type' => 'required|in:online,offline,both',
        'preferred_state' => 'required|string',
        'preferred_city' => 'required|string',
        'location_type' => 'nullable|required_if:franchise_type,offline,both|string',
        'shop_size' => 'nullable|required_if:franchise_type,offline,both|numeric',

        'investment_budget' => 'required|string',
        'expected_sales' => 'required|numeric',
        
        'pan_number' => ['nullable', 'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i'],
        'why_franchise' => 'required|string|min:20',
        'terms_accepted' => 'accepted',

        // Document handling
        'aadhaar_doc' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
        'pan_doc' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
    ], [
        // Custom Backend Error Messages
        'full_name.regex' => 'Name cannot contain numbers or special characters.',
        'mobile_number.regex' => 'Please enter a valid 10-digit Indian mobile number.',
        'pincode.regex' => 'Please enter a valid 6-digit pincode.',
        'pan_number.regex' => 'Invalid PAN format.',
        'gst_number.regex' => 'Invalid GST format.',
    ]);

    // File processing logic
    if ($request->hasFile('aadhaar_doc')) {
        $validated['aadhaar_card_path'] = $request->file('aadhaar_doc')->store('franchise_docs', 'public');
    }
    if ($request->hasFile('pan_doc')) {
        $validated['pan_card_path'] = $request->file('pan_doc')->store('franchise_docs', 'public');
    }

    FranchiseApplication::create($validated);

    return back()->with('success', 'Application submitted successfully.');
}
}