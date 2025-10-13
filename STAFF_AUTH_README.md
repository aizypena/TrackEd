# Staff Authentication System

## Overview
The staff authentication system protects all staff routes and ensures only logged-in staff or trainer users can access staff pages.

## Features Implemented

### 1. **ProtectedStaffRoute Component** (`/src/components/ProtectedStaffRoute.jsx`)
- Checks for `staffToken` and `staffUser` in localStorage
- Validates user role (must be 'staff' or 'trainer')
- Redirects to `/staff/login` if not authenticated
- Clears invalid tokens automatically

### 2. **Staff Login Page** (`/src/pages/staff/StaffLogin.jsx`)
- Clean, professional login interface
- Email and password authentication
- Password visibility toggle
- Auto-redirect if already logged in
- Stores authentication token in localStorage
- Both staff and trainer roles use the same login page
- Redirects to `/staff/dashboard` after successful login

### 3. **Protected Routes** (`/src/routes/StaffRoutes.jsx`)
All 13 staff routes are now protected:

#### Dashboard
- `/staff/dashboard`

#### Enrollment Management
- `/staff/enrollments/applications`
- `/staff/enrollments/records`
- `/staff/enrollments/documents`

#### Student Management
- `/staff/students/profiles`
- `/staff/students/academics`
- `/staff/students/payments`

#### Training Management
- `/staff/training/schedule`
- `/staff/training/batches`
- `/staff/training/assessments`

#### Inventory Management
- `/staff/inventory/equipment`
- `/staff/inventory/transactions`

#### Analytics
- `/staff/analytics/enrollment`

## Test Accounts

### Staff Account
- **Email:** `staff@smi.edu.ph`
- **Password:** `staff123`
- **Role:** staff

### Trainer Account
- **Email:** `trainer@smi.edu.ph`
- **Password:** `trainer123`
- **Role:** trainer

## How It Works

1. **Accessing Protected Routes:**
   - User tries to access any staff page (e.g., `/staff/dashboard`)
   - `ProtectedStaffRoute` checks for valid authentication
   - If not authenticated → redirects to `/staff/login`
   - If authenticated → allows access to the page

2. **Login Flow:**
   - User enters email and password on `/staff/login`
   - Frontend sends POST request to `/api/staff/login`
   - Backend validates credentials and role (staff or trainer)
   - Backend checks if user status is 'active'
   - Backend returns token and user data
   - Frontend stores token in localStorage
   - Frontend redirects to `/staff/dashboard`

3. **Session Persistence:**
   - Authentication token stored in `localStorage.staffToken`
   - User data stored in `localStorage.staffUser`
   - Token persists across page refreshes
   - Token is sent with all API requests via `Authorization` header

4. **Logout (To Be Implemented):**
   - Clear `staffToken` and `staffUser` from localStorage
   - Redirect to `/staff/login`

## API Endpoint

### POST `/api/staff/login`
**Request Body:**
```json
{
  "email": "staff@smi.edu.ph",
  "password": "staff123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "1|abc123...",
  "user": {
    "id": 1,
    "first_name": "Test",
    "last_name": "Staff",
    "email": "staff@smi.edu.ph",
    "role": "staff",
    "status": "active"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

**Error Response (403):**
```json
{
  "message": "Account is not active"
}
```

## Security Features

1. **Token-based Authentication:** Uses Laravel Sanctum tokens
2. **Role Validation:** Only staff and trainer roles can log in
3. **Status Check:** Only active users can log in
4. **Protected Routes:** All staff pages require authentication
5. **Auto Token Cleanup:** Invalid tokens are automatically cleared
6. **Secure Storage:** Tokens stored in localStorage (consider httpOnly cookies for production)

## Usage

### Testing the Login:
1. Make sure backend is running: `php artisan serve`
2. Make sure frontend is running: `npm run dev`
3. Navigate to `http://localhost:5173/staff/login`
4. Use test credentials above
5. You should be redirected to `/staff/dashboard`

### Adding More Protected Routes:
```jsx
<Route 
  path="/your-route" 
  element={
    <ProtectedStaffRoute>
      <YourComponent />
    </ProtectedStaffRoute>
  } 
/>
```

## Next Steps (Optional Enhancements)

1. **Logout Functionality:**
   - Add logout button in staff dashboard
   - Clear localStorage and redirect to login

2. **Token Expiration:**
   - Check token expiration on each request
   - Auto-logout when token expires

3. **Remember Me:**
   - Add "Remember Me" checkbox
   - Use different storage for persistent login

4. **Password Reset:**
   - Add "Forgot Password" link
   - Implement password reset flow

5. **Multi-factor Authentication (MFA):**
   - Add extra security layer
   - Send OTP to phone/email

6. **Role-based Permissions:**
   - Different permissions for staff vs trainer
   - Show/hide features based on role
