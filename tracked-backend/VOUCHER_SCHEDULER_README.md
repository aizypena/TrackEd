# Voucher Eligibility Task Scheduler

This system automatically manages voucher eligibility for applicants.

## How It Works

1. **Every day at midnight (Asia/Manila timezone)**, the system checks for:
   - Applicants who have been "eligible" for 3+ days
   - Are still in "pending" application status

2. **For each expired eligible applicant:**
   - Marks them as "waitlisted" (voucher_eligible = 2)
   - Finds the next "not eligible" applicant for the same program
   - Promotes them to "eligible" (voucher_eligible = 1)
   - Sends email notification to the newly eligible applicant
   - Logs all actions to system_logs table

## Manual Testing

You can test the command manually without waiting for the scheduled time:

```bash
# Local development
php artisan voucher:update-eligibility

# Production server
cd /var/www/smitracked/tracked-backend
php artisan voucher:update-eligibility
```

## Production Setup

### 1. Add Cron Job

On your production server, edit the crontab:

```bash
crontab -e
```

Add this line:

```
* * * * * cd /var/www/smitracked/tracked-backend && php artisan schedule:run >> /dev/null 2>&1
```

This runs Laravel's scheduler every minute, which then executes scheduled tasks at their defined times.

### 2. Verify Cron Job

Check if cron job is added:

```bash
crontab -l
```

### 3. Check Scheduler List

View all scheduled tasks:

```bash
php artisan schedule:list
```

### 4. Test Scheduler

Test if the scheduler is working:

```bash
php artisan schedule:run
```

## Email Configuration

To enable email notifications, update your `.env` file:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@smi.edu.ph
MAIL_FROM_NAME="${APP_NAME}"

FRONTEND_URL=http://localhost:3000
```

Then uncomment this line in `app/Console/Commands/UpdateVoucherEligibility.php`:

```php
Mail::to($nextApplicant->email)->send(new VoucherEligibleNotification($nextApplicant));
```

## Monitoring

### Check Logs

View Laravel logs for voucher eligibility updates:

```bash
tail -f storage/logs/laravel.log | grep "Voucher eligibility"
```

### Check System Logs Table

Query the system_logs table:

```sql
SELECT * FROM system_logs 
WHERE action IN ('voucher_eligibility_expired', 'voucher_eligibility_promoted') 
ORDER BY created_at DESC 
LIMIT 20;
```

## Changing the Schedule

Edit `routes/console.php` to change when the task runs:

```php
// Current: Daily at midnight
Schedule::command('voucher:update-eligibility')
    ->daily()
    ->at('00:00')
    ->timezone('Asia/Manila');

// Alternative schedules:
// ->hourly()              // Every hour
// ->everyTwoHours()       // Every 2 hours
// ->dailyAt('13:00')      // Daily at 1 PM
// ->twiceDaily(1, 13)     // 1 AM and 1 PM
// ->weekly()              // Every Sunday at 00:00
// ->weeklyOn(1, '8:00')   // Every Monday at 8 AM
// ->monthly()             // First day of month at 00:00
```

## Changing the Expiry Time

Edit `app/Console/Commands/UpdateVoucherEligibility.php`:

```php
// Current: 3 days
->where('created_at', '<=', Carbon::now()->subDays(3))

// Change to 5 days:
->where('created_at', '<=', Carbon::now()->subDays(5))

// Change to 1 week:
->where('created_at', '<=', Carbon::now()->subWeek())
```

## Troubleshooting

### Command not found

```bash
php artisan list | grep voucher
```

If not listed, make sure the command file exists and is properly namespaced.

### Cron not running

Check cron service status:

```bash
systemctl status cron     # Debian/Ubuntu
systemctl status crond    # CentOS/RHEL
```

Check cron logs:

```bash
grep CRON /var/log/syslog  # Ubuntu
tail -f /var/log/cron      # CentOS
```

### Emails not sending

Test email configuration:

```bash
php artisan tinker
Mail::raw('Test email', function($message) {
    $message->to('your-email@example.com')->subject('Test');
});
```

## Files Created

- `app/Console/Commands/UpdateVoucherEligibility.php` - Main command
- `app/Mail/VoucherEligibleNotification.php` - Email notification class
- `resources/views/emails/voucher-eligible.blade.php` - Email template
- `routes/console.php` - Updated with scheduler
- `VOUCHER_SCHEDULER_README.md` - This file

## Support

For issues or questions:
- Email: admin@smi.edu.ph
- Check logs: `storage/logs/laravel.log`
- System logs table: `system_logs`
