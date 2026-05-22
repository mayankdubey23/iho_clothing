<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user (customer or admin).
     * Admin registration requires admin_secret key.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'admin_secret' => ['nullable', 'string'],
        ]);

        // Determine user role
        $role = 'customer'; // Default role for regular registration

        // Check if admin_secret is provided (admin registration)
        if ($request->input('admin_secret')) {
            if ($request->input('admin_secret') !== env('ADMIN_SECRET_KEY', 'admin123')) {
                return response()->json([
                    'status' => false,
                    'success' => false,
                    'message' => 'Invalid admin secret key',
                ], 403);
            }
            $role = 'admin';
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
        ]);

        $tokenName = $role === 'admin' ? 'admin-token' : 'customer-token';
        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'status' => true,
            'success' => true,
            'message' => ucfirst($role) . ' registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login user with email and password.
     * Works for both admin and customer accounts.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($statusError = $this->accountStatusError($user)) {
            $this->logAuthActivity($request, $user, 'API Login Blocked', $statusError);

            return response()->json([
                'status' => false,
                'success' => false,
                'message' => $statusError,
            ], 403);
        }

        $role = strtolower(trim($user->role ?? 'customer'));
        if ($this->requiresOtp($role)) {
            $otp = (string) random_int(100000, 999999);
            $challengeId = (string) Str::uuid();

            Cache::put("api_login_challenge:{$challengeId}", $user->id, now()->addMinutes(10));
            Cache::put("api_login_otp:{$challengeId}", Hash::make($otp), now()->addMinutes(10));
            $this->logAuthActivity($request, $user, 'API OTP Requested', 'Admin role API login requires OTP verification.');
            Log::info('API login OTP generated', ['user_id' => $user->id, 'email' => $user->email, 'challenge_id' => $challengeId, 'otp' => $otp]);

            $response = [
                'status' => true,
                'message' => 'OTP verification required',
                'requires_otp' => true,
                'challenge_id' => $challengeId,
                'redirect_to' => $this->redirectPathForRole($user->role),
            ];

            if ($this->shouldExposeOtpForTesting()) {
                $response['dev_otp'] = $otp;
                $response['message'] = "OTP verification required. Dev OTP: {$otp}";
            }

            return response()->json($response);
        }

        $tokenName = $user->role === 'admin' ? 'admin-token' : 'customer-token';
        $token = $user->createToken($tokenName)->plainTextToken;
        $this->logAuthActivity($request, $user, 'API Login', 'User generated an API login token.');

        return response()->json($this->authTokenPayload($user, $token, 'Login successful'));
    }

    /**
     * Get authenticated user details.
     */
    public function me(Request $request)
    {
        return response()->json([
            'status' => true,
            'user' => $this->publicUser($request->user()),
        ]);
    }
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
            'captcha_token' => ['nullable', 'string'],
        ]);

        $email = Str::lower($credentials['email']);
        $attemptKey = $this->loginAttemptKey($request, $email);
        $attempts = (int) Cache::get($attemptKey, 0);

        if (Cache::has($this->loginLockKey($request, $email))) {
            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again after 15 minutes.'],
            ]);
        }

        if ($attempts >= 3 && $request->input('captcha_token') !== 'confirmed') {
            throw ValidationException::withMessages([
                'captcha' => ['Please confirm you are not a robot.'],
            ]);
        }

        if (! Auth::attempt(['email' => $email, 'password' => $credentials['password']], false)) {
            $this->recordFailedLogin($request, $email, $attempts + 1);
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        $request->session()->regenerate();

        $user = $request->user();
        $statusError = $this->accountStatusError($user);
        if ($statusError) {
            $this->logAuthActivity($request, $user, 'Login Blocked', $statusError);
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => [$statusError],
            ]);
        }

        $role = strtolower(trim($user->role ?? 'customer'));
        Auth::login($user, $role === 'customer' && (bool) $request->boolean('remember'));
        Cache::forget($attemptKey);
        $this->logAuthActivity($request, $user, 'Logged In', 'User logged in successfully.');

        $redirect = match ($role) {
            'superadmin', 'super_admin' => '/franchise-superadmin',
            'franchise', 'franchise_owner', 'franchise_admin' => '/franchise/dashboard',
            'staff' => '/franchise-superadmin/staff',
            'admin' => '/franchise-admin',
            default => '/account',
        };

        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Logged in successfully!',
                'user' => $user,
                'redirect' => $redirect,
            ]);
        }

        return redirect()->intended($redirect);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
        ]);

        $user = User::where('email', $validated['identifier'])
            ->orWhere('mobile_number', $validated['identifier'])
            ->first();

        if ($user) {
            $otp = (string) random_int(100000, 999999);
            Cache::put("password_reset_otp:{$user->id}", Hash::make($otp), now()->addMinutes(10));
            Log::info('Password reset OTP generated', ['user_id' => $user->id, 'identifier' => $validated['identifier'], 'otp' => $otp]);
        }

        $message = 'If this account exists, an OTP/reset link has been sent.';
        if (($otp ?? null) && $this->shouldExposeOtpForTesting()) {
            $message .= " Dev OTP: {$otp}";
        }

        return response()->json([
            'status' => true,
            'success' => true,
            'message' => $message,
            'dev_otp' => (($otp ?? null) && $this->shouldExposeOtpForTesting()) ? $otp : null,
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'identifier' => ['nullable', 'string', 'max:255'],
            'challenge_id' => ['nullable', 'string', 'max:100'],
            'otp' => ['required', 'digits:6'],
        ]);

        if (! empty($validated['challenge_id'])) {
            $challengeId = $validated['challenge_id'];
            $userId = Cache::get("api_login_challenge:{$challengeId}");
            $user = $userId ? User::find($userId) : null;
            $hashedOtp = Cache::get("api_login_otp:{$challengeId}");

            if (! $user || ! $hashedOtp || ! Hash::check($validated['otp'], $hashedOtp)) {
                return response()->json(['status' => false, 'message' => 'Invalid or expired OTP.'], 422);
            }

            Cache::forget("api_login_challenge:{$challengeId}");
            Cache::forget("api_login_otp:{$challengeId}");
            $token = $user->createToken($user->role === 'admin' ? 'admin-token' : 'secure-login-token')->plainTextToken;
            $this->logAuthActivity($request, $user, 'API Login', 'User completed OTP verification and generated a token.');

            return response()->json($this->authTokenPayload($user, $token, 'Login successful'));
        }

        if (empty($validated['identifier'])) {
            return response()->json(['status' => false, 'message' => 'Identifier is required.'], 422);
        }

        $user = User::where('email', $validated['identifier'])
            ->orWhere('mobile_number', $validated['identifier'])
            ->first();

        $valid = $user && ($hashedOtp = Cache::get("password_reset_otp:{$user->id}")) && Hash::check($validated['otp'], $hashedOtp);

        if (! $valid) {
            return response()->json(['status' => false, 'message' => 'Invalid or expired OTP.'], 422);
        }

        Cache::put("password_reset_verified:{$user->id}", true, now()->addMinutes(10));

        return response()->json(['status' => true, 'message' => 'OTP verified.']);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            'otp' => ['required', 'digits:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('email', $validated['identifier'])
            ->orWhere('mobile_number', $validated['identifier'])
            ->first();

        $valid = $user && ($hashedOtp = Cache::get("password_reset_otp:{$user->id}")) && Hash::check($validated['otp'], $hashedOtp);
        if (! $valid) {
            return response()->json(['status' => false, 'success' => false, 'message' => 'Invalid or expired OTP.'], 422);
        }

        $user->forceFill(['password' => Hash::make($validated['password'])])->save();
        Cache::forget("password_reset_otp:{$user->id}");
        Cache::forget("password_reset_verified:{$user->id}");
        $this->logAuthActivity($request, $user, 'Password Reset', 'User reset password with OTP.');

        return response()->json(['status' => true, 'success' => true, 'message' => 'Password reset successfully. Please login again.']);
    }

    public function requestMobileOtp(Request $request)
    {
        $validated = $request->validate([
            'mobile_number' => ['required', 'digits:10', 'regex:/^[6-9][0-9]{9}$/'],
        ]);

        $user = User::where('mobile_number', $validated['mobile_number'])->first();
        if ($user) {
            $otp = (string) random_int(100000, 999999);
            Cache::put("mobile_login_otp:{$user->id}", Hash::make($otp), now()->addMinutes(10));
            Log::info('Mobile login OTP generated', ['user_id' => $user->id, 'mobile_number' => $validated['mobile_number'], 'otp' => $otp]);
        }

        $message = 'If this mobile number exists, an OTP has been sent.';
        if (($otp ?? null) && $this->shouldExposeOtpForTesting()) {
            $message .= " Dev OTP: {$otp}";
        }

        return response()->json([
            'status' => true,
            'success' => true,
            'message' => $message,
            'dev_otp' => (($otp ?? null) && $this->shouldExposeOtpForTesting()) ? $otp : null,
        ]);
    }

    public function verifyMobileLogin(Request $request)
    {
        $validated = $request->validate([
            'mobile_number' => ['required', 'digits:10', 'regex:/^[6-9][0-9]{9}$/'],
            'otp' => ['required', 'digits:6'],
        ]);

        $user = User::where('mobile_number', $validated['mobile_number'])->first();
        $valid = $user && ($hashedOtp = Cache::get("mobile_login_otp:{$user->id}")) && Hash::check($validated['otp'], $hashedOtp);

        if (! $valid) {
            return response()->json(['status' => false, 'success' => false, 'message' => 'Invalid or expired OTP.'], 422);
        }

        if ($statusError = $this->accountStatusError($user)) {
            $this->logAuthActivity($request, $user, 'Mobile Login Blocked', $statusError);

            return response()->json([
                'status' => false,
                'success' => false,
                'message' => $statusError,
            ], 403);
        }

        Cache::forget("mobile_login_otp:{$user->id}");
        if ($request->hasSession()) {
            Auth::login($user, true);
            $request->session()->regenerate();
        }
        $this->logAuthActivity($request, $user, 'Mobile OTP Login', 'Customer mobile OTP login verified.');

        return response()->json([
            'status' => true,
            'success' => true,
            'message' => 'OTP verified. Redirecting...',
            'redirect' => $this->redirectPathForRole($user->role),
        ]);
    }

    public function googleStatus()
    {
        $configured = filled(config('services.google.client_id')) && filled(config('services.google.client_secret'));

        return response()->json([
            'configured' => $configured,
            'message' => $configured
                ? 'Google login is ready.'
                : 'Google login is not configured yet. Add Google OAuth credentials to enable it.',
            'redirect' => $configured ? '/auth/google' : null,
        ]);
    }

    public function loginActivity(Request $request)
    {
        if (! Schema::hasTable('activity_logs')) {
            return response()->json([
                'status' => true,
                'data' => [],
            ]);
        }

        $logs = DB::table('activity_logs')
            ->where('user_id', $request->user()->id)
            ->where('module', 'Auth')
            ->orderByDesc('created_at')
            ->limit(25)
            ->get();

        return response()->json([
            'status' => true,
            'data' => $logs,
        ]);
    }

    private function authTokenPayload(User $user, string $token, string $message): array
    {
        return [
            'status' => true,
            'message' => $message,
            'token' => $token,
            'user' => $this->publicUser($user),
            'redirect_to' => $this->redirectPathForRole($user->role),
        ];
    }

    private function publicUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status ?? 'active',
        ];
    }

    private function redirectPathForRole(?string $role): string
    {
        return match (strtolower(trim($role ?? 'customer'))) {
            'superadmin', 'super_admin' => '/franchise-superadmin',
            'franchise', 'franchise_owner', 'franchise_admin' => '/franchise/dashboard',
            'staff' => '/franchise-superadmin/staff',
            'admin' => '/franchise-admin',
            default => '/account',
        };
    }

    private function requiresOtp(string $role): bool
    {
        return in_array($role, ['superadmin', 'super_admin', 'franchise_admin', 'staff'], true);
    }

    private function shouldExposeOtpForTesting(): bool
    {
        return app()->environment(['local', 'development', 'testing']);
    }

    private function accountStatusError(User $user): ?string
    {
        $status = strtolower((string) ($user->status ?? 'active'));
        $role = strtolower((string) ($user->role ?? 'customer'));

        return match ($status) {
            'active', '' => null,
            'pending', 'pending_approval', 'review', 'under_review' => str_contains($role, 'franchise')
                ? 'Your franchise account is under review.'
                : 'Your account is pending approval.',
            'blocked' => 'Your account is blocked. Please contact support.',
            'suspended' => 'Your account is suspended. Please contact support.',
            'deleted' => 'This account is no longer available.',
            default => 'Your account is not active. Please contact support.',
        };
    }

    private function loginAttemptKey(Request $request, string $email): string
    {
        return 'login_attempts:' . sha1($email . '|' . $request->ip());
    }

    private function loginLockKey(Request $request, string $email): string
    {
        return 'login_lock:' . sha1($email . '|' . $request->ip());
    }

    private function recordFailedLogin(Request $request, string $email, int $attempts): void
    {
        Cache::put($this->loginAttemptKey($request, $email), $attempts, now()->addMinutes(15));

        if ($attempts >= 5) {
            Cache::put($this->loginLockKey($request, $email), true, now()->addMinutes(15));
        }

        $user = User::where('email', $email)->first();
        $this->logAuthActivity($request, $user, 'Failed Login', "Failed login attempt for {$email}.");
    }

    private function logAuthActivity(Request $request, ?User $user, string $action, string $description): void
    {
        if (! $user || ! Schema::hasTable('activity_logs')) {
            return;
        }

        $data = [
            'user_id' => $user?->id,
            'module' => 'Auth',
            'action' => $action,
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        foreach ([
            'description' => $description,
            'role' => $user?->role,
            'device_info' => substr((string) $request->userAgent(), 0, 255),
        ] as $column => $value) {
            if (Schema::hasColumn('activity_logs', $column)) {
                $data[$column] = $value;
            }
        }

        DB::table('activity_logs')->insert($data);
    }

    /**
     * Logout - revoke all tokens.
     */
    public function logout(Request $request)
    {
        $this->logAuthActivity($request, $request->user(), 'Logged Out', 'User logged out.');
        $request->user()->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logout successful',
        ]);
    }
}
