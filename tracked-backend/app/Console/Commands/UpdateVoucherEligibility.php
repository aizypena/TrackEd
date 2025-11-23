<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UpdateVoucherEligibility extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'voucher:update-eligibility';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update voucher eligibility: delete expired eligible after 3 days, promote first waitlisted to eligible';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting voucher eligibility update...');
        $this->info('Current time: ' . Carbon::now()->format('Y-m-d H:i:s'));
        $this->info('Cutoff date (3 days ago): ' . Carbon::now()->subDays(3)->format('Y-m-d H:i:s'));
        $this->info('');
        
        // Find applicants who have been eligible for 3+ days
        $expiredEligible = User::where('role', 'applicant')
            ->where('application_status', 'pending')
            ->where('voucher_eligible', 1)
            ->where('created_at', '<=', Carbon::now()->subDays(3))
            ->get();

        $this->info("Found {$expiredEligible->count()} applicants with expired eligibility.");
        $this->info('');

        $deletedCount = 0;
        $promotedCount = 0;

        foreach ($expiredEligible as $applicant) {
            $programId = $applicant->course_program;
            $applicantName = "{$applicant->first_name} {$applicant->last_name}";
            $applicantId = $applicant->id;
            
            // Delete uploaded files
            $filesToDelete = [
                $applicant->valid_id_path,
                $applicant->transcript_path,
                $applicant->diploma_path,
                $applicant->passport_photo_path
            ];

            foreach ($filesToDelete as $filePath) {
                if ($filePath && Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }
            }
            
            // Log before deleting
            Log::info("Voucher eligibility expired - Applicant deleted", [
                'applicant_id' => $applicantId,
                'applicant_name' => $applicantName,
                'program_id' => $programId,
                'action' => 'deleted_expired_eligible',
                'expired_at' => Carbon::now()->toDateTimeString()
            ]);
            
            // Log to system_logs table
            DB::table('system_logs')->insert([
                'user_id' => $applicantId,
                'action' => 'voucher_eligibility_expired_deleted',
                'description' => "Applicant {$applicantName} (ID: {$applicantId}) voucher eligibility expired after 3 days. Applicant record and files deleted.",
                'log_level' => 'warning',
                'created_at' => Carbon::now(),
            ]);
            
            // Delete the applicant record
            $applicant->delete();
            $deletedCount++;
            
            $this->warn("✗ Deleted applicant #{$applicantId} ({$applicantName}) - expired eligibility.");
            
            // Find first waitlisted applicant for the same program and promote them to eligible
            $nextApplicant = User::where('role', 'applicant')
                ->where('application_status', 'pending')
                ->where('voucher_eligible', 2) // Changed from 0 to 2 (waitlisted)
                ->where('course_program', $programId)
                ->orderBy('created_at', 'asc')
                ->first();
            
            if ($nextApplicant) {
                $nextApplicant->update(['voucher_eligible' => 1]);
                $promotedCount++;
                
                $this->info("✓ Promoted applicant #{$nextApplicant->id} ({$nextApplicant->first_name} {$nextApplicant->last_name}) to eligible.");
                
                Log::info("Voucher eligibility promoted", [
                    'applicant_id' => $nextApplicant->id,
                    'applicant_name' => "{$nextApplicant->first_name} {$nextApplicant->last_name}",
                    'program_id' => $programId,
                    'action' => 'promoted_to_eligible',
                    'replaced_applicant_id' => $applicant->id,
                    'promoted_at' => Carbon::now()->toDateTimeString()
                ]);
                
                // Log to system_logs table
                DB::table('system_logs')->insert([
                    'user_id' => $nextApplicant->id,
                    'action' => 'voucher_eligibility_promoted',
                    'description' => "Applicant {$nextApplicant->first_name} {$nextApplicant->last_name} (ID: {$nextApplicant->id}) promoted to eligible status for program {$programId}. Replaced deleted applicant ID: {$applicantId}",
                    'log_level' => 'info',
                    'created_at' => Carbon::now(),
                ]);
                
                // TODO: Send email notification to the newly eligible applicant
                // Uncomment when email template is ready
                // Mail::to($nextApplicant->email)->send(new VoucherEligibleNotification($nextApplicant));
            } else {
                $this->info("No waitlisted applicants found for program {$programId}.");
                
                Log::info("No replacement found", [
                    'program_id' => $programId,
                    'action' => 'no_waitlisted_replacement',
                    'deleted_applicant_id' => $applicantId
                ]);
            }
        }
        
        $this->info('');
        $this->info('✅ Voucher eligibility update completed!');
        
        // Summary
        $this->info('');
        $this->info('╔═══════════════════════════════════════╗');
        $this->info('║           SUMMARY REPORT              ║');
        $this->info('╠═══════════════════════════════════════╣');
        $this->info("║ Deleted Expired:       {$deletedCount} applicant(s)  ║");
        $this->info("║ Promoted to Eligible:  {$promotedCount} applicant(s)  ║");
        $this->info('╚═══════════════════════════════════════╝');
        $this->info('');
        
        // Log batch summary to system_logs
        if ($deletedCount > 0 || $promotedCount > 0) {
            DB::table('system_logs')->insert([
                'user_id' => null,
                'action' => 'voucher_eligibility_batch_update',
                'description' => "Automated voucher eligibility batch update completed. Deleted: {$deletedCount} expired applicant(s), Promoted: {$promotedCount} waitlisted applicant(s) to eligible.",
                'log_level' => 'info',
                'created_at' => Carbon::now(),
            ]);
            
            Log::info("Voucher eligibility batch update summary", [
                'deleted_count' => $deletedCount,
                'promoted_count' => $promotedCount,
                'completed_at' => Carbon::now()->toDateTimeString()
            ]);
        }
        
        return Command::SUCCESS;
    }
}
