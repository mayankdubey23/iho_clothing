# 🔐 COMPLETE AUTHENTICATION SYSTEM

## Overview

Your website now has **COMPLETE AUTHENTICATION** for both admins and customers:

```
┌─────────────────────────────────────────────────────┐
│           AUTHENTICATION SYSTEM                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ADMIN AUTHENTICATION                               │
│  ├─ /admin/login              → Admin login        │
│  ├─ /admin/dashboard          → Admin dashboard    │
│  ├─ /admin/products           → Manage products    │
│  ├─ Protected by: AdminMiddleware + admin role     │
│  └─ Token: localStorage.admin_token                │
│                                                      │
│  CUSTOMER AUTHENTICATION                            │
│  ├─ /login                    → Customer login     │
│  ├─ /register                 → Customer register  │
│  ├─ /account                  → Customer account   │
│  ├─ /franchise-apply          → Apply franchise    │
│  ├─ Protected by: ProtectedRoute + customer auth  │
│  └─ Token: localStorage.customer_token             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Authentication Architecture

### Backend (Laravel)

**Single AuthController handling both:**

```
POST /api/auth/register
├─ Without admin_secret → Creates customer account
└─ With admin_secret    → Creates admin account

POST /api/auth/login
├─ Returns token for any user (admin or customer)
├─ Frontend routes them appropriately
└─ Token is role-agnostic

POST /api/auth/logout
└─ Works for both

GET /api/auth/me
└─ Works for both
```

### Frontend (Next.js)

**Separate flows:**

```
AuthContext
├─ Manages customer auth state
├─ Stores customer_token in localStorage
├─ Provides useAuth() hook
└─ Available to entire app via AuthProvider

ProtectedRoute
├─ Wrapper component for customer pages
├─ Redirects to /login if not authenticated
└─ Shows loading state

Admin Auth (Separate)
├─ Independent of AuthContext
├─ Stores admin_token in localStorage
├─ Uses AdminMiddleware on backend
└─ Completely separate from customer auth
```

---

## 🚀 CUSTOMER AUTHENTICATION - Complete Flow

### 1. Registration

**Frontend Page**: `/register`

```jsx
// User enters: name, email, password, confirm password
// Frontend calls:
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  // NO admin_secret = creates customer
}

// Backend response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "1|abc123xyz789..."
  }
}

// Frontend:
// 1. Stores token in localStorage.customer_token
// 2. Stores user in context
// 3. Redirects to /
```

### 2. Login

**Frontend Page**: `/login`

```jsx
// User enters: email, password
// Frontend calls:
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Backend:
// 1. Finds user by email
// 2. Validates password
// 3. Returns token (any role)

// Frontend:
// 1. Checks if role === 'customer'
// 2. If admin, shows error "Only admin accounts can access this panel"
// 3. If customer, stores token and user in localStorage
// 4. AuthContext auto-restores on page load
// 5. Redirects to home
```

### 3. Protected Pages

**All protected pages use `<ProtectedRoute>` wrapper:**

```jsx
import { ProtectedRoute } from '@/app/components/ProtectedRoute';

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <YourContent />
    </ProtectedRoute>
  );
}

// If not logged in:
// → Shows loading state
// → Redirects to /login automatically
```

### 4. Logout

```jsx
// User clicks logout
// Frontend calls:
POST /api/auth/logout
Authorization: Bearer {token}

// Backend:
// 1. Validates token
// 2. Revokes token (Sanctum)
// 3. Returns success

// Frontend:
// 1. Clears localStorage.customer_token
// 2. Clears user from context
// 3. Redirects to home
// 4. Header shows login/register buttons
```

---

## 💻 Customer Pages

### 1. **Login Page** (`/login`)
- Email & password input
- "Create one" link to register
- Error messages
- Direct to homepage after login

### 2. **Register Page** (`/register`)
- Name, email, password fields
- Password validation (min 8 chars)
- Password confirmation
- Auto-login after registration
- Link to login page

### 3. **Account Page** (`/account`) - Protected
- Profile information display
- View franchise applications
- Quick action buttons
- Logout button

### 4. **Franchise Apply Page** (`/franchise-apply`) - Protected
- Select franchise plan
- Fill application form
- View plan details
- Submit and get confirmation

---

## 🎛️ Navigation Header

The store header now shows:

**If NOT logged in:**
```
[Sign In] [Sign Up] [Cart (0)]
```

**If logged in:**
```
[John] ▼ [Cart (2)]

