# How to Test the New Approval Workflow

## What Changed?

### OLD BEHAVIOR (Before):
1. Staff clicked "Approve" button
2. System checked for vouchers automatically
3. If no vouchers: Opened PayMongo payment window
4. After payment: Applicant converted to STUDENT role
5. Student ID generated automatically (STU-2025-0001)
6. Generic approval email sent

### NEW BEHAVIOR (Now):
1. Staff clicks "Approve" button
2. **ApproveApplicantModal** opens with:
   - Program selector
   - Batch selector  
   - **Voucher Eligibility checkbox** ← Staff decides!
   - Notes textarea
3. Staff submits approval
4. Applicant stays as **APPLICANT role** (not converted to student)
5. **NO student ID generated** (happens later at office)
6. **Two different emails** sent based on voucher checkbox:
   - ✅ Voucher Eligible Email (green theme, no payment)
   - ❌ Not Eligible Email (orange theme, mentions payment)

## Step-by-Step Testing

### Test 1: Approve with Voucher Eligibility

1. **Login as Staff**
   - Go to Staff Dashboard
   - Click "Applicants" in sidebar

2. **Select an Applicant**
   - Click on any applicant with "pending" status
   - View their details

3. **Click "Approve" Button**
   - Green "Approve" button at top right
   - Modal should open titled "Approve Applicant"

4. **In the Modal:**
   - **Program**: Should show dropdown of all programs
   - **Batch**: Select a batch for the program
   - **Voucher Eligible**: ✅ CHECK THIS BOX
   - **Notes**: Add "Test approval with voucher"
   - Click "Approve Application"

5. **Expected Results:**
   - ✅ Success toast: "Applicant approved successfully! Email sent with voucher eligibility status (eligible for voucher)..."
   - ✅ Modal closes
   - ✅ Applicant status changes to "approved"
   - ✅ Applicant **STAYS as applicant role** (check in database)
   - ✅ Email sent with GREEN header and "Great News: You are ELIGIBLE for Training Voucher"

6. **Check Database:**
   ```sql
   SELECT id, first_name, last_name, role, application_status, voucher_eligible, approved_at
   FROM users 
   WHERE email = 'applicant@email.com';
   ```
   - `role` should be **'applicant'** (NOT 'student')
   - `application_status` should be **'approved'**
   - `voucher_eligible` should be **1** (true)
   - `approved_at` should have timestamp
   - `student_id` should be **NULL** (not generated yet)

7. **Check Email:**
   - Open applicant's email (check spam folder!)
   - Subject: "SMI Institute Inc. - Application Approved (Voucher Eligible)"
   - Body should have:
     - Green header
     - "Great News: You are ELIGIBLE for Training Voucher"
     - "Your training fees will be covered by TESDA scholarship"
     - NO mention of payment
     - Office visit instructions

### Test 2: Approve WITHOUT Voucher Eligibility

1. **Find Another Applicant**
   - Status: pending

2. **Click "Approve" Button**

3. **In the Modal:**
   - **Program**: Select program
   - **Batch**: Select batch
   - **Voucher Eligible**: ❌ LEAVE UNCHECKED
   - **Notes**: Add "Test approval without voucher"
   - Click "Approve Application"

4. **Expected Results:**
   - ✅ Success toast: "...not eligible for voucher..."
   - ✅ Applicant status = "approved"
   - ✅ Applicant role = **'applicant'** (NOT student)
   - ✅ Email sent with ORANGE header mentioning payment

5. **Check Email:**
   - Subject: "SMI Institute Inc. - Application Approved (Payment Required)"
   - Body should have:
     - Orange header
     - "Payment Information" section
     - "self-funded student" mentioned
     - Payment options listed
     - Office visit instructions

### Test 3: Mark as Under Review (with Reason)

1. **Select an Applicant**
   - Status: pending

2. **Click "Under Review" Button**

3. **StatusChangeModal Opens:**
   - Title: "Mark as Under Review"
   - **Reason textarea should be visible**
   - "A reason is required to proceed" message
   - Confirm button should be **disabled** until reason is entered

4. **Enter Reason:**
   - Type: "Missing birth certificate copy"
   - Confirm button becomes **enabled**
   - Click "Mark as Under Review"

5. **Expected Results:**
   - ✅ Status changes to "under_review"
   - ✅ Email sent with reason included
   - ✅ Reason stored in database

6. **Check Database:**
   ```sql
   SELECT application_status, application_status_reason 
   FROM users 
   WHERE id = [applicant_id];
   ```
   - `application_status` = 'under_review'
   - `application_status_reason` = 'Missing birth certificate copy'

7. **Check Email:**
   - Subject: "Application Under Review - TrackEd"
   - Body should have:
     - Blue header
     - Yellow highlighted "Reason for Review" box
     - Reason text displayed

### Test 4: Reject Application (with Reason)

1. **Select an Applicant**

2. **Click "Reject" Button**

