# Batch vs Voucher Capacity - Understanding the Difference

## Overview
Batches and vouchers have **different thresholds** that serve different purposes in the enrollment system.

## Key Concepts

### 1. Batch Capacity (`max_students`)
The **total number of students** that can be enrolled in a batch, regardless of funding source.

**Purpose:**
- Physical/classroom capacity
- Total seats available
- Combined voucher + self-funded students

**Example:** A batch with `max_students = 30` can accommodate 30 total students.

### 2. Voucher Quantity (`quantity`)
The **number of subsidized/free slots** available through TESDA vouchers.

**Purpose:**
- Government-funded slots
- Free training slots
- Subsidized enrollment

**Example:** A batch with `quantity = 20` has 20 vouchers (free slots) available.

## The Difference Explained

### Scenario 1: Full Voucher Coverage
```
Batch Capacity (max_students): 30
Voucher Quantity (quantity):   30
─────────────────────────────────
Result: All 30 slots are free/subsidized
        0 self-funded slots available
```

### Scenario 2: Partial Voucher Coverage (Most Common)
```
Batch Capacity (max_students): 30
Voucher Quantity (quantity):   20
─────────────────────────────────
Result: 20 free/subsidized slots (voucher students)
        10 paying slots (self-funded students)
        30 total slots
```

### Scenario 3: Limited Vouchers
```
Batch Capacity (max_students): 50
Voucher Quantity (quantity):   15
─────────────────────────────────
Result: 15 free/subsidized slots (voucher students)
        35 paying slots (self-funded students)
        50 total slots
```

### Scenario 4: No Vouchers
```
Batch Capacity (max_students): 30
Voucher Quantity (quantity):    0
─────────────────────────────────
Result: 0 free/subsidized slots
        30 paying slots (all self-funded)
        30 total slots
```

## Why They're Different

### Budget Constraints
- **Government Budget:** Limited number of vouchers available
- **Facility Capacity:** Can accommodate more students than vouchers
- **Revenue Mix:** Allows combination of funded and self-funded students

### Flexibility
- **Program Sustainability:** Self-funded students help cover costs
- **Enrollment Options:** Students can choose voucher or self-funded
- **Revenue Generation:** Institution can fill remaining slots with paying students

### Real-World Example

**Culinary Arts Batch**
```javascript
{
  batch_id: "BATCH-2025-001",
  program: "Culinary Arts NC II",
  max_students: 40,        // Kitchen can accommodate 40 students
  
  voucher: {
    voucher_id: "V-2025-001",
    quantity: 25,          // Government funded 25 slots
    used_count: 0
  }
}
```

**Enrollment Breakdown:**
- 25 slots reserved for voucher holders (free)
- 15 slots available for self-funded students (paying)
- 40 total capacity

**Scenario A: High Demand**
- 30 applicants with vouchers
- System assigns vouchers to first 25 eligible applicants
- Remaining 5 can enroll as self-funded (if they choose)
- 10 self-funded slots still available

**Scenario B: Low Voucher Demand**
- 15 applicants with vouchers
- All 15 get vouchers
- 10 unused vouchers remain
- 25 self-funded slots available (40 total - 15 voucher students)

## Form Implementation

### Admin Creates Batch + Voucher

**Step 1: Batch Information**
```
Program: Culinary Arts NC II
Trainer: Chef John Smith
Max Students: 40          ← Total batch capacity
Start Date: 2025-11-01
End Date: 2025-12-15
```

**Step 2: Voucher Information**
```
Voucher Quantity: 25      ← Subsidized slots only
Issue Date: 2025-10-20
Status: Issued
```

**Result:**
- Batch created with 40 total slots
- Voucher issued with 25 free slots
- 15 slots remain for self-funded students

### Validation Rules

1. **Voucher quantity MUST be ≤ Max students**
   ```javascript
   if (quantity > max_students) {
     error("Voucher quantity cannot exceed batch capacity");
   }
   ```

2. **Both values MUST be > 0**
   ```javascript
   max_students >= 1
   quantity >= 1
   ```

3. **Voucher quantity can be equal to max students**
   ```javascript
   // Valid: All slots are voucher slots
   max_students = 30
   quantity = 30
   ```

4. **Voucher quantity can be less than max students**
   ```javascript
   // Valid: Mixed funding
   max_students = 50
   quantity = 20
   ```

## UI Indicators

### Form Hints
```jsx
<input name="maxStudents" />
<p>Total capacity of the batch (all students)</p>

<input name="quantity" max={maxStudents} />
<p>Number of vouchers to issue (must be ≤ max students: {maxStudents})</p>
```

### Warning Messages
```jsx
{quantity > maxStudents && (
  <p className="text-red-500">
    ⚠️ Voucher quantity cannot exceed batch capacity
  </p>
)}
```

### Summary Display
```jsx
<div className="info-box">
  <p>
    This will create a batch with <strong>{maxStudents} total slots</strong> and 
    issue <strong>{quantity} vouchers</strong> for subsidized enrollment.
    The remaining <strong>{maxStudents - quantity} slots</strong> will be 
    available for self-funded students.
  </p>
</div>
```

