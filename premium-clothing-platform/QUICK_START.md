# 🚀 QUICK START GUIDE - Admin Panel & Authentication

## Step 1: Backend Setup

### Update `.env` file in backend folder:

```env
APP_KEY=<generate with: php artisan key:generate>
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=iho_clothing
DB_USERNAME=root
DB_PASSWORD=<your-password>
ADMIN_SECRET_KEY=admin123
```

### Run migrations:

```bash
cd backend
php artisan migrate
```

### Start backend server:

```bash
php artisan serve
```

Backend will run on: `http://127.0.0.1:8000`

---

## Step 2: Create First Admin User

Use **Postman** or **curl** to register an admin:

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

**Response (save the token):**
```json
{
  "data": {
    "user": { "id": 1, "name": "Admin User", "email": "admin@example.com", "role": "admin" },
    "token": "1|abc123xyz789..."
  }
}
```

---

## Step 3: Frontend Setup

### Create/Update `.env.local` in frontend folder:

```env
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
```

### Install dependencies (if not done):

```bash
cd frontend
npm install
```

### Start frontend server:

```bash
npm run dev
```

Frontend will run on: `http://127.0.0.1:3000`

---

## Step 4: Access Admin Panel

1. Open browser: `http://localhost:3000/admin/login`
2. Login with:
   - **Email**: admin@example.com
   - **Password**: password123

3. You'll see the dashboard with options to:
   - Manage Products
   - Manage Categories
   - Manage Inventory

---

## ✨ What's Available

### Product Management
- ✅ Add new products
- ✅ Edit existing products
- ✅ Delete products
- ✅ Set prices (base & franchise)
- ✅ Assign to categories
- ✅ Activate/deactivate

### Category Management
- ✅ Create categories
- ✅ Edit categories
- ✅ Delete categories
- ✅ Organize products

### Inventory Management
- ✅ View stock levels
- ✅ Update quantities
- ✅ See low stock alerts
- ✅ Set reorder levels

---

## 🔐 Authentication Details

### Login Endpoint
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

### Protected Endpoints
All admin endpoints require:
```
Authorization: Bearer {token}
```

### Token Storage
- Stored in: `localStorage.admin_token`
- User data in: `localStorage.admin_user`

---

## 🐛 Troubleshooting

### Backend Connection Error
- Make sure backend is running: `php artisan serve`
- Check port 8000 is not in use
- Check firewall settings

### Login Failed
- Verify email and password are correct
- Make sure user has 'admin' role
- Check database has users table (run migrations)

### Admin Page Blank/Loading
- Open browser console (F12) for errors
- Check NEXT_PUBLIC_API_BASE is correct
- Make sure backend is accessible

### CORS Error
- Add to `backend/config/cors.php`:
  ```
  'allowed_origins' => ['http://127.0.0.1:3000', 'localhost:3000'],
  ```

---

## 📁 File Structure Summary

```
Backend Changes:
├── app/Http/Controllers/
│   ├── AuthController.php
│   ├── AdminProductController.php
│   ├── AdminCategoryController.php
│   ├── AdminSkuController.php
│   └── AdminInventoryController.php
├── app/Http/Middleware/
│   └── AdminMiddleware.php
└── routes/api.php (updated)

Frontend Changes:
└── app/admin/
    ├── login/page.jsx
    ├── dashboard/page.jsx
    ├── products/page.jsx
    ├── categories/page.jsx
    ├── inventory/page.jsx
    └── components/
        ├── AdminSidebar.jsx
        └── DashboardStats.jsx
```

---

## 🔄 Backend Team Notes

1. All admin routes are protected by `AdminMiddleware`
2. Requires: `auth:sanctum` + admin role check
3. Uses Sanctum for token management
4. All operations are fully RESTful
5. Database operations are atomic and validated

---

## 🎨 Frontend Team Notes

1. All pages require admin authentication
2. Token automatically redirects to login if missing
3. Uses Tailwind CSS for styling
4. Responsive design for all devices
5. Lucide React for icons

---

## ✅ Testing Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] Admin user created successfully
- [ ] Can login with admin credentials
- [ ] Dashboard loads and shows stats
- [ ] Can add a product
- [ ] Can add a category
- [ ] Can manage inventory
- [ ] Can logout successfully

---

## 📞 Support

For detailed documentation, see:
- `backend/ADMIN_PANEL_SETUP.md` - Backend configuration
- `frontend/ADMIN_PANEL_SETUP.md` - Frontend configuration
- `ADMIN_PANEL_COMPLETE_GUIDE.md` - Full system overview

---

## 🎯 Summary

| Component | URL | Status |
|-----------|-----|--------|
| Backend API | http://127.0.0.1:8000 | ✅ Ready |
| Frontend Store | http://127.0.0.1:3000 | ✅ Ready |
| Admin Login | http://127.0.0.1:3000/admin/login | ✅ Ready |
| Admin Dashboard | http://127.0.0.1:3000/admin/dashboard | ✅ Ready |
| Product Manager | http://127.0.0.1:3000/admin/products | ✅ Ready |
| Category Manager | http://127.0.0.1:3000/admin/categories | ✅ Ready |
| Inventory Manager | http://127.0.0.1:3000/admin/inventory | ✅ Ready |

You're all set! 🚀
