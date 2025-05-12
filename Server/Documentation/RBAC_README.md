# RBAC, Staff Onboarding, and Password Management Documentation

## Overview
This document describes the role-based access control (RBAC) system, staff onboarding, login flow, role-based dashboard redirection, and password management for the Hotel POS system.

---

## 1. Staff Onboarding (Manager)
- The Hotel Manager logs into the POS system.
- In the Manager Dashboard, the manager can create staff profiles (Front Desk, Restaurant, Housekeeping, etc.).
- On staff creation, the system generates credentials (email, password) and emails them to the staff member.

### API Endpoint
- `POST /api/v1/admin/hotels/:hotelId/roles`
  - Body: `{ name, email, phone, role, permissions, password (optional) }`
  - On success, credentials are emailed to the staff.

---

## 2. Staff Login & Role-Based Redirection
- Staff log in at `/` (login page) using their credentials.
- On successful login, the system redirects them to their dashboard based on role:
  - `manager` → `/manager_dashboard`
  - `front_desk` → `/front_desk`
  - `restaurant_manager` → `/restaurant_manager`
  - `housekeeper` → `/scheck`

### API Endpoint
- `POST /api/v1/staff/hotel/login`
  - Body: `{ email, password }`
  - Returns: `{ _id, name, email, role, hotelId }`

---

## 3. Password Management
- All users can change their password after login.
- Users can request a password reset if they forget their password.

### Change Password (Authenticated)
- `POST /api/v1/staff/hotel/change-password`
  - Body: `{ oldPassword, newPassword }`

### Request Password Reset
- `POST /api/v1/staff/hotel/request-reset`
  - Body: `{ email }`
  - Sends a reset link to the user's email.

### Reset Password
- `POST /api/v1/staff/hotel/reset-password`
  - Body: `{ email, token, newPassword }`

---

## 4. Frontend Usage
- Login page at `/` handles login and redirects based on role.
- Manager dashboard links to staff management page for onboarding.
- Staff management page allows creation of new staff.
- Password reset page at `/reset-password` for requesting and setting a new password.

---

## 5. Security Notes
- Passwords are hashed before storage.
- Password reset tokens are single-use and expire after use.
- All sensitive actions require authentication.

---

## 6. Example Flows
### Staff Creation
1. Manager fills out staff form.
2. Staff receives email with credentials.
3. Staff logs in and is redirected to their dashboard.

### Password Reset
1. User requests reset at `/reset-password`.
2. User receives email with reset link.
3. User sets new password and logs in.

---

For further details, see the code and API documentation. 