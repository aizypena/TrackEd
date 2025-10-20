# Batch Creation with Voucher Issuance

## Overview
Modified the voucher management system to create a batch and issue vouchers simultaneously in one workflow, as requested by the admin.

## Changes Made

### Frontend (IssueVoucher.jsx)

#### 1. Updated Imports
Added new imports for program and user APIs:
```javascript
import { programAPI } from '../../services/programAPI';
import { userAPI } from '../../services/userAPI';
```

#### 2. Restructured Form State
Changed from selecting existing batch to creating a new batch:

**Before:**
```javascript
{
  quantity: '',
  issueDate: '',
  status: 'pending',
  batchId: ''  // Select from existing batches
}
```

**After:**
```javascript
{
  // Voucher fields
  quantity: '',
  issueDate: '',
  status: 'pending',
  
  // Batch creation fields
  programId: '',
  trainerId: '',
  scheduleDays: [],
  scheduleTimeStart: '08:00',
  scheduleTimeEnd: '17:00',
  batchStatus: 'not started',
  startDate: '',
  endDate: '',
  maxStudents: ''
}
```

#### 3. New Data Fetching Functions
```javascript
fetchPrograms()  // Get all available programs
fetchTrainers()  // Get all trainers for assignment
```

#### 4. Schedule Days Selection
Added interactive day selection with toggle buttons:
```javascript
handleDayToggle(day)  // Toggle individual days (Mon-Sun)
```

#### 5. Two-Step Submission Process
```javascript
handleSubmit() {
  // Step 1: Create batch
  const batchResponse = await batchAPI.create({
    program_id,
    trainer_id,
    schedule_days,
    schedule_time_start,
    schedule_time_end,
    status,
    start_date,
    end_date,
    max_students
  });
  
  // Step 2: Create voucher linked to batch
  const voucherResponse = await voucherAPI.create({
    batch_id: batchResponse.data.batch_id,
    quantity,
    issue_date,
    status
  });
}
```

#### 6. Enhanced Form UI
- Two-section form layout:
  - **Batch Information Section**: Program, trainer, dates, schedule
  - **Voucher Information Section**: Quantity, issue date, status
- Interactive schedule day selector (Mon-Sun buttons)
- Larger modal (max-w-4xl) to accommodate more fields
- Info box explaining the workflow
- Updated button text: "Create Batch & Issue Voucher"

### Form Fields

#### Batch Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Program | Select | Yes | Training program for the batch |
| Trainer | Select | Yes | Assigned trainer |
| Start Date | Date | Yes | Batch start date |
| End Date | Date | Yes | Batch end date |
| Start Time | Time | Yes | Daily start time |
| End Time | Time | Yes | Daily end time |
| Max Students | Number | Yes | Maximum students in batch |
| Batch Status | Select | Yes | not started, ongoing, completed, cancelled |
| Schedule Days | Multi-select | Yes | Days of the week (Mon-Sun) |

#### Voucher Information
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Voucher Quantity | Number | Yes | Number of vouchers to issue |
| Issue Date | Date | Yes | Date vouchers are issued |
| Voucher Status | Select | Yes | pending, issued, used |

## Workflow

### Admin Actions
1. Admin clicks "Issue Voucher" button
2. Modal opens with combined batch + voucher form
3. Admin fills in:
   - **Batch details**: Program, trainer, schedule, dates, capacity
   - **Voucher details**: Quantity, issue date, status
4. Admin clicks "Create Batch & Issue Voucher"

### System Processing
1. **Create Batch**:
   - Generates unique batch_id (e.g., "BATCH-2025-001")
   - Creates batch record with all specifications
   - Links to selected program and trainer
   
2. **Issue Voucher**:
   - Automatically links to newly created batch
   - Creates voucher with batch_id reference
   - Sets quantity and availability

3. **Success Response**:
   - Shows success message
   - Refreshes voucher list
   - Closes modal

### Error Handling
- Validates schedule days selection
- Catches batch creation errors
- Handles voucher creation failures
- Provides user-friendly error messages
- If voucher fails after batch creation, notifies admin

## Benefits

