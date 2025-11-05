# Approval Workflow Redesign - Implementation Summary

## Overview
This document summarizes the changes made to redesign the application approval workflow. The new system simplifies the approval process by removing PayMongo payment integration, keeping approved applicants in the 'applicant' role, and adding voucher eligibility tracking with email notifications.

## Database Changes

### Migration: `2025_11_04_193809_add_approval_fields_to_users_table.php`

**New Fields Added to `users` table:**
- `voucher_eligible` (boolean, default: false) - Tracks if applicant is eligible for TESDA subsidy
- `approval_notes` (text, nullable) - Staff notes about the approval
- `application_status_reason` (text, nullable) - Reason for status changes (under_review, rejected)
- `approved_at` (timestamp, nullable) - Timestamp when application was approved

**Migration Commands:**
```bash
cd tracked-backend
php artisan migrate
```

## Backend Changes

### 1. User Model (`app/Models/User.php`)

**Added to `$fillable` array:**
```php
'voucher_eligible',
'approval_notes',
'application_status_reason',
'approved_at',
```

**Added to `casts()` method:**
```php
'voucher_eligible' => 'boolean',
'approved_at' => 'datetime',
```

### 2. Approval Endpoint (`routes/api.php`)

**Endpoint:** `POST /staff/applicants/{id}/approve`

**Old Behavior:**
- Required payment integration (PayMongo)
- Converted applicant to 'student' role
- Generated student ID
- Required payment_id if no vouchers available
- Complex voucher checking logic

**New Behavior:**
- **NO payment integration**
- Keeps applicant as 'applicant' role
- Marks application_status as 'approved'
- Accepts voucher eligibility flag from staff
- Sends email based on voucher eligibility

**New Request Parameters:**
```json
{
  "program_id": "required|exists:programs,id",
  "batch_id": "required|exists:batches,batch_id",
  "voucher_eligible": "boolean (optional, default: false)",
  "notes": "nullable|string"
}
```

**New Response:**
```json
{
  "success": true,
  "message": "Applicant approved successfully",
  "voucher_eligible": false,
  "applicant": { ... }
}
```

**Email Templates:**
Two distinct HTML email templates are sent based on voucher eligibility:

1. **Voucher Eligible Email** (Green theme)
   - Congratulates applicant
   - Confirms TESDA subsidy coverage
   - Lists required documents
   - Provides office visit instructions
   - No payment required

2. **Not Eligible Email** (Orange theme)
   - Congratulates applicant
   - Informs about self-funded status
   - Lists payment options
   - Lists required documents
   - Provides office visit instructions
   - Payment required during visit

### 3. Status Change Endpoint (`routes/api.php`)

**Endpoint:** `PUT /staff/applicants/{id}/status`

**Changes:**
- Added `reason` field validation
- Made reason **required** for 'under_review' and 'rejected' statuses
- Stores reason in `application_status_reason` field
- Includes reason in email notifications

**New Request Parameters:**
```json
{
  "application_status": "required|in:pending,under_review,approved,rejected",
  "reason": "required_if:application_status,under_review,rejected|string|max:1000"
}
```

**Email Updates:**
- 'under_review' and 'rejected' emails now include a highlighted reason box
- Yellow highlight for under_review
- Red highlight for rejected

## Frontend Changes

### 1. ApproveApplicantModal Component (`src/components/staff/ApproveApplicantModal.jsx`)

**Complete Redesign:**

**Removed:**
- All PayMongo payment integration code
- Payment method selection
- Payment intent creation
- Mock payment window handling
- Payment verification polling
- `checkPaymentRequired()` function
- `handlePayAndApprove()` function
- `approveWithPayment()` function
- Payment-related state variables
- Student ID generation references

**Added:**
- Program selector dropdown
- Voucher eligibility checkbox
- Approval notes textarea
- Simplified approval flow

