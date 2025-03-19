# Hotel POS System API Documentation

## Overview
The **Hotel POS System** enables administrators to create and manage hotels for subscribed hotel owners. The system allows hotel owners to manage their hotel's employees, rooms, and services. Guests can check in, use hotel services, and pay their total bill upon checkout.

This documentation provides details on the **Admin Modules**, including authentication, user management, and hotel creation.

---
## Authentication

### Admin Login
**Endpoint:** `POST /api/v1.0/admin/login`

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1.0/admin/login \  
-H "Content-Type: application/json" \  
-d '{
  "email": "john.smith@example.com",
  "password": "SecurePass123!"
}' -c cookies.txt
```

**Response:**
```json
{
  "token": "your_access_token",
  "expires_in": 3600
}
```

### Refresh Token
**Endpoint:** `POST /api/v1.0/admin/refresh-token`

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1.0/admin/refresh-token \  
-H "Content-Type: application/json" \  
-b cookies.txt
```

**Response:**
```json
{
  "token": "new_access_token",
  "expires_in": 3600
}
```

---
## Admin Management

### Create Admin
**Endpoint:** `POST /api/v1.0/admin/create`

**Request:**
```bash
curl -X POST http://localhost:8000/api/v1.0/admin/create \  
-H "Content-Type: application/json" \  
-b cookies.txt \  
-d '{
  "name": "Support Staff",
  "email": "support@example.com",
  "phone": "+1-555-987-6544",
  "role": "support_staff",
  "permissions": ["support_tickets", "view_all_data"],
  "password": "StaffPass123!"
}'
```

**Response:**
```json
{
  "id": "67d9de4c740f3d1963010330",
  "name": "Support Staff",
  "email": "support@example.com",
  "phone": "+1-555-987-6544",
  "role": "support_staff",
  "status": "active"
}
```

### Get Admin List
**Endpoint:** `POST /api/v1.0/admin?page=1&limit=10`

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1.0/admin?page=1&limit=10" \  
-H "Content-Type: application/json" \  
-b cookies.txt
```

**Response:**
```json
{
  "admins": [
    {
      "id": "67d9de4c740f3d1963010330",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "admin"
    },
    {
      "id": "67d9de4c740f3d1963010331",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "hotel_owner"
    }
  ],
  "total": 2
}
```

### Update Admin
**Endpoint:** `PUT /api/v1.0/admin/{admin_id}`

**Request:**
```bash
curl -X PUT http://localhost:8000/api/v1.0/admin/67d9de4c740f3d1963010330 \  
-H "Content-Type: application/json" \  
-b cookies.txt \  
-d '{
  "name": "Updated Name",
  "phone": "+1-555-987-6545",
  "status": "active"
}'
```

**Response:**
```json
{
  "id": "67d9de4c740f3d1963010330",
  "name": "Updated Name",
  "phone": "+1-555-987-6545",
  "status": "active"
}
```

### Delete Admin
**Endpoint:** `DELETE /api/v1.0/admin/{admin_id}`

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/v1.0/admin/67d9fa6aa10df8d12913262d \  
-H "Content-Type: application/json" \  
-b cookies.txt
```

**Response:**
```json
{
  "message": "Admin deleted successfully"
}
```

---
## Next Steps
This document covers the **Admin Modules** of the **Hotel POS System**. Upcoming sections will include:
- **Hotel Management API** (Creating and managing hotels)
- **Hotel Owner API** (Managing hotel staff, rooms, and services)
- **Guest Management API** (Check-ins, checkouts, and billing)

Stay tuned for further updates!
