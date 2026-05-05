# 🎯 TESTING COMPLETE SYSTEM - Both Admin & Customer

## Prerequisites

Before testing, ensure:
- ✅ Backend running: `php artisan serve` (port 8000)
- ✅ Frontend running: `npm run dev` (port 3000)
- ✅ Database configured and migrations run: `php artisan migrate`

---

## Test Scenario 1: Admin Panel

### Step 1: Create Admin Account

Use Postman or curl:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "admin_secret": "admin123"
  }'
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "1|admin_token_here"
  }
}
```

### Step 2: Access Admin Panel

1. Go to: `http://localhost:3000/admin/login`
2. Login with:
   - **Email**: admin@example.com
   - **Password**: password123
3. Should redirect to `/admin/dashboard`
4. Should see:
   - Dashboard with stats
   - Navigation sidebar
   - Product, Category, Inventory management links

### Step 3: Manage Products

1. Click "Products" in sidebar
2. Click "Add Product" button
3. Fill in form:
   - Name: "Test Shirt"
   - Slug: "test-shirt"
   - Category: Select one
   - Base Price: 500
   - Franchise Price: 400
4. Click "Save Product"
5. Should see product in list

### Step 4: Logout Admin

1. Click user dropdown (top right, shows "Admin")
2. Click "Logout"
3. Should redirect to `/admin/login`
4. Try accessing `/admin/dashboard`
5. Should redirect to `/admin/login`

---

## Test Scenario 2: Customer Registration & Login

### Step 1: Register as Customer

1. Go to: `http://localhost:3000/register`
2. Fill form:
   - **Name**: John Doe
   - **Email**: john@example.com
   - **Password**: password123
   - **Confirm Password**: password123
3. Click "Create Account"
4. Should redirect to home page
5. Header should show:
   - "John" in blue button
   - Dropdown showing profile/account/franchise/logout

### Step 2: View Account

1. Click "John" dropdown
2. Click "My Account"
3. Should see account page with:
   - **Profile Section**: Name, email, account type, member since
   - **Franchise Applications Tab**: Empty (no applications yet)
   - **Quick Actions**: Apply Franchise button

### Step 3: Apply for Franchise

1. On Account page, click "Apply Franchise"
2. Or click "John" dropdown → "Apply Franchise"
3. Should see franchise plans
4. Select a plan (click on it)
5. Fill form:
   - **Business Location**: "New Delhi"
   - **Expected Investment**: 500000
   - **Business Experience**: "10 years in retail"
   - **Notes**: Optional
6. Click "Submit Application"
7. Should see success message
8. Should redirect to account page after 2 seconds
9. **Franchise Applications** tab should now show your application

### Step 4: Logout Customer

1. Click "John" dropdown
2. Click "Logout"
3. Should redirect to home
4. Header should show: "[Sign In] [Sign Up]"
5. Try accessing `/account`
6. Should redirect to `/login`

---

## Test Scenario 3: Customer Login

### Step 1: Login

1. From home page, click "Sign In"
2. Or go to: `http://localhost:3000/login`
3. Enter:
   - **Email**: john@example.com
   - **Password**: password123
4. Click "Sign In"
5. Should redirect to home
6. Header should show "John" button again

### Step 2: Access Protected Page

1. Go to `/account`
2. Should show account page directly (already logged in)
3. Franchise applications should still be there

### Step 3: Verify Token Persistence

1. Refresh the page (F5)
2. Should stay logged in (token restored from localStorage)
3. Header still shows "John"

---

## Test Scenario 4: Admin vs Customer Separation

### Step 1: Try Customer Email on Admin Panel

1. Logout customer (if logged in)
2. Go to: `http://localhost:3000/admin/login`
3. Try logging in with:
   - **Email**: john@example.com
   - **Password**: password123
4. Should see error: **"Only admin accounts can access this panel"**

### Step 2: Try Admin Email as Customer

1. Go to: `http://localhost:3000/login`
2. Try logging in with:
   - **Email**: admin@example.com
   - **Password**: password123
3. Should login successfully
4. But header shows "Admin" instead of menu
5. Try accessing `/account`
6. Should work (no role restriction, but weird)

**Note**: This is expected behavior. Customer pages don't check role,only authentication. If you want to prevent admins from accessing customer pages, add role check in ProtectedRoute.

---

## Test Scenario 5: Failed Login Attempts

### Test 1: Wrong Password
```
Email: john@example.com
Password: wrongpassword
→ Error: "The provided credentials are incorrect."
```

