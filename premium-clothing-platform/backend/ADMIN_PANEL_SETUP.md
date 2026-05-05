# Backend Admin Panel Setup

## Environment Variables

Add these to your `.env` file in the backend folder:

```
ADMIN_SECRET_KEY=your-secret-admin-key-here
```

This secret key is used to register new admin users for security.

## Database Configuration

The users table already has a `role` field with enum values:
- `admin` - Full admin panel access
- `customer` - Regular customer
- `franchise_owner` - Franchise owner

## API Endpoints

### Authentication Endpoints

```
POST /api/auth/register
- Body: { name, email, password, admin_secret }
- Response: { user, token }
- Note: Requires ADMIN_SECRET_KEY in admin_secret field

POST /api/auth/login
- Body: { email, password }
- Response: { user, token }
- Note: Only admins can login

POST /api/auth/logout
- Headers: Authorization: Bearer {token}
- Response: { message }

GET /api/auth/me
- Headers: Authorization: Bearer {token}
- Response: { user }
```

### Admin Product Endpoints

```
GET /api/admin/products
- Headers: Authorization: Bearer {token}
- Query: page={number}, per_page={number}
- Response: Paginated product list

POST /api/admin/products
- Body: { name, slug, description, category_id, base_price, franchise_price, is_active }
- Response: Created product

GET /api/admin/products/{id}
- Response: Product details with SKUs and images

PUT /api/admin/products/{id}
- Body: Partial product data to update
- Response: Updated product

DELETE /api/admin/products/{id}
- Response: Deleted product

POST /api/admin/products/bulk-status
- Body: { product_ids: [1,2,3], is_active: true/false }
- Response: Bulk update result
```

### Admin Category Endpoints

```
GET /api/admin/categories
- Response: All categories with product count

POST /api/admin/categories
- Body: { name, slug, description, is_active }
- Response: Created category

GET /api/admin/categories/{id}
- Response: Category details

PUT /api/admin/categories/{id}
- Body: Partial category data
- Response: Updated category

DELETE /api/admin/categories/{id}
- Response: Deleted category
```

### Admin SKU Endpoints

```
GET /api/admin/products/{product_id}/skus
- Response: All SKUs for product

POST /api/admin/products/{product_id}/skus
- Body: { sku_code, size, color, stock_quantity }
- Response: Created SKU with inventory

PUT /api/admin/products/{product_id}/skus/{sku_id}
- Body: Partial SKU data or stock_quantity
- Response: Updated SKU

DELETE /api/admin/products/{product_id}/skus/{sku_id}
- Response: Deleted SKU
```

### Admin Inventory Endpoints

```
GET /api/admin/skus/{sku_id}/inventory
- Response: Inventory for specific SKU

PUT /api/admin/skus/{sku_id}/inventory
- Body: { stock_quantity, reorder_level }
- Response: Updated inventory

GET /api/admin/inventory/status
- Query: low_stock={true/false}
- Response: Inventory status for all SKUs (filtered if needed)
```

## Creating First Admin User

Use an API client (Postman, curl, etc.) to register:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "secure_password_min_8_chars",
    "admin_secret": "your-secret-admin-key-here"
  }'
```

Copy the returned token and use it in the frontend.

## Middleware

Admin middleware checks:
1. User is authenticated via Sanctum
2. User role is exactly 'admin'

Returns 403 Unauthorized if either condition fails.
