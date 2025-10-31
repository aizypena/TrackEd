# Testing Guide: Automatic Voucher Eligibility System

## Prerequisites
1. Ensure backend server is running: `cd tracked-backend && php artisan serve`
2. Ensure frontend is running: `cd tracked-frontend && npm run dev`
3. Have at least one batch created with:
   - `max_students` set (e.g., 30)
   - A voucher assigned with `quantity` set (e.g., 20)

## Test Case 1: View Batch Capacity Information

### Steps:
1. Login as **Admin**
2. Navigate to **Batch Management**
3. Look at the batch list table

### Expected Results:
✅ You should see a new "Vouchers" column
✅ Each batch shows enrollment: `X/Y students` with progress bar
✅ Each batch shows vouchers: `X/Y vouchers` with progress bar
✅ Color coding:
   - **Blue/Green** bar when < 80% capacity
   - **Yellow** bar when 80-95% capacity
   - **Red** bar when ≥ 95% capacity

### Example Display:
```
Batch ID: BATCH-2025-001
Program: Automotive Technology
Trainer: John Doe

Enrollment: 25/30
[==================----] 83% (Yellow progress bar)

Vouchers: 18/20
[=================-----] 90% (Yellow progress bar)

Status: Ongoing
```

---

## Test Case 2: Approve Applicant with Available Voucher

### Steps:
1. Login as **Staff**
2. Go to **Applicants** page
3. Click on an applicant with status "Pending"
4. Click **"Approve Application"**
5. Select a batch that has **available voucher slots** (e.g., 18/20 used)
6. Confirm approval

### Expected Results:
✅ Applicant is approved successfully
✅ Applicant is converted to student
✅ Student is assigned to the selected batch
✅ Student's `voucher_eligibility` = **"eligible"**
✅ Student's `voucher_id` is assigned
✅ Voucher's `used_count` **increments by 1** (e.g., 18 → 19)
✅ Approval email is sent

### Verification:
- Check **Batch Management** → Voucher count should now be 19/20
- Check student record in database: `voucher_eligibility` should be "eligible"

---

## Test Case 3: Approve Applicant with NO Available Vouchers

### Steps:
1. Login as **Staff**
2. Go to **Applicants** page
3. Click on an applicant with status "Pending"
4. Click **"Approve Application"**
5. Select a batch where vouchers are **full** (e.g., 20/20 used)
6. Confirm approval

### Expected Results:
✅ Applicant is approved successfully (still enrolled as student)
✅ Student is assigned to the selected batch
✅ Student's `voucher_eligibility` = **"not_eligible"** (will be self-funded)
✅ Student's `voucher_id` = **null**
✅ Voucher's `used_count` **does NOT change** (remains 20/20)
✅ Approval email is sent

### Verification:
- Check **Batch Management** → Voucher count should still be 20/20
- Check student record in database: `voucher_eligibility` should be "not_eligible"

---

## Test Case 4: Approve Applicant when Batch is Full

### Steps:
1. Login as **Staff**
2. Go to **Applicants** page
3. Click on an applicant with status "Pending"
4. Click **"Approve Application"**
5. Select a batch that is **at maximum capacity** (e.g., 30/30 students enrolled)
6. Confirm approval

### Expected Results:
❌ Approval **FAILS** with error message
❌ Error: **"Batch has reached maximum capacity"**
❌ Additional info: `current_enrollment: 30, max_students: 30`
✅ Applicant remains in "Pending" status
✅ No voucher is consumed

### Verification:
- Check **Batch Management** → Enrollment should still be 30/30
- Applicant status should still be "Pending"

---

## Test Case 5: Reject an Approved Student (Free Voucher Slot)

### Prerequisites:
- Have a student who was approved with `voucher_eligibility = "eligible"`
- The student should have a `voucher_id` assigned
- Batch voucher count is, for example, 19/20

### Steps:
1. Login as **Staff**
2. Go to **Applicants** or **Students** page
3. Find the student you want to reject
4. Navigate to their details page
5. Click **"Reject Application"** button
6. Confirm rejection

