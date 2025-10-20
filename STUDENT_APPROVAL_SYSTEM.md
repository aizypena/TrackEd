# Student Application Approval System

## Overview
This document explains how the student application approval process works, including the automatic conversion from applicant to student with batch assignment and student ID generation.

## Workflow

### 1. Application Submission
- User applies through the application form
- Initial role: `applicant`
- Initial status: `pending`
- Application stored in `users` table

### 2. Staff Review
- Staff member reviews application in `/staff/enrollments/applications/{id}`
- Can view all applicant details and documents
- Can update status to:
  - `pending`
  - `under_review`
  - `rejected`
  - `approved` (with batch assignment)

### 3. Approval Process
When staff clicks **"Approve & Enroll as Student"**:

1. **Modal Opens** - `ApproveApplicantModal` displays
2. **Batch Selection** - Shows available batches that match:
   - Same program as applicant's `course_program`
   - Not full (enrolled_students < max_students)
   - Status is "not started" or "ongoing"
3. **Student Conversion** - Upon confirmation:
   - Generates unique student ID
   - Changes role from `applicant` to `student`
   - Assigns to selected batch
   - Sets application_status to `approved`

## Database Changes

### Migration: `add_student_id_and_batch_id_to_users_table`
Already exists in earlier migrations, adds:
- `student_id` - VARCHAR(255), nullable, unique
- `batch_id` - BIGINT, nullable, foreign key to batches.id

### User Model Updates
Added to fillable array:
```php
'student_id',
'voucher_eligibility',
'voucher_id',
```

Updated batch relationship:
```php
public function batch()
{
    return $this->belongsTo(Batch::class, 'batch_id', 'batch_id');
}
```

## API Endpoints

### POST `/api/staff/applicants/{id}/approve`
Approves an applicant and converts them to a student.

**Request:**
```json
{
  "batch_id": "BATCH-2025-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Applicant approved and converted to student successfully",
  "student": {
    "id": 15,
    "student_id": "STU-2025-0001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": "student",
    "application_status": "approved",
    "batch_id": "BATCH-2025-001",
    "application_reviewed_at": "2025-10-20T05:42:56.000000Z",
    ...
}
}
```

**Validation:**
- `batch_id` - required, must exist in batches table
- Applicant must exist
- Applicant must not already be approved as student

**Process:**
1. Validates request
2. Generates unique student ID (format: `STU-YYYY-####`)
3. Updates user record:
   - `student_id` = generated ID
   - `role` = 'student'
   - `application_status` = 'approved'
   - `batch_id` = selected batch
   - `application_reviewed_at` = current timestamp

## Student ID Generation

### Format
`STU-YYYY-####`

- **STU** - Student prefix
- **YYYY** - Current year (2025)
- **####** - Sequential 4-digit number (0001, 0002, etc.)

### Logic
```php
$year = date('Y');
$lastStudent = User::where('student_id', 'like', "STU-{$year}-%")
    ->orderBy('student_id', 'desc')
    ->first();

if ($lastStudent) {
    $lastNumber = (int) substr($lastStudent->student_id, -4);
    $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
} else {
    $newNumber = '0001';
}

$studentId = "STU-{$year}-{$newNumber}";
```

### Examples
- First student of 2025: `STU-2025-0001`
- Second student: `STU-2025-0002`
- 100th student: `STU-2025-0100`
- First student of 2026: `STU-2026-0001` (resets each year)

## Frontend Components

### ApproveApplicantModal
**File:** `/tracked-frontend/src/components/staff/ApproveApplicantModal.jsx`

**Props:**
- `isOpen` - Boolean, controls modal visibility
- `onClose` - Function, called when modal closes
- `applicant` - Object, applicant data
- `onSuccess` - Function, called after successful approval

**Features:**
- Fetches available batches from API
- Filters batches by program, capacity, and status
- Displays applicant information
- Shows what will happen upon approval
- Handles approval submission
- Shows loading states
- Displays error messages

**Usage:**
```jsx
<ApproveApplicantModal
  isOpen={showApproveModal}
  onClose={() => setShowApproveModal(false)}
  applicant={applicant}
  onSuccess={(updatedStudent) => {
    fetchApplicantDetails();
    setShowApproveModal(false);
  }}
/>
```

### StaffApplicantView Updates
**File:** `/tracked-frontend/src/pages/staff/StaffApplicantView.jsx`

**Changes:**
1. Import `ApproveApplicantModal`
2. Add state: `const [showApproveModal, setShowApproveModal] = useState(false)`
3. Replace "Approve Application" button with "Approve & Enroll as Student"
4. Open modal on button click
5. Render modal component

**Button States:**
- Disabled if already approved
- Disabled if already a student
- Shows "Already a Student" if role is 'student'

## User Experience

### For Staff

#### Before Approval:
1. Navigate to Applications list
2. Click on applicant to view details
3. Review all information and documents
4. Click "Approve & Enroll as Student"

