# Automatic Voucher Eligibility System - Implementation Summary

## Overview
Implemented an automatic voucher eligibility system that manages batch capacity and voucher allocation based on thresholds. The system ensures fair distribution and proper handling of rejections.

## Features Implemented

### 1. Backend Updates

#### A. Application Status Update Endpoint (`PUT /api/staff/applicants/{id}/status`)
**Location**: `/tracked-backend/routes/api.php` (Lines ~2225-2273)

**Functionality**:
- When an application is **rejected**, the system now:
  - Checks if the applicant was marked as "eligible" and had a voucher assigned
  - If yes, **decrements** the voucher's `used_count` (frees up the slot)
  - Updates the voucher status back to 'issued' if it was marked as 'used'
  - Sets applicant's `voucher_eligibility` to "not_eligible"
  - If the applicant was already converted to a student, reverts them back to applicant role
  - Clears their `batch_id`, `student_id`, and `voucher_id`

**Example**:
```php
// When rejecting an application
if ($request->application_status === 'rejected') {
    // Free up voucher slot if applicant was eligible
    if ($applicant->role === 'student' && 
        $applicant->voucher_eligibility === 'eligible' && 
        $applicant->voucher_id) {
        
        $voucher = \App\Models\Voucher::where('voucher_id', $applicant->voucher_id)->first();
        if ($voucher && $voucher->used_count > 0) {
            $voucher->decrement('used_count');
            
            // Update status if needed
            if ($voucher->status === 'used' && $voucher->used_count < $voucher->quantity) {
                $voucher->update(['status' => 'issued']);
            }
        }
    }
    
    // Update applicant status
    $applicant->voucher_eligibility = 'not_eligible';
    $applicant->role = 'applicant';
    $applicant->batch_id = null;
    $applicant->student_id = null;
    $applicant->voucher_id = null;
}
```

#### B. Application Approval Endpoint (`POST /api/staff/applicants/{id}/approve`)
**Location**: `/tracked-backend/routes/api.php` (Lines ~2280-2310)

**Functionality**:
- **NEW**: Checks batch capacity before approving
- Prevents approval if batch has reached `max_students` limit
- Returns clear error message with current enrollment and max capacity
- Only proceeds with approval if slots are available

**Example**:
```php
// Check batch capacity
$batch = \App\Models\Batch::where('batch_id', $request->batch_id)->first();
$currentEnrollment = \App\Models\User::where('batch_id', $request->batch_id)
    ->where('role', 'student')
    ->count();

if ($currentEnrollment >= $batch->max_students) {
    return response()->json([
        'error' => 'Batch has reached maximum capacity',
        'current_enrollment' => $currentEnrollment,
        'max_students' => $batch->max_students
    ], 400);
}
```

#### C. BatchController Updates
**Location**: `/tracked-backend/app/Http/Controllers/BatchController.php`

**Functionality**:
- Enhanced `index()` method to include voucher information for all batches
- Enhanced `show()` method to include voucher information for single batch

**Added Fields**:
- `voucher_quantity`: Total voucher slots available
- `voucher_used_count`: Number of voucher slots currently used
- `voucher_available`: Remaining voucher slots (quantity - used_count)
- `voucher_status`: Current status of the voucher ('pending', 'issued', 'used')

### 2. Frontend Updates

#### A. BatchManagement Component
**Location**: `/tracked-frontend/src/pages/admin/BatchManagement.jsx`

**Changes**:
1. **Added "Vouchers" column** to the batch list table
2. **Visual indicators** for capacity thresholds:
   - **Green**: < 80% capacity (healthy)
   - **Yellow**: 80-95% capacity (warning)
   - **Red**: ≥ 95% capacity (critical)
3. **Displays**:
   - Batch enrollment: `X/Y students` with color-coded progress bar
   - Voucher usage: `X/Y vouchers` with color-coded progress bar
   - "No vouchers" label if batch has no voucher assigned

**Example Display**:
```
Enrollment: 25/30 students
[==================----] 83% (Yellow)

Vouchers: 18/20 used
[=================-----] 90% (Yellow)
```

## How It Works