### Expected Results:
✅ Student is rejected successfully
✅ Student's `application_status` = **"rejected"**
✅ Student's `voucher_eligibility` = **"not_eligible"**
✅ Student's `voucher_id` = **null**
✅ Student's `role` = **"applicant"** (reverted from student)
✅ Student's `batch_id` = **null** (removed from batch)
✅ Student's `student_id` = **null** (cleared)
✅ Voucher's `used_count` **decrements by 1** (e.g., 19 → 18)
✅ If voucher status was "used", it changes back to **"issued"**

### Verification:
- Check **Batch Management** → Voucher count should now be 18/20 (decreased by 1)
- Check **Batch Management** → Enrollment should decrease by 1 (e.g., 30 → 29)
- Check applicant record: all student-related fields should be cleared
- Voucher slot is now **available** for another applicant

---

## Test Case 6: Reject a Student Who Was NOT Eligible for Vouchers

### Prerequisites:
- Have a student who was approved with `voucher_eligibility = "not_eligible"`
- The student has `voucher_id = null`

### Steps:
1. Login as **Staff**
2. Go to **Applicants** or **Students** page
3. Find the student you want to reject
4. Navigate to their details page
5. Click **"Reject Application"** button
6. Confirm rejection

### Expected Results:
✅ Student is rejected successfully
✅ Student's `application_status` = **"rejected"**
✅ Student's `role` = **"applicant"** (reverted)
✅ Student's `batch_id` = **null**
✅ Student's `student_id` = **null**
✅ Voucher's `used_count` **does NOT change** (because they didn't have a voucher)

### Verification:
- Check **Batch Management** → Voucher count should remain **unchanged**
- Check **Batch Management** → Enrollment should decrease by 1
- No voucher slot is freed (student didn't use one)

---

## Database Verification Queries

### Check Batch Capacity:
```sql
SELECT 
    b.batch_id,
    b.max_students,
    COUNT(u.id) as current_enrollment,
    b.max_students - COUNT(u.id) as available_slots
FROM batches b
LEFT JOIN users u ON u.batch_id = b.batch_id AND u.role = 'student'
GROUP BY b.batch_id, b.max_students;
```

### Check Voucher Usage:
```sql
SELECT 
    v.voucher_id,
    v.batch_id,
    v.quantity,
    v.used_count,
    v.quantity - v.used_count as available_vouchers,
    v.status
FROM vouchers v;
```

### Check Student Voucher Eligibility:
```sql
SELECT 
    u.id,
    u.first_name,
    u.last_name,
    u.role,
    u.batch_id,
    u.voucher_eligibility,
    u.voucher_id,
    u.application_status
FROM users u
WHERE u.role IN ('student', 'applicant')
ORDER BY u.created_at DESC;
```

---

## Common Issues and Troubleshooting

### Issue 1: Voucher count not updating
**Cause**: Backend route not being called correctly
**Fix**: Check browser console for API errors, verify authentication token

### Issue 2: Capacity not showing in UI
**Cause**: Frontend not receiving voucher data
**Fix**: Verify BatchController is returning voucher info, check network tab in browser

### Issue 3: Can't approve when batch should have space
**Cause**: Calculation error or stale data
**Fix**: 
```bash
# Refresh batch data
cd tracked-backend
php artisan cache:clear
```

### Issue 4: Voucher not freed on rejection
**Cause**: Applicant didn't have a voucher assigned
**Fix**: Verify the student had `voucher_eligibility = 'eligible'` and `voucher_id` before rejection

---

## Success Indicators

### All systems working correctly if:
1. ✅ Batch capacity shows correctly with color coding
2. ✅ Voucher usage displays accurately
3. ✅ Approvals check capacity and fail when full
4. ✅ Voucher slots are consumed on approval (when available)
5. ✅ Voucher slots are freed on rejection (when applicable)
6. ✅ Students marked correctly as eligible/not_eligible
7. ✅ Visual indicators update in real-time after actions

---

## Notes
- Always refresh the page after performing actions to see updated capacity
- Check the browser console for any JavaScript errors
- Check Laravel logs at `tracked-backend/storage/logs/laravel.log` for backend errors
- Use the database verification queries to ensure data consistency
