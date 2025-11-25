# 📊 Enrollment Trends Feature - Complete Guide

A comprehensive analytics dashboard that tracks and visualizes student enrollments over time, helping administrators understand enrollment patterns, program popularity, and payment trends.

---

## 🎯 What Does It Do?

The Enrollment Trends feature helps you answer questions like:
- 📈 How many students enrolled this quarter?
- 🏆 Which programs are most popular?
- 💳 How many students use vouchers vs. paying themselves?
- 📊 Is enrollment growing or declining?
- 🎓 Which programs need more marketing?

---

## 🧩 How It Works (Simple Overview)

Think of it like this:

1. **Collect Data** 📥
   - Every time a student enrolls, we save:
     - When they enrolled (date)
     - Which program they chose
     - Whether they used a voucher or paid

2. **Group the Data** 📦
   - Like sorting photos into albums by month/year
   - We group enrollments by:
     - **Week** (Week 1, Week 2, ...)
     - **Month** (Jan 2024, Feb 2024, ...)
     - **Quarter** (Q1 2024 = Jan+Feb+Mar)
     - **Year** (2024, 2025, ...)

3. **Count & Calculate** 🧮
   - Count how many students in each group
   - Calculate percentages
   - Find which programs are most popular

4. **Show as Charts** 📊
   - Display the data as pretty graphs
   - Easy to understand at a glance

---

## 📖 Key Concepts Explained

### 🗓️ What is a Quarter?

A **quarter** is a 3-month period:

```
Q1 = January + February + March
Q2 = April + May + June
Q3 = July + August + September
Q4 = October + November + December
```

**Example:** If 5 students enrolled in January, 8 in February, and 7 in March:
- **Q1 2024** = 5 + 8 + 7 = **20 students**

### 📊 How We Calculate Growth Rate

**Formula:** `((New Value - Old Value) / Old Value) × 100`

**Example:**
```
Last quarter (Q3): 45 students
This quarter (Q4): 60 students

Growth = ((60 - 45) / 45) × 100
Growth = (15 / 45) × 100
Growth = 33.3% increase! 🎉
```

### 💳 Voucher Percentage

**Formula:** `(Students with Voucher / Total Students) × 100`

**Example:**
```
Total students: 100
Used voucher: 60
Paid themselves: 40

Voucher % = (60 / 100) × 100 = 60%
Paid % = (40 / 100) × 100 = 40%
```

---

## 🛠️ Technical Implementation

### 📚 Database Structure

We store enrollment data in these tables:

```sql
enrollments table:
├── id
├── user_id (which student)
├── batch_id (which class/batch)
├── enrollment_date (when they enrolled)
├── voucher (1 = used voucher, 0 = paid)
└── created_at

batches table:
├── id
├── batch_id
├── program_id (which program)
└── ...

programs table:
├── id
├── title (program name)
└── ...
```

### 🔗 How Tables Connect

```
Student enrolls
    ↓
Enrollment record created
    ↓
Links to a Batch
    ↓
Batch links to a Program
    ↓
We can see: Student → enrolled in → Program X → on Date Y
```

---

## 💻 Backend Code Explanation

### Step 1: Fetch All Enrollment Data

```php
// Get enrollments with program names
$enrollments = DB::table('enrollments')
    ->join('batches', 'enrollments.batch_id', '=', 'batches.id')
    ->join('programs', 'batches.program_id', '=', 'programs.id')
    ->select(
        'enrollments.enrollment_date as date',  // When they enrolled
        'programs.title as program',             // Which program
        DB::raw('COUNT(enrollments.id) as enrollment'), // How many
        'enrollments.voucher'                    // Payment method
    )
    ->groupBy('enrollments.enrollment_date', 'programs.title', 'enrollments.voucher')
    ->get();
```

**What this does:**
- Combines data from 3 tables
- Groups enrollments by date, program, and payment type
- Counts how many students in each group

**Example Result:**
```php
[
    { date: '2024-01-15', program: 'Cookery', enrollment: 5, voucher: 1 },
    { date: '2024-01-15', program: 'Welding', enrollment: 3, voucher: 0 },
    { date: '2024-02-10', program: 'Cookery', enrollment: 8, voucher: 1 }
]
```

### Step 2: Calculate Voucher Statistics

