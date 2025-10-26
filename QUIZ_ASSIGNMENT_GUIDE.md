# Quiz/Exam Assignment System Guide

## Overview
This guide explains how quizzes (exams) are assigned to batches and made available to students in the TrackEd system.

## Database Structure

### Key Tables and Relationships

```
users (trainers)
    ↓ (trainer_id)
batches
    ↓ (batch_id)
├── quizzes (assigned to batch)
└── users (students in batch)
```

### 1. **Batches Table**
- `id`: Primary key
- `batch_id`: Unique identifier (e.g., "BATCH-2025-001")
- `program_id`: Foreign key to programs table
- `trainer_id`: Foreign key to users table (trainer assigned to this batch)
- `status`: 'not started', 'ongoing', 'finished'
- `max_students`: Maximum number of students allowed
- `start_date`, `end_date`: Batch duration
- `schedule_days`, `schedule_time_start`, `schedule_time_end`: Class schedule

### 2. **Quizzes Table**
- `id`: Primary key
- `title`: Quiz title
- `description`: Quiz description
- `type`: 'written', 'oral', 'demonstration', 'observation'
- `batch_id`: **Foreign key to batches table** (THIS IS THE ASSIGNMENT LINK)
- `program_id`: Optional foreign key to programs table
- `time_limit`: Duration in minutes
- `passing_score`: Minimum score to pass (percentage)
- `retake_limit`: How many times students can retake the quiz
- `status`: 'active', 'draft', 'archived'

