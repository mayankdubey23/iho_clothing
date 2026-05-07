<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CheckoutOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fields = [
            'full_name',
            'mobile_number',
            'email',
            'alternate_mobile_number',
            'house_flat_building',
            'street_area_locality',
            'landmark',
            'city',
            'state',
            'pincode',
            'country',
            'coupon_code',
            'payment_method',
        ];

        $clean = [];
        foreach ($fields as $field) {
            if ($this->has($field)) {
                $clean[$field] = is_string($this->input($field)) ? trim($this->input($field)) : $this->input($field);
            }
        }

        $this->merge($clean);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'min:3', 'max:100', 'regex:/^[A-Za-z ]+$/'],
            'mobile_number' => ['required', 'digits:10', 'regex:/^[6-9][0-9]{9}$/'],
            'email' => ['required', 'email', 'max:150'],
            'alternate_mobile_number' => ['nullable', 'digits:10', 'regex:/^[6-9][0-9]{9}$/'],
            'house_flat_building' => ['required', 'string', 'min:2', 'max:255'],
            'street_area_locality' => ['required', 'string', 'min:3', 'max:255'],
            'landmark' => ['nullable', 'string', 'min:3', 'max:255', 'regex:/[A-Za-z0-9]/'],
            'city' => ['required', 'string', 'min:2', 'max:100', 'regex:/^[A-Za-z ]+$/'],
            'state' => ['required', 'string', 'max:100'],
            'pincode' => ['required', 'digits:6', 'regex:/^[1-9][0-9]{5}$/'],
            'country' => ['required', 'string', 'max:100', 'in:India'],
            'payment_method' => ['nullable', 'string', 'in:cod,online'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.sku_id' => ['required', 'integer', 'exists:skus,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.*' => 'Please enter a valid full name.',
            'mobile_number.*' => 'Please enter a valid 10-digit mobile number.',
            'email.*' => 'Please enter a valid email address.',
            'alternate_mobile_number.*' => 'Please enter a valid alternate mobile number.',
            'house_flat_building.*' => 'Please enter your house, flat, or building number.',
            'street_area_locality.*' => 'Please enter your street, area, or locality.',
            'landmark.*' => 'Please enter a valid landmark.',
            'city.*' => 'Please enter a valid city name.',
            'state.*' => 'Please select your state.',
            'pincode.*' => 'Please enter a valid 6-digit pincode.',
            'country.*' => 'Please select your country.',
            'items.required' => 'Your cart is empty.',
            'items.min' => 'Your cart is empty.',
            'items.*.quantity.min' => 'Product quantity must be greater than 0.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'status' => false,
            'success' => false,
            'message' => 'Please fix the highlighted errors.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