## Student Enrollment Flow

### 1. Application Submission
```javascript
// Student applies for program
applicant.courseProgram = 7  // Culinary Arts

// System checks voucher eligibility
if (hasActiveBatch && vouchersAvailable) {
  applicant.voucher_eligibility = 'eligible'
  applicant.voucher_id = 'V-2025-001'
} else {
  applicant.voucher_eligibility = 'not_eligible'
}
```

### 2. Voucher Assignment
```javascript
// When application is approved
if (applicant.voucher_eligibility === 'eligible') {
  // Assign voucher (decrement available)
  voucher.used_count += 1
  
  // Check if vouchers exhausted
  if (voucher.used_count >= voucher.quantity) {
    // No more vouchers, but batch still has slots
    // New applicants can enroll as self-funded
  }
}
```

### 3. Batch Enrollment
```javascript
// Count current enrollments
const currentEnrollment = batch.students.length

// Check capacity
if (currentEnrollment < batch.max_students) {
  // Can still enroll (voucher or self-funded)
  
  if (voucher.used_count < voucher.quantity) {
    // Voucher available
    offerVoucher()
  } else {
    // Only self-funded option
    offerSelfFundedEnrollment()
  }
} else {
  // Batch is full
  rejectApplication("Batch capacity reached")
}
```

## Database Schema

### batches table
```sql
CREATE TABLE batches (
  id BIGINT PRIMARY KEY,
  batch_id VARCHAR(255) UNIQUE,
  program_id BIGINT,
  max_students INT NOT NULL,  -- Total capacity
  -- ... other fields
);
```

### vouchers table
```sql
CREATE TABLE vouchers (
  id BIGINT PRIMARY KEY,
  voucher_id VARCHAR(255) UNIQUE,
  batch_id VARCHAR(255) UNIQUE,  -- Links to batches.batch_id
  quantity INT NOT NULL,          -- Subsidized slots
  used_count INT DEFAULT 0,       -- Vouchers assigned
  -- ... other fields
  
  CONSTRAINT vouchers_batch_id_foreign 
    FOREIGN KEY (batch_id) 
    REFERENCES batches(batch_id)
);
```

### Relationship
```
One Batch (max_students=40) → One Voucher (quantity=25)
  ↓
40 total slots
  ↓
25 voucher slots + 15 self-funded slots
```

## Benefits of Separate Thresholds

### For Institution
✅ **Revenue Generation**: Self-funded students provide income  
✅ **Flexibility**: Can adjust voucher allocation per government budget  
✅ **Capacity Utilization**: Fill all slots even with limited vouchers  
✅ **Financial Planning**: Predictable mix of funded/self-funded students

### For Students
✅ **Options**: Can enroll even if vouchers exhausted  
✅ **Transparency**: Clear information about free vs paid slots  
✅ **Fairness**: First-come-first-served for vouchers  
✅ **Alternatives**: Self-funded option still available

### For Government
✅ **Budget Control**: Limit funded slots to budget  
✅ **Targeting**: Ensure vouchers go to eligible recipients  
✅ **Accountability**: Track voucher usage separately  
✅ **Efficiency**: Don't need to fund all slots

## Example Scenarios

### High-Demand Program
```
Program: IT Programming
Batch Capacity: 30
Voucher Quantity: 15

Applicants: 50 total
- 35 voucher-eligible
- 15 self-funded

Enrollment:
- 15 get vouchers (first 15 eligible applicants)
- 15 enroll self-funded
- 20 voucher-eligible applicants cannot enroll (vouchers exhausted)
- Batch full at 30 students
```

### Low-Demand Program
```
Program: Housekeeping
Batch Capacity: 40
Voucher Quantity: 30

Applicants: 25 total
- 18 voucher-eligible
- 7 self-funded

Enrollment:
- 18 get vouchers
- 7 enroll self-funded
- 12 unused vouchers
- 15 empty slots (25/40 filled)
```

### Budget-Limited Scenario
```
Program: Chef Training
Batch Capacity: 50
Voucher Quantity: 10 (limited government budget)

Applicants: 60 total
- 40 voucher-eligible
- 20 self-funded

Enrollment:
- 10 get vouchers (first 10 eligible)
- 40 enroll self-funded
- 30 voucher-eligible without vouchers (can choose self-funded)
- Batch full at 50 students
```

## Summary

| Aspect | Max Students | Voucher Quantity |
|--------|-------------|------------------|
| **Represents** | Total batch capacity | Subsidized slots |
| **Limit** | Physical/classroom limit | Budget limit |
| **Can exceed?** | No (hard limit) | No (≤ max_students) |
| **Funding** | Mixed (voucher + self) | Government only |
| **Flexibility** | Fixed per batch | Can vary per budget |
| **Student Type** | All students | Voucher holders only |

**Rule:** `1 ≤ voucher_quantity ≤ max_students`

**Example:** 
- max_students = 40 ✅
- quantity = 25 ✅ (valid: 25 ≤ 40)
- Result: 25 free + 15 paid = 40 total ✅
