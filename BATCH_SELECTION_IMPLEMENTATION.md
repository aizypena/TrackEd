# Batch Selection and Waitlist Implementation

## Overview
Added batch selection functionality to the application form with automatic waitlist handling when batches are full.

## Backend Changes

### 1. New API Endpoint: `/api/public/batches/{programId}`
**File**: `tracked-backend/routes/api.php`

**Purpose**: Fetch available batches for a specific program with capacity information

**Response Structure**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "batch_id": "BATCH-2025-001",
      "name": "BATCH-2025-001",
      "program_id": 5,
      "schedule_days": ["Monday", "Wednesday", "Friday"],
      "schedule_time_start": "09:00",
      "schedule_time_end": "12:00",
      "start_date": "2025-01-15",
      "end_date": "2025-03-15",
      "max_students": 30,
      "current_students": 25,
      "available_slots": 5,
      "is_full": false
    }
  ]
}
```

**Features**:
- Only shows active batches
- Calculates current enrolled students (active + inactive statuses)
- Determines if batch is full
- Shows available slots

### 2. Updated ApplicationController
**File**: `tracked-backend/app/Http/Controllers/ApplicationController.php`

**Changes**:
1. Added `batchId` validation (optional field)
2. Added automatic waitlist detection:
   - Checks if selected batch is full
   - Sets application_status to 'waitlisted' if batch is full
   - Sets application_status to 'pending' if batch has space or no batch selected
3. Stores batch_id in user record
4. Enhanced logging to include batch and waitlist information

**Waitlist Logic**:
```php
if (!empty($validated['batchId'])) {
    $batch = \App\Models\Batch::where('batch_id', $validated['batchId'])->first();
    if ($batch) {
        $currentStudents = User::where('batch_id', $batch->batch_id)
            ->where('role', 'student')
            ->whereIn('status', ['active', 'inactive'])
            ->count();
        
        $maxStudents = $batch->max_students ?? 0;
        if ($currentStudents >= $maxStudents) {
            $isWaitlisted = true;
        }
    }
}
```

## Frontend Changes

### 1. Updated State Management
**File**: `tracked-frontend/src/pages/applicants/Application.jsx`

**New State Variables**:
```javascript
const [availableBatches, setAvailableBatches] = useState([]);
const [loadingBatches, setLoadingBatches] = useState(false);
const [selectedBatchInfo, setSelectedBatchInfo] = useState(null);
```

**New Form Field**:
```javascript
formData: {
  // ... existing fields
  batchId: '',
}
```

### 2. Automatic Batch Fetching
Added `useEffect` hook that fetches batches whenever a program is selected:
- Automatically loads batches when `courseProgram` changes
- Clears batches when no program is selected
- Shows loading state during fetch

### 3. Enhanced Educational Background Section
**Location**: `renderEducationalBackground()` function

**Features Added**:

#### Batch Selection Dropdown
- Shows after a program is selected
- Displays batch capacity information in each option:
  - Full batches: "BATCH-2025-001 - FULL (Waitlist Available) (30/30)"
  - Available batches: "BATCH-2025-001 - 5 slot(s) available (25/30)"
- Optional field (users can apply without selecting a batch)

#### Batch Information Panel
Appears when a batch is selected, showing:

**For Full Batches** (Amber/Warning Style):
- "Batch is Full - Waitlist Available" message
- Explains user will be placed on waitlist
- Shows current capacity (e.g., 30/30 students)
- Displays schedule information if available

**For Available Batches** (Blue/Info Style):
- "Batch Available" message
- Shows available slots (e.g., "5 slot(s) available")
- Displays total capacity
- Shows schedule information if available

**Schedule Display**:
- Days: Monday, Wednesday, Friday
- Times: 09:00 - 12:00 (if available)

### 4. Updated Confirmation Modal
Added batch information display in the review modal:
- Shows selected batch name
- Displays waitlist warning if batch is full
- Amber-colored alert box for waitlist status

### 5. Enhanced handleChange Function
Added special handling for:
- **courseProgram**: Resets batch selection when program changes
- **batchId**: Updates selectedBatchInfo with full batch details

## User Experience Flow

### Scenario 1: Batch with Available Slots
1. User selects a training program
2. Batches load automatically
3. User sees batch options with available slots
4. User selects a batch showing "5 slot(s) available (25/30)"
5. Blue information panel appears confirming availability
6. User proceeds with application
7. Application status: "pending"

### Scenario 2: Full Batch (Waitlist)
1. User selects a training program
2. Batches load automatically
3. User sees batch marked "FULL (Waitlist Available) (30/30)"
4. User selects the full batch
5. Amber warning panel appears explaining waitlist
6. User proceeds with application
7. Application status: "waitlisted"
8. User will be automatically enrolled when slot becomes available

### Scenario 3: No Batch Selection
1. User selects a training program
2. User chooses not to select a batch (skips optional field)
3. User proceeds with application
4. Application status: "pending"
5. Admin will assign batch later

### Scenario 4: No Batches Available
1. User selects a training program
2. System shows "No batches available for this program"
3. User can still proceed with application
4. Application status: "pending"
5. User will be assigned when batches are created

## Visual Indicators

### Color Coding
- **Blue (Available)**: Batch has open slots
- **Amber (Waitlist)**: Batch is full, waitlist available
- **Gray (Disabled)**: Loading or no batches available

### Icons
- Information icon (ℹ️) for both available and full batches
- Loading spinner during batch fetch
- Checkmark for selected batch in confirmation

## Technical Notes

### Database Considerations
- Uses string `batch_id` field (not numeric `id`) for batch references
- Counts only students with 'active' or 'inactive' status
- Excludes 'completed' and 'dropped' students from capacity calculation

### API Performance
- Batch endpoint is public (no authentication required)
- Efficient query using single database call
- Batch information cached in frontend state

### Error Handling
- Gracefully handles no batches available
- Shows appropriate messages for loading states
- Console logs errors without breaking user experience

## Future Enhancements

### Potential Improvements
1. **Real-time Updates**: WebSocket notifications when batch capacity changes
2. **Batch Recommendations**: Suggest best batch based on user availability
3. **Waitlist Position**: Show user's position in waitlist queue
4. **Automatic Notifications**: Email when moving from waitlist to enrolled
5. **Batch Comparison**: Side-by-side comparison of different batches
6. **Calendar Integration**: Visual schedule calendar for batch selection

### Admin Features to Consider
1. Waitlist management dashboard
2. Bulk waitlist to enrolled conversion
3. Waitlist priority settings
4. Automated batch assignment for waitlisted applicants

## Testing Checklist

- [ ] Program selection loads correct batches
- [ ] Batch capacity displays accurately
- [ ] Full batch shows waitlist message
- [ ] Available batch shows slot count
- [ ] No batch selection allows application
- [ ] Confirmation modal shows batch info
- [ ] Waitlist status saved to database
- [ ] System logs include batch information
- [ ] Schedule information displays correctly
- [ ] Batch resets when program changes

## Files Modified

### Backend
1. `/tracked-backend/routes/api.php` - Added public batches endpoint
2. `/tracked-backend/app/Http/Controllers/ApplicationController.php` - Added waitlist logic

### Frontend
1. `/tracked-frontend/src/pages/applicants/Application.jsx` - Complete batch selection UI

## Related Features
- Enrollment management (admin can manually adjust batch assignments)
- Batch capacity tracking (admin dashboard)
- Student status management (affects capacity calculations)