### 3. **Users Table** (Students)
- `id`: Primary key
- `student_id`: Unique student identifier
- `role`: 'student'
- `batch_id`: **Foreign key to batches table** (student's assigned batch)
- Other user fields...

### 4. **Quiz Attempts Table**
- `id`: Primary key
- `quiz_id`: Foreign key to quizzes table
- `user_id`: Foreign key to users table (student taking the quiz)
- `score`: Score achieved
- `status`: 'in_progress', 'completed', 'graded'
- `started_at`, `completed_at`: Timestamps

## How Assignment Works

### Step 1: Admin/Staff Assigns Trainer to Batch
```sql
-- When creating a batch, admin assigns a trainer
INSERT INTO batches (batch_id, program_id, trainer_id, ...)
VALUES ('BATCH-2025-001', 1, 5, ...);
```

### Step 2: Students are Enrolled in Batch
```sql
-- When approving applicants, they become students assigned to a batch
UPDATE users 
SET role = 'student', batch_id = 'BATCH-2025-001'
WHERE id = 123;
```

### Step 3: Trainer Creates Quiz for Their Batch
```sql
-- Trainer creates quiz and assigns it to a specific batch
INSERT INTO quizzes (title, type, batch_id, time_limit, passing_score, status)
VALUES ('Midterm Exam', 'written', 'BATCH-2025-001', 120, 85, 'active');
```

### Step 4: Students See Quizzes for Their Batch
```sql
-- Students only see quizzes assigned to their batch
SELECT quizzes.* 
FROM quizzes
INNER JOIN users ON users.batch_id = quizzes.batch_id
WHERE users.id = ? AND users.role = 'student'
AND quizzes.status = 'active';
```

## Implementation Flow

### Backend API Endpoints

#### 1. Get Trainer's Assigned Batches
```
GET /api/trainer/batches
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "batch_id": "BATCH-2025-001",
      "program_id": 1,
      "program_name": "Automotive Servicing NC II",
      "program_code": "AUTO-NC2",
      "status": "ongoing",
      "student_count": 25,
      "start_date": "2025-10-01",
      "end_date": "2025-12-15"
    }
  ]
}
```

#### 2. Create Quiz with Batch Assignment
```
POST /api/quizzes
```
**Request Body:**
```json
{
  "title": "Midterm Exam",
  "description": "Covers units 1-5",
  "type": "written",
  "batch_id": "BATCH-2025-001",
  "time_limit": 120,
  "passing_score": 85,
  "retake_limit": 1,
  "status": "draft",
  "questions": [...]
}
```

#### 3. Get Student's Available Quizzes
```
GET /api/student/quizzes
```
**Logic:** Returns quizzes where `quiz.batch_id = student.batch_id` and `quiz.status = 'active'`

### Frontend Components

#### 1. **TrainerExams.jsx**
- Fetches trainer's assigned batches via `batchService.getTrainerBatches()`
- Displays batches in dropdown (with student count)
- Passes batches to CreateExamModal

#### 2. **CreateExamModal.jsx**
- Shows "Assign to Batch" dropdown
- Displays: "BATCH-2025-001 - Automotive Servicing NC II (25 students)"
- Submits `batch_id` with quiz data

#### 3. **batchService.js**
- `getTrainerBatches()`: Fetches batches assigned to authenticated trainer
- `getBatchStudents()`: Gets list of students in a specific batch

## Key Benefits of This Approach

### 1. **Targeted Assignment**
- Quizzes are specific to a batch, not just a program
- Each batch can have different quizzes even for the same program

### 2. **Trainer Autonomy**
- Trainers can only create quizzes for batches they teach
- Prevents cross-contamination between different trainers' batches

### 3. **Student Clarity**
- Students only see quizzes relevant to their batch
- No confusion about which exam to take

### 4. **Progress Tracking**
- Easy to track quiz completion by batch
- Can generate batch-specific reports

### 5. **Flexibility**
- Same program taught by different trainers can have different assessments
- Allows customization based on batch progress

## Example Scenario

### Scenario: Two Trainers Teaching Same Program

**Setup:**
- Program: "Automotive Servicing NC II"
- Trainer A: Assigned to BATCH-2025-001 (Morning class, 25 students)
- Trainer B: Assigned to BATCH-2025-002 (Afternoon class, 28 students)

**Quiz Creation:**

**Trainer A creates:**
```
Quiz Title: "Engine Diagnostics Exam"
Assigned to: BATCH-2025-001
Students who see it: Only the 25 students in BATCH-2025-001
```

**Trainer B creates:**
```
Quiz Title: "Engine Diagnostics Test"
Assigned to: BATCH-2025-002
Students who see it: Only the 28 students in BATCH-2025-002
```

**Result:**
- Each trainer manages their own batch's assessments
- Students don't see quizzes from other batches
- Reports are batch-specific
- No interference between trainers

## Database Queries Reference

### Get all quizzes for a specific batch:
```sql
SELECT q.*, 
       COUNT(DISTINCT qa.user_id) as students_attempted
FROM quizzes q
LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
WHERE q.batch_id = 'BATCH-2025-001'
GROUP BY q.id;
```

### Get student's quiz results:
```sql
SELECT q.title, qa.score, qa.status, qa.completed_at
FROM quiz_attempts qa
INNER JOIN quizzes q ON qa.quiz_id = q.id
INNER JOIN users u ON qa.user_id = u.id
WHERE u.id = ? AND u.batch_id = q.batch_id;
```

### Get batch completion statistics:
```sql
SELECT 
    b.batch_id,
    COUNT(DISTINCT u.id) as total_students,
    COUNT(DISTINCT qa.user_id) as students_attempted,
    AVG(qa.score) as average_score
FROM batches b
LEFT JOIN users u ON u.batch_id = b.batch_id AND u.role = 'student'
LEFT JOIN quizzes q ON q.batch_id = b.batch_id
LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.user_id = u.id
WHERE b.batch_id = 'BATCH-2025-001'
GROUP BY b.batch_id;
```

## Summary

The quiz assignment system uses **batch_id** as the primary link between:
- Trainers and their classes (batches)
- Students and their cohort (batch)
- Quizzes and their target audience (batch)

This creates a clean, isolated assessment environment where:
✅ Trainers see only their batches
✅ Students see only their batch's quizzes  
✅ Reports are batch-specific
✅ No cross-contamination between different classes

The system is now fully implemented with:
- Backend API endpoints for trainer batches
- Frontend service layer (batchService.js)
- Updated CreateExamModal to use batch selection
- Proper validation and error handling