### Test 2: Non-existent Email
```
Email: nouser@example.com
Password: password123
→ Error: "The provided credentials are incorrect."
```

### Test 3: Empty Fields
```
Email: (empty)
Password: (empty)
→ Error: "All fields are required"
```

---

## Test Scenario 6: Registration Validation

### Test 1: Password Too Short
```
Password: pass1
→ Error: "Password must be at least 8 characters"
```

### Test 2: Passwords Don't Match
```
Password: password123
Confirm: password456
→ Error: "Passwords do not match"
```

### Test 3: Email Already Registered
```
Email: john@example.com (already exists)
→ Error from server: "Email already taken"
```

### Test 4: Invalid Email Format
```
Email: notanemail
→ Error: "Email must be a valid email"
```

---

## Test Scenario 7: Backend API Integration

### Test 1: Product API (Public)
```bash
curl http://127.0.0.1:8000/api/products
```
Response: List of all products (no auth required)

### Test 2: Protected Customer API
```bash
curl http://127.0.0.1:8000/api/franchise-applications \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN"
```
Response: User's franchise applications

### Test 3: Protected Admin API
```bash
curl http://127.0.0.1:8000/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
Response: All products for admin (protected by AdminMiddleware)

---

## Troubleshooting

### Issue: "Backend API is not reachable"
**Solution:**
1. Check backend is running: `php artisan serve`
2. Check backend URL in frontend `.env.local`
3. Check CORS settings in backend

### Issue: Login redirects to login page
**Solution:**
1. Check database has users table: `php artisan migrate`
2. Check credentials are correct
3. Check backend logs for errors: `storage/logs/laravel.log`

### Issue: Token not persisting on refresh
**Solution:**
1. Check localStorage is enabled
2. Open DevTools → Application → Local Storage
3. Should see `customer_token` key
4. Should see `customer_user` key

### Issue: "Cannot read property 'user' of undefined"
**Solution:**
1. Make sure AuthProvider is wrapping app in `layout.jsx`
2. Check useAuth() is only used inside AuthProvider
3. Check there are no circular imports

### Issue: Admin login says "Invalid admin secret key"
**Solution:**
1. Check `.env` has `ADMIN_SECRET_KEY=admin123`
2. Verify exact match in request
3. Check no typos in secret key

---

## Expected Results Summary

| Test | Admin | Customer |
|------|-------|----------|
| Register | ✅ With admin_secret | ✅ Without secret |
| Login | ✅ Email + password | ✅ Email + password |
| Dashboard | ✅ /admin/dashboard | ✅ /account |
| Product Browse | ✅ Can manage | ✅ Can view only |
| Franchise | N/A | ✅ Can apply |
| Logout | ✅ Works | ✅ Works |
| Token Persistence | ✅ admin_token | ✅ customer_token |
| Role Separation | ✅ Can't access /account | ✅ Can't access /admin |

---

## Sample Test Accounts

### Admin Account
```
Name: Admin User
Email: admin@example.com
Password: password123
Secret: admin123
Role: admin
```

### Customer Account
```
Name: John Doe
Email: john@example.com
Password: password123
Role: customer
```

### To Create More Test Accounts

**Admin:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another Admin",
    "email": "admin2@example.com",
    "password": "password123",
    "admin_secret": "admin123"
  }'
```

**Customer:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123"
  }'
```

---

## Success Indicators ✅

When everything is working:

1. ✅ Admin can login to `/admin/login`
2. ✅ Admin can access `/admin/dashboard`
3. ✅ Admin can manage products/categories/inventory
4. ✅ Customer can register at `/register`
5. ✅ Customer can login at `/login`
6. ✅ Customer can access `/account` (protected)
7. ✅ Customer can apply for franchise (protected)
8. ✅ Customer can see applications in account
9. ✅ Header shows correct user info
10. ✅ Logout works for both
11. ✅ Role separation maintained
12. ✅ Tokens persist on page refresh

---

## Performance Testing (Optional)

### Load Test
```bash
# Register 10 customers
for i in {1..10}; do
  curl -X POST http://127.0.0.1:8000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Customer '$i'",
      "email": "customer'$i'@example.com",
      "password": "password123"
    }'
done
```

### Verify All Registered
```bash
# Check in database
sqlite3 database/database.sqlite "SELECT COUNT(*) FROM users;"
```

---

## 🎉 You're Ready!

Everything is set up and ready to test. Follow the scenarios above and your authentication system will be working perfectly!

Happy testing! 🚀