```php
// Count total enrollments
$totalEnrollments = DB::table('enrollments')->count(); // 100

// Count enrollments with voucher
$withVoucher = DB::table('enrollments')->where('voucher', 1)->count(); // 60

// Calculate those who paid
$withoutVoucher = $totalEnrollments - $withVoucher; // 40

// Calculate percentages
$voucherPercentage = ($withVoucher / $totalEnrollments) * 100; // 60%
$paidPercentage = ($withoutVoucher / $totalEnrollments) * 100; // 40%
```

### Step 3: Count Enrollments Per Program

```php
$programTotals = [];

foreach ($enrollments as $record) {
    $program = $record->program; // "Cookery NC II"
    
    // If program not in array yet, start at 0
    if (!isset($programTotals[$program])) {
        $programTotals[$program] = 0;
    }
    
    // Add this enrollment count
    $programTotals[$program] += $record->enrollment;
}

// Sort programs by enrollment count (highest first)
arsort($programTotals);
```

**Example Result:**
```php
[
    'Cookery NC II' => 150,      // Most popular
    'Food & Beverage' => 120,
    'Welding NC II' => 95,
    'Bartending NC II' => 75
]
```

### Step 4: Send Data to Frontend

```php
return response()->json([
    'allData' => $enrollments,        // Raw enrollment data
    'programTotals' => $programTotals, // Total per program
    'voucherStats' => [
        'total' => $totalEnrollments,
        'withVoucher' => $withVoucher,
        'withoutVoucher' => $withoutVoucher,
        'voucherPercentage' => $voucherPercentage,
        'paidPercentage' => $paidPercentage
    ],
    'stats' => [
        'totalPrograms' => count($programTotals),
        'totalEnrollments' => $totalEnrollments,
        'avgPerProgram' => $totalEnrollments / count($programTotals)
    ]
]);
```

---

## 🎨 Frontend Code Explanation

### Step 1: Get Data from Backend

```javascript
const fetchTrendsData = async () => {
    // Call the API
    const response = await fetch('https://api.smitracked.cloud/api/admin/enrollment-trends', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    
    // Convert to JavaScript object
    const data = await response.json();
    
    // Save to state
    setTrendsData(data);
};
```

### Step 2: Group Data by Time Period

This is where the magic happens! We take enrollment dates and group them.

```javascript
const getDataByViewType = (programName) => {
    const aggregatedData = {};
    
    // Filter by program if needed
    const filteredData = programName === 'all' 
        ? trendsData.allData 
        : trendsData.allData.filter(record => record.program === programName);
    
    // Loop through each enrollment record
    filteredData.forEach(record => {
        const date = new Date(record.date); // "2024-01-15"
        const year = date.getFullYear();     // 2024
        const month = date.getMonth() + 1;   // 1 (January)
        
        let key; // This will be our group label
        
        switch (viewType) {
            case 'quarterly':
                // Calculate which quarter (1, 2, 3, or 4)
                const quarter = Math.ceil(month / 3);
                key = `Q${quarter} ${year}`; // "Q1 2024"
                break;
                
            case 'monthly':
                const monthNames = ['Jan', 'Feb', 'Mar', ...];
                key = `${monthNames[month - 1]} ${year}`; // "Jan 2024"
                break;
                
            case 'yearly':
                key = `${year}`; // "2024"
                break;
                
            case 'weekly':
                const weekNum = getWeekNumber(date);
                key = `Week ${weekNum} ${year}`; // "Week 3 2024"
                break;
        }
        
        // Add enrollment count to this group
        if (!aggregatedData[key]) {
            aggregatedData[key] = 0; // Start counting
        }
        aggregatedData[key] += record.enrollment; // Add to total
    });
    
    return aggregatedData;
};
```

**Example Transformation:**

**Raw Data:**
```javascript
[
    { date: '2024-01-15', program: 'Cookery', enrollment: 5 },
    { date: '2024-02-10', program: 'Cookery', enrollment: 8 },
    { date: '2024-03-20', program: 'Cookery', enrollment: 7 },
    { date: '2024-04-05', program: 'Cookery', enrollment: 10 }
]
```

**After Quarterly Grouping:**
```javascript
{
    'Q1 2024': 20,  // Jan(5) + Feb(8) + Mar(7) = 20
    'Q2 2024': 10   // Apr(10) = 10
}
```