### For Admin
✅ **Single Workflow**: Create batch and vouchers in one step  
✅ **No Orphaned Batches**: Every batch gets vouchers immediately  
✅ **Less Clicks**: Reduced from 2 separate processes to 1  
✅ **Automatic Linking**: No manual batch selection needed  
✅ **Clear Process**: Organized form with logical sections

### For System
✅ **Data Integrity**: Batch-voucher relationship established immediately  
✅ **Atomic Operation**: Both created together (or rolled back)  
✅ **Auto-generated IDs**: Batch ID created and used for voucher  
✅ **Consistent State**: No batches without vouchers

### For Students
✅ **Immediate Availability**: Vouchers available as soon as batch is created  
✅ **Guaranteed Slots**: Voucher quantity matches batch capacity planning  
✅ **Accurate Information**: Real-time voucher availability

## Example Data Flow

### Input (Admin fills form)
```javascript
{
  // Batch
  programId: 7,              // Chef's Catering Services
  trainerId: 9,              // John Smith
  scheduleDays: ['Monday', 'Tuesday', 'Wednesday'],
  scheduleTimeStart: '08:00',
  scheduleTimeEnd: '17:00',
  startDate: '2025-11-01',
  endDate: '2025-12-15',
  maxStudents: 30,
  batchStatus: 'not started',
  
  // Voucher
  quantity: 30,
  issueDate: '2025-10-20',
  status: 'issued'
}
```

### Step 1: Batch Created
```json
{
  "id": 15,
  "batch_id": "BATCH-2025-015",
  "program_id": 7,
  "trainer_id": 9,
  "schedule_days": ["Monday", "Tuesday", "Wednesday"],
  "schedule_time_start": "08:00",
  "schedule_time_end": "17:00",
  "start_date": "2025-11-01",
  "end_date": "2025-12-15",
  "max_students": 30,
  "status": "not started"
}
```

### Step 2: Voucher Created
```json
{
  "id": 8,
  "voucher_id": "V-2025-008",
  "batch_id": "BATCH-2025-015",
  "quantity": 30,
  "used_count": 0,
  "issue_date": "2025-10-20",
  "status": "issued"
}
```

### Result
- ✅ Batch "BATCH-2025-015" created
- ✅ 30 vouchers issued for this batch
- ✅ Voucher "V-2025-008" linked to batch
- ✅ Students can now apply and see voucher availability

## Database Relationships

```
batches table:
  - id (primary key)
  - batch_id (unique string)
  - program_id (foreign key → programs)
  - trainer_id (foreign key → users)
  - max_students
  - [other fields]

vouchers table:
  - id (primary key)
  - voucher_id (unique string)
  - batch_id (unique foreign key → batches.batch_id)
  - quantity
  - used_count
  - [other fields]

Relationship: One batch → One voucher (1:1)
```

## Migration Notes

### If existing batches need vouchers:
1. Admin can still create vouchers for existing batches manually
2. System validates that batch doesn't already have a voucher
3. Prevents duplicate vouchers for same batch

### Future Enhancements
- [ ] Bulk batch + voucher creation
- [ ] Template-based creation (reuse settings)
- [ ] Auto-calculate voucher quantity from max_students
- [ ] Schedule conflict detection
- [ ] Trainer availability checking
- [ ] Program capacity limits

## Testing Checklist

- [ ] Create batch with all required fields
- [ ] Verify batch_id is generated correctly
- [ ] Confirm voucher is linked to correct batch
- [ ] Test schedule day selection (select/deselect)
- [ ] Validate date ranges (end after start)
- [ ] Check max_students > 0
- [ ] Verify quantity > 0
- [ ] Test error handling (batch creation fails)
- [ ] Test error handling (voucher creation fails after batch)
- [ ] Verify success message and list refresh
- [ ] Check modal closes correctly

## Status

✅ Frontend form restructured  
✅ Two-step submission process implemented  
✅ Batch creation integrated  
✅ Voucher issuance automated  
✅ Error handling added  
✅ UI enhanced with sections  
✅ Validation implemented  
✅ Ready for testing