### Workflow: Application Approval
1. Staff reviews applicant details
2. Staff clicks "Approve Application" and selects a batch
3. **System checks**:
   - Is the batch at maximum capacity? → If yes, **reject with error**
   - Are vouchers available for this batch? → If yes, mark as "eligible", if no, mark as "not_eligible"
4. If approved:
   - Student is created with unique student ID
   - Student is assigned to the selected batch
   - Voucher `used_count` is incremented (if available)
   - Voucher eligibility status is set
   - Approval email is sent

### Workflow: Application Rejection
1. Staff reviews applicant details
2. Staff clicks "Reject Application"
3. **System automatically**:
   - Checks if applicant was marked as "eligible" with an assigned voucher
   - If yes, **decrements** the voucher's `used_count` (frees up the slot)
   - Updates voucher status if needed (from 'used' back to 'issued')
   - Sets `voucher_eligibility` to "not_eligible"
   - If the applicant was already a student, reverts them to applicant role
   - Clears batch assignment, student ID, and voucher ID
   - Updates application status to "rejected"

## Database Schema

### Batches Table
- `max_students`: Maximum number of students allowed in the batch (default: 30)

### Vouchers Table
- `batch_id`: Links voucher to specific batch
- `quantity`: Total number of voucher slots available
- `used_count`: Number of slots currently used (default: 0)
- `status`: Enum ('pending', 'issued', 'used')

### Users Table (for students/applicants)
- `batch_id`: Assigned batch (nullable)
- `voucher_eligibility`: Eligibility status for vouchers
- `voucher_id`: Assigned voucher ID (nullable)
- `application_status`: Enum ('pending', 'under_review', 'approved', 'rejected')

## Benefits

1. **Automatic Slot Management**: Voucher slots are automatically freed when applications are rejected
2. **Capacity Enforcement**: System prevents over-enrollment beyond batch limits
3. **Visual Feedback**: Color-coded indicators show capacity status at a glance
4. **Fair Distribution**: First-come, first-served until capacity is reached
5. **Data Integrity**: All voucher and enrollment data stays synchronized
6. **Transparency**: Admin can see both enrollment and voucher usage in one view

## Testing Scenarios

### Scenario 1: Reject an Approved Student
1. Applicant was approved and marked as "eligible" with voucher
2. Staff rejects the application
3. **Expected Result**:
   - Voucher `used_count` decreases by 1
   - Applicant's `voucher_eligibility` becomes "not_eligible"
   - Applicant reverts to "applicant" role
   - Voucher becomes available again for other applicants

### Scenario 2: Batch at Maximum Capacity
1. Batch has 30/30 students enrolled
2. Staff tries to approve another applicant for this batch
3. **Expected Result**:
   - System returns error: "Batch has reached maximum capacity"
   - Applicant is NOT approved
   - Staff must choose a different batch

### Scenario 3: Vouchers Exhausted
1. Batch has 20/20 vouchers used
2. Staff approves an applicant for this batch
3. **Expected Result**:
   - Student is created and enrolled
   - Student is marked as `voucher_eligibility = 'not_eligible'`
   - Student can still enroll but must be self-funded

## API Endpoints Modified

1. **PUT** `/api/staff/applicants/{id}/status`
   - Now handles voucher slot release on rejection

2. **POST** `/api/staff/applicants/{id}/approve`
   - Now checks batch capacity before approval

3. **GET** `/api/batches` (BatchController@index)
   - Now returns voucher information for all batches

4. **GET** `/api/batches/{id}` (BatchController@show)
   - Now returns voucher information for single batch

## Notes

- The system maintains data consistency across all operations
- Voucher slots are only consumed when an applicant is approved and marked as eligible
- Rejection of any application (even after approval) properly frees up resources
- The frontend automatically displays capacity information without requiring additional API calls
- Color coding helps admins quickly identify batches nearing capacity

## Future Enhancements (Optional)

1. **Notifications**: Alert staff when batch/voucher capacity reaches 80%
2. **Batch Recommendations**: Suggest batches with available slots when approving applicants
3. **Capacity Reports**: Generate reports showing batch utilization over time
4. **Waiting List**: Automatically queue applicants when batches are full
5. **Audit Log**: Track all voucher assignments and releases for compliance
