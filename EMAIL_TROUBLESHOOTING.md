# Email Troubleshooting Guide

## Current Status
✅ **Email functionality is working** - The system successfully sends emails when application status changes to "under review" or "rejected".

## Why You Might Not See the Email

### 1. Check Spam/Junk Folder
Gmail often marks automated emails as spam. 
- Open Gmail
- Click on "Spam" or "Junk" folder in the left sidebar
- Search for emails from `tracked132000@gmail.com`
- If found, mark as "Not Spam"

### 2. Gmail Promotions/Updates Tab
Gmail might categorize the email in different tabs:
- Check the "Promotions" tab
- Check the "Updates" tab
- Check the "Social" tab

### 3. Email Delivery Delay
Sometimes Gmail delays delivery of emails:
- Wait 2-5 minutes
- Refresh your inbox

### 4. Gmail Security Blocking
If using a test Gmail account, Google might block emails temporarily:
- Check https://myaccount.google.com/notifications
- Look for security alerts
- You might need to verify it's you sending the emails

## Verification Steps

### 1. Check Laravel Logs
```bash
cd tracked-backend
tail -f storage/logs/laravel.log | grep "email"
```

You should see:
```
Application status email sent to [email] for status: [status]
```

### 2. Test Email Directly
Run this command to test email:
```bash
cd tracked-backend
php artisan tinker
```

Then run:
```php
\Mail::raw('Test email', function($message) {
    $message->to('your-email@gmail.com')->subject('Test');
});
```

### 3. Check Email Configuration
Your current .env settings:
```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tracked132000@gmail.com
MAIL_PASSWORD=nsez jqex yfuu kujp
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tracked132000@gmail.com
```

## What's Happening Behind the Scenes

When you click "Mark as Under Review" or "Reject Application":

1. ✅ Backend updates application status
2. ✅ Backend checks if status changed to under_review or rejected
3. ✅ Backend prepares HTML email with professional template
4. ✅ Backend sends email using Gmail SMTP
5. ✅ Laravel logs "Application status email sent"
6. ⏳ Gmail processes the email (may take 1-5 minutes)
7. ⏳ Gmail decides: Inbox, Spam, or Promotions
8. ✉️ Email delivered to recipient

## Recommended Actions

### Option 1: Check Spam Folder (Most Likely)
The most common reason is that the email is in spam. Check your spam folder for emails from `tracked132000@gmail.com`.

### Option 2: Use a Different Email for Testing
Try changing the applicant's email to a different email address (not Gmail) like:
- Outlook/Hotmail
- Yahoo Mail
- A custom domain email

### Option 3: Add Sender to Contacts
1. Add `tracked132000@gmail.com` to your Gmail contacts
2. This tells Gmail to trust emails from this sender
3. Try triggering another email

### Option 4: Check Gmail Filters
1. Go to Gmail Settings → Filters and Blocked Addresses
2. Make sure no filters are auto-deleting emails from `tracked132000@gmail.com`

## Email Template Preview

The emails being sent look like this:

**Subject:** Application Under Review - TrackEd

**Body:**
```
Dear [Applicant Name],

Your application for [Program Name] is now under review.

Our staff team is currently reviewing your application and submitted documents. 
We will notify you once a decision has been made.

This process typically takes 3-5 business days. If we require any additional 
information, we will contact you via email.

Thank you for your patience.

Best regards,
TrackEd Team
```

## Need More Help?

If emails still don't arrive after checking all the above:

1. Check the Laravel log file for errors:
   ```bash
   cd tracked-backend
   cat storage/logs/laravel.log | grep -A 5 "Failed to send"
   ```

2. Try a different SMTP provider (like Mailtrap for testing)

3. Contact your system administrator to check server email configuration

## Success Indicators

You'll know emails are working when:
- ✅ Laravel log shows "Application status email sent"
- ✅ No errors in log file
- ✅ Email appears in inbox or spam folder
- ✅ Toast notification shows email sent message