### Step 3: Calculate Which Quarter

```javascript
const getQuarter = (month) => {
    return Math.ceil(month / 3);
};
```

**How it works:**

| Month | Month Number | Calculation | Quarter |
|-------|--------------|-------------|---------|
| January | 1 | 1 ÷ 3 = 0.33, round up = 1 | Q1 |
| February | 2 | 2 ÷ 3 = 0.67, round up = 1 | Q1 |
| March | 3 | 3 ÷ 3 = 1.0, round up = 1 | Q1 |
| April | 4 | 4 ÷ 3 = 1.33, round up = 2 | Q2 |
| May | 5 | 5 ÷ 3 = 1.67, round up = 2 | Q2 |
| ... | ... | ... | ... |

### Step 4: Filter by Time Range

```javascript
const getFilteredData = () => {
    const dataForProgram = getDataByViewType(selectedProgram);
    const periods = Object.keys(dataForProgram); // ["Q1 2022", "Q2 2022", ...]
    
    if (timeRange === '1year') {
        // Find most recent year
        const currentYear = new Date().getFullYear(); // 2024
        
        // Show only this year
        return periods.filter(period => {
            const year = extractYear(period); // Gets "2024" from "Q1 2024"
            return year === currentYear;
        });
    }
    
    if (timeRange === '3years') {
        const currentYear = new Date().getFullYear();
        const cutoffYear = currentYear - 2; // 2024 - 2 = 2022
        
        // Show last 3 years
        return periods.filter(period => {
            const year = extractYear(period);
            return year >= cutoffYear; // Show 2022, 2023, 2024
        });
    }
    
    // For 'all', show everything
    return periods;
};
```

### Step 5: Calculate Growth Rate

```javascript
const calculateGrowthRate = () => {
    const periods = getFilteredData(); // ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"]
    
    if (periods.length < 2) {
        return 0; // Need at least 2 periods to compare
    }
    
    const dataForProgram = getDataByViewType(selectedProgram);
    
    // Get last two periods
    const currentPeriod = periods[periods.length - 1];     // "Q4 2024"
    const previousPeriod = periods[periods.length - 2];    // "Q3 2024"
    
    const currentCount = dataForProgram[currentPeriod] || 0;    // 60
    const previousCount = dataForProgram[previousPeriod] || 0;  // 45
    
    if (previousCount === 0) {
        return 0; // Can't calculate growth from zero
    }
    
    // Growth formula
    const growth = ((currentCount - previousCount) / previousCount) * 100;
    
    return growth.toFixed(1); // Round to 1 decimal: 33.3
};
```

**Example Calculation:**
```
Q3 2024: 45 students
Q4 2024: 60 students

Growth = ((60 - 45) / 45) × 100
       = (15 / 45) × 100
       = 0.333... × 100
       = 33.3%
```

### Step 6: Prepare Chart Data

```javascript
// Line Chart - Enrollment Trends Over Time
const chartData = {
    labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
    datasets: [{
        label: 'Quarterly Enrollments',
        data: [20, 35, 45, 60],
        borderColor: 'rgb(59, 130, 246)',        // Blue line
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue fill
        tension: 0.4  // Makes line curved instead of straight
    }]
};

// Bar Chart - Popular Programs
const programChart = {
    labels: ['Cookery NC II', 'Food & Beverage', 'Welding NC II'],
    datasets: [{
        label: 'Total Enrollments',
        data: [150, 120, 95],
        backgroundColor: [
            'rgba(54, 162, 235, 0.8)',  // Blue
            'rgba(75, 192, 192, 0.8)',  // Teal
            'rgba(255, 206, 86, 0.8)'   // Yellow
        ]
    }]
};

// Doughnut Chart - Voucher Distribution
const voucherChart = {
    labels: ['With Voucher', 'Self-Paid'],
    datasets: [{
        data: [60, 40],  // Percentages
        backgroundColor: [
            'rgba(168, 85, 247, 0.8)',  // Purple
            'rgba(34, 197, 94, 0.8)'    // Green
        ]
    }]
};
```