Dropdown menu:
├─ Profile: john@example.com
├─ My Account
├─ Apply Franchise
└─ Logout
```

---

## 🔧 Using AuthContext in Components

```jsx
import { useAuth } from '@/app/context/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout, getToken } = useAuth();

  // Check if authenticated
  if (!isAuthenticated) {
    return <p>Please login</p>;
  }

  // Use user data
  return <p>Welcome, {user.name}!</p>;

  // Call API with token
  const token = getToken();
  const response = await fetch('/api/endpoint', {
    headers: { Authorization: `Bearer ${token}` }
  });

  // Logout
  const handleLogout = async () => {
    await logout();
    // User is now logged out
  };
}
```

---

## 🛡️ Security Implementation

### Token Management
- ✅ Generated by Laravel Sanctum
- ✅ Stored in localStorage (admin-friendly)
- ✅ Sent in Authorization header
- ✅ Auto-logout on 401 responses
- ✅ Revoked on logout

### Password Security
- ✅ Min 8 characters required
- ✅ Hashed with bcrypt (Laravel)
- ✅ Never stored in localStorage
- ✅ HTTPS required in production

### Role-Based Access
- ✅ Backend: AdminMiddleware checks role
- ✅ Frontend: ProtectedRoute checks context
- ✅ Admin and Customer completely separate
- ✅ Can't access admin panel as customer

### Frontend Validation
- ✅ Email format checked
- ✅ Password confirmation matched
- ✅ Name required
- ✅ All inputs sanitized

---

## 📋 Testing Checklist

### Customer Registration
- [ ] Go to `/register`
- [ ] Fill form with name, email, password
- [ ] Click "Create Account"
- [ ] Should redirect to home
- [ ] Header should show user name
- [ ] Refresh page - should stay logged in

### Customer Login
- [ ] Logout first (if logged in)
- [ ] Go to `/login`
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] Should redirect to home
- [ ] Header should show user name

### Account Page
- [ ] Go to `/account` (auto-redirects to login if needed)
- [ ] Should show profile information
- [ ] Should show franchise applications tab
- [ ] Click "Apply Franchise" button
- [ ] Should redirect to franchise-apply page

### Franchise Application
- [ ] Go to `/franchise-apply`
- [ ] Should show franchise plans
- [ ] Select a plan
- [ ] Fill application form
- [ ] Click "Submit Application"
- [ ] Should show success message
- [ ] Should redirect to account page

### Protected Routes
- [ ] Try accessing `/account` without login
- [ ] Should redirect to `/login`
- [ ] Try accessing `/franchise-apply` without login
- [ ] Should redirect to `/login`

### Admin vs Customer
- [ ] Register as customer
- [ ] Try going to `/admin/dashboard`
- [ ] Should redirect to `/admin/login`
- [ ] Go to `/admin/login`
- [ ] Try logging in with customer credentials
- [ ] Should show error: "Only admin accounts can access this panel"

### Logout
- [ ] Click user dropdown
- [ ] Click "Logout"
- [ ] Should redirect to home
- [ ] Header should show "Sign In" "Sign Up"
- [ ] Going to `/account` should redirect to `/login`

---

## 📂 File Structure

```
Frontend Authentication Files:
├── app/
│   ├── context/
│   │   └── AuthContext.jsx          ← Auth state management
│   ├── components/
│   │   └── ProtectedRoute.jsx        ← Route protection
│   ├── login/
│   │   └── page.jsx                  ← Customer login
│   ├── register/
│   │   └── page.jsx                  ← Customer registration
│   ├── account/
│   │   └── page.jsx                  ← Customer account (protected)
│   ├── franchise-apply/
│   │   └── page.jsx                  ← Franchise application (protected)
│   ├── admin/
│   │   ├── login/page.jsx            ← Admin login
│   │   └── dashboard/page.jsx        ← Admin dashboard (protected)
│   ├── layout.jsx                    ← Wrapped with AuthProvider
│   └── Storefront.jsx                ← Updated with auth header
```

```
Backend Authentication Files:
├── app/Http/Controllers/
│   ├── AuthController.php            ← Handles login/register/logout
│   ├── AdminMiddleware.php           ← Admin route protection
│   └── ...other controllers
├── routes/
│   └── api.php                       ← Auth routes + admin routes
└── app/Models/
    └── User.php                      ← User model with roles
```

---

## 🎯 API Endpoints Summary

### Authentication Endpoints

```
POST /api/auth/register
├─ Body: { name, email, password }
├─ Optional: { admin_secret } for admin registration
└─ Returns: { user, token }

POST /api/auth/login
├─ Body: { email, password }
├─ Returns: { user, token } (for any role)
└─ Frontend routes based on role

POST /api/auth/logout
├─ Headers: Authorization: Bearer {token}
└─ Revokes token

GET /api/auth/me
├─ Headers: Authorization: Bearer {token}
└─ Returns: Current user
```

### Customer Protected Endpoints

```
GET /api/franchise-plans          → Viewed by anyone
GET /api/franchise-plans/{id}     → Viewed by anyone

GET /api/user                     → Get logged-in user
GET /api/franchise-applications   → Get user's applications
POST /api/franchise-applications  → Submit application
GET /api/franchise-applications/{id} → Get application details
```

### Admin Protected Endpoints

```
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/{id}
DELETE /api/admin/products/{id}
... (all admin operations)
```

---

## 🔄 User Flow Diagram

```
New Visitor
    ↓
Browse Store (no auth needed)
    ↓
Want to Apply Franchise?
    ├─ No → Continue shopping
    └─ Yes → Redirects to /login
              ↓
          Not registered? → /register → Create account
              ↓
          Enter credentials
              ↓
          Validates & creates customer account
              ↓
          Redirects to / (home, logged in)
              ↓
          Header shows: [John ▼] [Cart]
              ↓
          Click "Apply Franchise" or Account
              ↓
          /franchise-apply or /account page
              ↓
          Fill & submit
              ↓
          Success! ✅
```

---

## ✨ Features Now Available

✅ **Customer Registration** - Public signup
✅ **Customer Login** - Email/password login
✅ **Protected Account Page** - View profile and applications
✅ **Franchise Application** - Apply for franchise (protected)
✅ **Auto-Login/Logout** - Token persistence
✅ **Role-Based Access** - Admin vs Customer separation
✅ **Responsive Navigation** - Auth header with user menu
✅ **Error Handling** - User-friendly messages
✅ **Token Management** - Automatic persistence and cleanup

---

## 🚀 Everything Ready!

Your website now has:

1. ✅ Admin Panel with login
2. ✅ Customer authentication (login/register)
3. ✅ Protected customer pages
4. ✅ Franchise application system
5. ✅ Completely separate admin and customer flows
6. ✅ Full database integration
7. ✅ Dynamic product/category/inventory management

**You're ready to launch!** 🎉