**New UI Elements:**
```jsx
// Program Selection
<select name="program">
  {programs.map(program => ...)}
</select>

// Batch Selection (filtered by program)
<select name="batch">
  {batches.map(batch => ...)}
</select>

// Voucher Eligibility
<input 
  type="checkbox" 
  checked={voucherEligible}
  onChange={(e) => setVoucherEligible(e.target.checked)}
/>

// Notes
<textarea 
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
/>
```

**New Approval Process:**
1. Staff selects program (pre-filled if applicant has one)
2. Staff selects batch (filtered by selected program)
3. Staff checks voucher eligibility checkbox if applicable
4. Staff adds optional notes
5. Staff clicks "Approve Application"
6. API call with program_id, batch_id, voucher_eligible, notes
7. Email sent to applicant with voucher status
8. Success message shown

**Success Message:**
```javascript
toast.success(
  `Applicant approved successfully! Email sent with voucher eligibility status (${eligibilityStatus}). Please check spam folder if not received.`,
  { duration: 5000 }
);
```

### 2. StatusChangeModal Component (`src/components/staff/StatusChangeModal.jsx`)

**New Component Created:**

**Purpose:** 
Replaces the generic ConfirmationModal with a specialized modal that includes reason input for certain status changes.

**Features:**
- Displays confirmation message
- Shows reason textarea when required
- Validates reason input
- Disables confirm button until reason is provided
- Colored header based on action severity
- Resets reason on close

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: function,
  onConfirm: function(reason),
  details: {
    title: string,
    message: string,
    confirmText: string,
    color: 'red' | 'blue' | 'orange'
  },
  requiresReason: boolean
}
```

### 3. StaffApplicantView Page (`src/pages/staff/StaffApplicantView.jsx`)

**Changes:**

1. **Import Update:**
   ```javascript
   // Removed
   import ConfirmationModal from '../../components/staff/ConfirmationModal';
   
   // Added
   import StatusChangeModal from '../../components/staff/StatusChangeModal';
   ```

2. **getConfirmationDetails() Update:**
   ```javascript
   under_review: {
     // ... existing properties
     requiresReason: true  // NEW
   },
   rejected: {
     // ... existing properties
     requiresReason: true  // NEW
   },
   pending: {
     // ... existing properties
     requiresReason: false  // NEW
   }
   ```

3. **confirmStatusChange() Update:**
   ```javascript
   // Old signature
   const confirmStatusChange = async () => { ... }
   
   // New signature (accepts reason)
   const confirmStatusChange = async (reason = '') => { ... }
   
   // API call now includes reason
   body: JSON.stringify({ 
     application_status: status,
     reason: reason  // NEW
   })
   ```

4. **Modal Render Update:**
   ```jsx
   {/* Old */}
   <ConfirmationModal
     isOpen={showConfirmModal}
     onClose={...}
     onConfirm={confirmStatusChange}
     title={...}
     message={...}
     confirmText={...}
     confirmColor={...}
   />
   
   {/* New */}
   <StatusChangeModal
     isOpen={showConfirmModal}
     onClose={...}
     onConfirm={confirmStatusChange}
     details={getConfirmationDetails(pendingStatusChange)}
     requiresReason={getConfirmationDetails(pendingStatusChange).requiresReason}
   />
   ```

## Key Workflow Changes

### Old Approval Flow:
1. Staff selects batch
2. System checks voucher availability
3. If no vouchers: Staff initiates payment via PayMongo
4. Payment window opens (mock or real)
5. Payment completed
6. Applicant converted to 'student' role
7. Student ID generated
8. Enrolled in batch

### New Approval Flow:
1. Staff selects program
2. Staff selects batch
3. Staff determines voucher eligibility (checkbox)
4. Staff adds optional notes
5. Staff approves
6. Applicant marked as 'approved' (stays as 'applicant')
7. Email sent with voucher eligibility details
8. Applicant visits office for document verification
9. (Future: Office staff converts to student after verification)

## Email Notification Changes

### Approval Emails

**Voucher Eligible Template:**
- Green header with celebration emoji
- "Great News" highlighted box
- Lists TESDA subsidy benefits
- Required documents for voucher holders
- Office visit instructions
- No mention of payment

**Not Eligible Template:**
- Orange header
- Payment information highlighted
- Payment options listed
- Required documents
- Office visit instructions
- Payment required notice

### Status Change Emails

**Under Review Template:**
- Blue header
- Reason box (yellow highlight)
- Explanation of review process
- Timeline expectations

**Rejected Template:**
- Red header
- Reason box (red highlight)
- Encouraging message
- Contact information for questions

## Testing Checklist

### Backend Testing:
- [ ] Migration runs successfully
- [ ] User model saves new fields
- [ ] Approval endpoint accepts new parameters
- [ ] Approval endpoint sends correct email based on voucher_eligible
- [ ] Status change requires reason for under_review/rejected
- [ ] Status change emails include reason
- [ ] Applicant remains as 'applicant' role after approval
- [ ] approved_at timestamp is set correctly

### Frontend Testing:
- [ ] ApproveApplicantModal opens without errors
- [ ] Program selector populates correctly
- [ ] Batch selector filters by selected program
- [ ] Voucher checkbox toggles correctly
- [ ] Notes textarea accepts input
- [ ] Approval succeeds with valid data
- [ ] Success message displays with voucher status
- [ ] StatusChangeModal opens for under_review
- [ ] StatusChangeModal requires reason for under_review
- [ ] StatusChangeModal opens for rejected
- [ ] StatusChangeModal requires reason for rejected
- [ ] StatusChangeModal allows pending without reason
- [ ] Confirm button disabled until reason provided

### Email Testing:
- [ ] Voucher eligible email received (check spam)
- [ ] Not eligible email received (check spam)
- [ ] Under review email includes reason
- [ ] Rejected email includes reason
- [ ] Email styling renders correctly (HTML)
- [ ] All links and contact info correct

## Rollback Instructions

If issues arise, you can rollback using:

```bash
# Rollback migration
cd tracked-backend
php artisan migrate:rollback --step=1