#### Modal appears showing:
- Applicant information summary
- Dropdown of available batches
- Information about what will happen
- Cancel and Approve buttons

#### After selecting batch and clicking Approve:
- Loading indicator appears
- Success message shown
- Applicant is now a student
- Page refreshes to show updated status

### For Student (Post-Approval)

After approval, the user now has:
- **New Role:** `student` (instead of `applicant`)
- **Student ID:** e.g., `STU-2025-0001`
- **Batch Assignment:** Enrolled in selected batch
- **Application Status:** `approved`

They can now:
- Access student portal (if implemented)
- View their batch information
- See their course schedule
- Access student resources

## Batch Capacity Management

### Filtering Logic
Only shows batches that are:
```javascript
const matchingBatches = data.data.filter(batch => {
  const programMatch = batch.program_id === applicant.course_program;
  const notFull = !batch.max_students || 
                   (batch.enrolled_students || 0) < batch.max_students;
  const isActive = ['not started', 'ongoing'].includes(batch.batch_status);
  
  return programMatch && notFull && isActive;
});
```

### Capacity Tracking
- `max_students` - Total batch capacity
- `enrolled_students` - Current enrollment count
- Batch appears in dropdown only if: `enrolled_students < max_students`

## Error Handling

### Backend Validation Errors
- **Batch not found:** "Batch does not exist"
- **Already approved:** "Applicant has already been approved and converted to student"
- **Missing batch_id:** "The batch id field is required"

### Frontend Error Handling
- **No batches available:** Shows yellow alert with message
- **API errors:** Toast notification with error message
- **Network errors:** Toast notification "Error approving applicant"

## Status Transitions

### Application Status Flow
```
pending → under_review → approved (with conversion)
  ↓           ↓               ↓
  → rejected  → rejected   (final state)
```

### Role Transition
```
applicant → student (one-way, irreversible)
```

**Note:** Once converted to student, the "Approve" button shows "Already a Student" and is disabled.

## Testing Checklist

### Backend Tests
- [ ] Student ID generation is unique
- [ ] Student ID increments correctly
- [ ] Batch assignment works
- [ ] Role changes from applicant to student
- [ ] Application status changes to approved
- [ ] Cannot approve already approved applicant
- [ ] Validates batch_id exists

### Frontend Tests
- [ ] Modal opens and closes correctly
- [ ] Fetches batches on modal open
- [ ] Filters batches correctly
- [ ] Shows no batches message when empty
- [ ] Batch selection works
- [ ] Approve button disabled when no batch selected
- [ ] Success toast appears on approval
- [ ] Page refreshes after approval
- [ ] Button disabled for already approved applicants

## Future Enhancements

### Possible Improvements
1. **Email Notification** - Send welcome email with student ID
2. **Voucher Assignment** - Automatically check voucher eligibility
3. **Batch Capacity Check** - Real-time capacity validation
4. **Bulk Approval** - Approve multiple applicants at once
5. **Student Portal Access** - Auto-create student portal account
6. **ID Card Generation** - Generate printable student ID card
7. **Enrollment Letter** - Generate enrollment confirmation letter
8. **Payment Integration** - If not voucher-eligible, trigger payment workflow

## Related Files

### Backend
- `/tracked-backend/routes/api.php` - Approval endpoint
- `/tracked-backend/app/Models/User.php` - User model with batch relationship
- `/tracked-backend/database/migrations/*_add_student_id_and_batch_id_to_users_table.php`

### Frontend
- `/tracked-frontend/src/components/staff/ApproveApplicantModal.jsx` - Approval modal
- `/tracked-frontend/src/pages/staff/StaffApplicantView.jsx` - Applicant details page
- `/tracked-frontend/src/pages/staff/StaffApplications.jsx` - Applications list

## Database Schema

### users table (relevant fields)
```sql
id                      BIGINT PRIMARY KEY
student_id             VARCHAR(255) UNIQUE NULL
first_name             VARCHAR(255)
last_name              VARCHAR(255)
email                  VARCHAR(255) UNIQUE
role                   ENUM('applicant', 'student', 'trainer', 'staff', 'admin')
application_status     ENUM('pending', 'approved', 'rejected')
batch_id               BIGINT NULL
course_program         VARCHAR(255) NULL
application_reviewed_at TIMESTAMP NULL
```

### batches table (relevant fields)
```sql
id                     BIGINT PRIMARY KEY
batch_id              VARCHAR(255) UNIQUE
program_id            BIGINT
max_students          INT
enrolled_students     INT
batch_status          ENUM('not started', 'ongoing', 'completed')
start_date            DATE
end_date              DATE
```

## Summary

The student application approval system provides a streamlined workflow for:
1. ✅ Reviewing applications
2. ✅ Approving qualified applicants
3. ✅ Automatically generating student IDs
4. ✅ Assigning students to batches
5. ✅ Converting applicants to students
6. ✅ Tracking batch capacity
7. ✅ Maintaining data integrity

This ensures a smooth transition from application to enrollment with proper validation and user feedback at every step.
