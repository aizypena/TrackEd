# Marital Status Field Addition

## Changes Made

### Frontend (Application.jsx)

1. **Added maritalStatus to formData state:**
```javascript
gender: '',
maritalStatus: '',  // NEW
mobileNumber: '',
```

2. **Added Marital Status field to Personal Information section:**
- Added after Gender field
- Dropdown with options:
  - Single
  - Married
  - Widowed
  - Separated
  - Divorced
- Field is required

### Backend (ApplicationController.php)

1. **Added validation rule:**
```php
'maritalStatus' => 'required|in:single,married,widowed,separated,divorced',
```

2. **Added maritalStatus to User creation:**
```php
$user = User::create([
    'first_name' => $request->firstName,
    'last_name' => $request->lastName,
    'email' => $request->email,
    'phone_number' => $request->mobileNumber,
    'marital_status' => $request->maritalStatus,  // NEW
    'password' => Hash::make('password123'),
    'role' => 'applicant',
    'status' => 'active',
    'application_status' => 'pending',
]);
```

### User Model

The `marital_status` field was already present in the fillable array:
```php
protected $fillable = [
    // ... other fields ...
    'marital_status',
    // ... more fields ...
];
```

## Status

✅ Frontend form field added  
✅ Backend validation added  
✅ User creation updated  
✅ User model already has marital_status in fillable  
✅ Ready to test

## Testing

When submitting an application:
1. The marital status dropdown will be visible in Step 1 (Personal Information)
2. User must select a marital status before proceeding
3. The selected marital status will be saved to the users table in the marital_status column
4. The value will be displayed in the StaffApplicantView page

## Database Field

The `marital_status` column in the `users` table stores values as:
- `single`
- `married`
- `widowed`
- `separated`  
- `divorced`