# Restore old approval endpoint from git
git checkout HEAD~1 -- routes/api.php

# Restore old frontend components from git
git checkout HEAD~1 -- tracked-frontend/src/components/staff/ApproveApplicantModal.jsx
git checkout HEAD~1 -- tracked-frontend/src/pages/staff/StaffApplicantView.jsx

# Remove new modal
rm tracked-frontend/src/components/staff/StatusChangeModal.jsx
```

## Future Enhancements

1. **Office Staff Portal:**
   - Add endpoint for office staff to convert approved applicants to students
   - Include document verification checklist
   - Generate student ID at conversion time
   - Send enrollment confirmation email

2. **Voucher Management:**
   - Add voucher allocation tracking
   - Implement voucher usage reports
   - Add voucher eligibility criteria checks

3. **Applicant Dashboard:**
   - Show approval status and voucher eligibility
   - Display next steps based on voucher status
   - Allow document upload for verification
   - Show office visit appointment scheduling

4. **Reporting:**
   - Add approval rate analytics
   - Track voucher distribution
   - Monitor status change reasons
   - Generate approval reports by program/batch

## Support

For questions or issues:
- Check logs: `tracked-backend/storage/logs/laravel.log`
- Email test: Use tinker to send test emails
- Database check: Connect to MySQL and verify field values
- Frontend debug: Check browser console for errors

## Changelog

**Date:** November 4, 2025

**Version:** 2.0.0

**Changes:**
- Removed PayMongo payment integration from approval workflow
- Changed approved applicants to remain as 'applicant' role
- Added voucher eligibility tracking
- Implemented two-tier email notification system
- Added reason requirement for status changes
- Created StatusChangeModal component
- Redesigned ApproveApplicantModal component
- Updated database schema with new approval fields

**Breaking Changes:**
- Approval endpoint request/response structure changed
- Applicants are no longer auto-converted to students
- Student ID no longer generated at approval time
- Payment integration removed from approval flow

**Migration Required:** Yes
**Data Loss:** No
**Backward Compatible:** No