---

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens Page                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Calls API                             │
│   GET /api/admin/enrollment-trends                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend Processes                           │
│  1. Query database (JOIN tables)                            │
│  2. Group by date, program, voucher                         │
│  3. Calculate statistics                                     │
│  4. Count program totals                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Send JSON Response                              │
│  {                                                           │
│    allData: [...],          // Raw enrollment records       │
│    programTotals: {...},    // Total per program            │
│    voucherStats: {...},     // Voucher statistics           │
│    stats: {...}             // Overall statistics           │
│  }                                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│             Frontend Receives Data                           │
│         Stores in trendsData state                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              User Selects Filters                            │
│  - View Type: Weekly/Monthly/Quarterly/Yearly               │
│  - Program: All or specific program                         │
│  - Time Range: 1/3/5 years or All                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Frontend Aggregates Data                           │
│  1. getDataByViewType() - Group by period                   │
│  2. getFilteredData() - Apply time range                    │
│  3. calculateGrowthRate() - Calculate growth                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Render Charts                                   │
│  - Line Chart: Enrollment trends                            │
│  - Bar Chart: Popular programs                              │
│  - Doughnut Chart: Voucher distribution                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Real-World Example

Let's walk through a complete example:

### Scenario
SMI Training Center wants to see Q1 2024 enrollment for Cookery program.

### Step 1: Database Query
```sql
SELECT 
    enrollment_date,
    programs.title,
    COUNT(*) as enrollment,
    voucher
FROM enrollments
JOIN batches ON enrollments.batch_id = batches.id
JOIN programs ON batches.program_id = programs.id
GROUP BY enrollment_date, programs.title, voucher
```

### Step 2: Backend Returns
```json
{
  "allData": [
    { "date": "2024-01-10", "program": "Cookery NC II", "enrollment": 3, "voucher": 1 },
    { "date": "2024-01-10", "program": "Cookery NC II", "enrollment": 2, "voucher": 0 },
    { "date": "2024-02-15", "program": "Cookery NC II", "enrollment": 5, "voucher": 1 },
    { "date": "2024-03-20", "program": "Cookery NC II", "enrollment": 4, "voucher": 0 }
  ],
  "voucherStats": {
    "withVoucher": 8,
    "withoutVoucher": 6,
    "voucherPercentage": 57.1
  }
}
```

### Step 3: Frontend Aggregates (Quarterly)
```javascript
Processing dates:
- 2024-01-10 → Month 1 → Quarter 1
- 2024-02-15 → Month 2 → Quarter 1  
- 2024-03-20 → Month 3 → Quarter 1

Result:
{
  "Q1 2024": 14  // 3 + 2 + 5 + 4 = 14 total enrollments
}
```

### Step 4: Chart Display
```
Line Chart Shows:
Q4 2023: 10 students
Q1 2024: 14 students
Growth: +40% 📈
```

---

## 🔍 Common Questions

### Q: Why group data on frontend instead of backend?
**A:** Flexibility! The backend sends raw data once, but users can switch between weekly/monthly/quarterly views instantly without waiting for new API calls.

### Q: How is this different from a simple count?
**A:** We don't just count—we track trends over time, compare periods, calculate growth rates, and analyze payment patterns.

### Q: What if there's no data for a period?
**A:** We show 0 enrollments for that period. The chart will have a gap or zero point.

### Q: Can we export this data?
**A:** Yes! There's an "Export CSV" button that downloads all the data in spreadsheet format.

---

## 🚀 Benefits

✅ **Quick Insights** - See trends at a glance  
✅ **Historical Analysis** - Compare current vs. past performance  
✅ **Program Planning** - Identify which programs need more resources  
✅ **Financial Tracking** - Monitor voucher vs. paid enrollments  
✅ **Flexible Views** - Same data, multiple perspectives  
✅ **Export Ready** - Download data for reports  

---

## 📝 Summary

The Enrollment Trends feature is like a **time machine for your enrollment data**. It takes individual enrollment records and transforms them into meaningful insights by:

1. **Collecting** enrollment data from the database
2. **Grouping** by time periods (weeks, months, quarters, years)
3. **Counting** enrollments in each group
4. **Calculating** statistics and growth rates
5. **Visualizing** as interactive charts
6. **Allowing** flexible filtering and exporting

All of this helps administrators make **data-driven decisions** about program offerings, resource allocation, and marketing strategies! 🎯

---

**Made with ❤️ for SMI Training Center**