3. **StatusChangeModal Opens:**
   - Title: "Reject Application"
   - **Reason textarea required**
   - Confirm button disabled until reason entered

4. **Enter Reason:**
   - Type: "Does not meet age requirement for this program"
   - Click "Reject Application"

5. **Expected Results:**
   - ✅ Status = "rejected"
   - ✅ Email with reason sent
   - ✅ If was student before, reverted to applicant

6. **Check Email:**
   - Subject: "Application Status Update - TrackEd"
   - Body should have:
     - Red header
     - Red highlighted "Reason" box
     - Reason text displayed

### Test 5: Mark as Pending (NO Reason Required)

1. **Select an approved/rejected applicant**

2. **Click "Pending" Button**

3. **StatusChangeModal Opens:**
   - Title: "Mark as Pending"
   - **NO reason textarea** (not required)
   - Confirm button should be **enabled** immediately

4. **Click "Mark as Pending"**

5. **Expected Results:**
   - ✅ Status changes to "pending"
   - ✅ NO email sent
   - ✅ Works without reason

## Common Issues & Fixes

### Issue: "Failed to fetch programs"
**Fix:** Make sure backend is running on port 8000
```bash
cd tracked-backend
php artisan serve
```

### Issue: "Failed to fetch batches"
**Fix:** Create at least one batch in Admin panel for the program

### Issue: "Confirm button stays disabled in StatusChangeModal"
**Fix:** Make sure you've typed a reason (it needs at least 1 character)

### Issue: "Email not received"
**Fix:** 
1. Check spam folder
2. Check backend logs:
   ```bash
   tail -f tracked-backend/storage/logs/laravel.log
   ```
3. Look for "Approval email sent to..." message

### Issue: "Applicant became student instead of staying applicant"
**Fix:** You might be running old code. Clear cache:
```bash
cd tracked-backend
php artisan cache:clear
php artisan config:clear
```

### Issue: "Modal doesn't open"
**Fix:** Check browser console for errors:
- Right-click → Inspect → Console tab
- Look for JavaScript errors

## Database Verification Queries

### Check Approved Applicant:
```sql
SELECT 
    id,
    first_name,
    last_name,
    email,
    role,
    application_status,
    voucher_eligible,
    approval_notes,
    application_status_reason,
    approved_at,
    student_id,
    course_program,
    batch_id
FROM users 
WHERE application_status = 'approved'
ORDER BY approved_at DESC
LIMIT 5;
```

### Expected for Approved Applicants:
- `role` = **'applicant'** (not 'student')
- `student_id` = **NULL**
- `voucher_eligible` = 0 or 1
- `approved_at` = timestamp
- `course_program` = program ID
- `batch_id` = batch ID

## What Happens Next? (Future Flow)

After staff approves applicant:

1. **Applicant receives email** with office visit instructions
2. **Applicant visits office** with required documents
3. **Office staff verifies documents**
4. **Office staff converts applicant to student** (future feature):
   - Role changes: applicant → student
   - Student ID generated: STU-2025-0001
   - Enrollment confirmed
5. **Student receives enrollment confirmation email**

## Quick Reference

### Approval Flow:
```
Pending Applicant
    ↓
Staff Reviews Application
    ↓
Staff Clicks "Approve"
    ↓
Modal Opens (Program, Batch, Voucher, Notes)
    ↓
Staff Submits
    ↓
✅ Status = 'approved'
✅ Role = 'applicant' (not student!)
✅ Email sent (voucher-based template)
✅ Voucher eligibility recorded
    ↓
Applicant visits office
    ↓
[Future] Office staff converts to student
```

### Status Change Flow (with Reason):
```
Applicant with any status
    ↓
Staff Clicks "Under Review" or "Reject"
    ↓
Modal Opens with Reason textarea
    ↓
Reason is REQUIRED (button disabled until entered)
    ↓
Staff Types Reason
    ↓
Staff Confirms
    ↓
✅ Status updated
✅ Reason stored in DB
✅ Email sent with reason displayed
```

## API Endpoints Reference

### Approve Applicant:
```http
POST /api/staff/applicants/{id}/approve
Authorization: Bearer {token}

{
  "program_id": 1,
  "batch_id": "BATCH-2025-001",
  "voucher_eligible": true,
  "notes": "Approved for scholarship program"
}
```

### Change Status:
```http
PUT /api/staff/applicants/{id}/status
Authorization: Bearer {token}

{
  "application_status": "under_review",
  "reason": "Missing document verification"
}
```

## Success Criteria

✅ Applicant stays as 'applicant' after approval
✅ No student ID generated at approval
✅ Voucher eligibility recorded correctly
✅ Different emails sent based on voucher status
✅ Reason required for under_review and rejected
✅ Reason displayed in emails
✅ Modal closes after successful approval
✅ Success messages display correctly

## Contact

If tests fail, check:
1. Browser console for errors
2. Backend logs: `tracked-backend/storage/logs/laravel.log`
3. Database values match expected results
4. Email settings in `.env` file
