# Admin Panel & Authentication - Complete Overview

## 🎯 What Was Built

A complete admin panel with authentication system for managing:
- **Products** - Create, read, update, delete products
- **Categories** - Organize products into categories
- **SKUs** - Manage product variations (size, color)
- **Inventory** - Track and update stock levels

## 📋 Backend Architecture

### Authentication System
- Uses Laravel Sanctum for token-based API authentication
- Supports admin-only registration with secret key
- User model has `role` field: admin, customer, franchise_owner

### Files Created

1. **AuthController** - Login, register, logout, profile
2. **AdminProductController** - Product CRUD operations
3. **AdminCategoryController** - Category CRUD operations
4. **AdminSkuController** - SKU/variation CRUD operations
5. **AdminInventoryController** - Stock management
6. **AdminMiddleware** - Protects routes (admin only)

### Protected Routes
All admin routes require:
1. Valid Sanctum token
2. User role = 'admin'

## 🎨 Frontend Architecture

### Pages Created

1. **/admin/login** - Admin login page
2. **/admin/dashboard** - Main dashboard with stats
3. **/admin/products** - Product management
4. **/admin/categories** - Category management
5. **/admin/inventory** - Inventory/stock management

### Components

1. **AdminSidebar** - Navigation menu
2. **DashboardStats** - Statistics display

### Features

- **Authentication**: Login/logout with token persistence
- **Dashboard**: Quick overview with key metrics
- **CRUD Operations**: Full create, read, update, delete for all resources
- **Search & Filter**: Find products and inventory items
- **Inline Editing**: Edit stock quantities without modal
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on desktop, tablet, mobile

## 🔐 Security Flow

```
User (Admin)
    ↓
[Admin Login Page]
    ↓
POST /api/auth/login (email + password)
    ↓
Backend validates credentials + role check
    ↓
Returns JWT token + user data
    ↓
Frontend stores token in localStorage
    ↓
[Protected Pages] - Include token in Authorization header
    ↓
Backend validates token + middleware checks admin role
    ↓
Executes admin-only operations
```

## 🚀 How to Use

### Step 1: Create First Admin User (Backend)

Use curl or Postman:

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "password123",
    "admin_secret": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "user": { "id": 1, "name": "Admin Name", "email": "admin@example.com", "role": "admin" },
    "token": "1|abc123def456..."
  }
}
```

### Step 2: Access Admin Panel

1. Start backend: `php artisan serve` (port 8000)
2. Start frontend: `npm run dev` (port 3000)
3. Go to: `http://localhost:3000/admin/login`
4. Login with credentials from Step 1

### Step 3: Manage Your Store

- **Dashboard**: See overview stats
- **Products**: Add, edit, delete products
- **Categories**: Create and organize categories
- **Inventory**: Track and update stock levels

## 📊 Database Schema

### Users Table
```
- id
- name
- email (unique)
- password (hashed)
- role (enum: admin, customer, franchise_owner)
- email_verified_at
- timestamps
```

### Products Table
```
- id
- category_id (foreign key)
- name
- slug (unique)
- description
- base_price (decimal)
- franchise_price (decimal)
- is_active (boolean)
- timestamps
```

### Categories Table
```
- id
- name
- slug (unique)
- description
- is_active (boolean)
- timestamps
```

### SKUs Table (Product Variations)
```
- id
- product_id (foreign key)
- sku_code (unique)
- size
- color
- timestamps
```

### Inventory Table
```
- id
- sku_id (foreign key)
- stock_quantity
- reorder_level
- timestamps
```

## 🔄 API Endpoints Summary

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Products (Admin)
```
GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/{id}
PUT    /api/admin/products/{id}
DELETE /api/admin/products/{id}
POST   /api/admin/products/bulk-status
```

### Categories (Admin)
```
GET    /api/admin/categories
POST   /api/admin/categories
GET    /api/admin/categories/{id}
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

### SKUs (Admin)
```
GET    /api/admin/products/{product_id}/skus
POST   /api/admin/products/{product_id}/skus
PUT    /api/admin/products/{product_id}/skus/{sku_id}
DELETE /api/admin/products/{product_id}/skus/{sku_id}
```

### Inventory (Admin)
```
GET    /api/admin/skus/{sku_id}/inventory
PUT    /api/admin/skus/{sku_id}/inventory
GET    /api/admin/inventory/status
```

## ⚙️ Configuration

### Backend (.env)
```
ADMIN_SECRET_KEY=admin123
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=your_db
DB_USERNAME=root
DB_PASSWORD=
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
```

## 🛡️ Error Handling

### Authentication Errors
- **Invalid credentials** → 422 Unprocessable Entity
- **Wrong role** → 403 Forbidden
- **Expired token** → Redirect to login page

### Resource Errors
- **Not found** → 404
- **Validation failed** → 422 with error messages
- **Cannot delete** → 422 with reason

## 📱 Responsive Design

- **Mobile**: Hamburger menu, single column layout
- **Tablet**: Two column layout, collapsible sidebar
- **Desktop**: Full sidebar, multi-column layout

## 🔄 Data Flow Example: Adding a Product

```
Admin UI (Products page)
    ↓
Fill form (name, price, category, etc.)
    ↓
Click "Add Product" button
    ↓
POST /api/admin/products with product data + token
    ↓
Backend validates data
    ↓
Backend checks token + admin role
    ↓
Create product in database
    ↓
Return created product
    ↓
Frontend refreshes product list
    ↓
Admin sees new product in table
```

## 🎯 Next Steps for Your Team

1. **Backend Team**: 
   - Deploy these controllers and routes
   - Set ADMIN_SECRET_KEY in .env
   - Create database migrations (already set up)

2. **Frontend Team**:
   - Set NEXT_PUBLIC_API_BASE in .env.local
   - Use admin panel to manage products
   - No changes needed to customer-facing store

3. **Both Teams**:
   - Keep API contract stable
   - Document any custom endpoints
   - Test authentication flow before launch

## 🚨 Important Notes

1. **Admin Secret Key**: Keep it private, don't commit to repository
2. **Token Storage**: Current implementation uses localStorage (suitable for admin)
3. **CORS**: Make sure backend allows frontend origin
4. **SSL**: Use HTTPS in production
5. **Rate Limiting**: Consider adding rate limits to auth endpoints

## ✅ Everything is Dynamic

- ✅ Products stored in database
- ✅ Categories stored in database
- ✅ Inventory stored in database
- ✅ Prices are dynamic
- ✅ Stock levels are dynamic
- ✅ Product images are dynamic
- ✅ Product variations (SKUs) are dynamic

**No hardcoding required!**
