<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
    protected $description = 'Update voucher eligibility: eligible->waitlisted after 3 days, promote next not-eligible to eligible';

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

        $waitlistedCount = 0;
        $promotedCount = 0;

        foreach ($expiredEligible as $applicant) {
            $programId = $applicant->course_program;
            
            // Mark as waitlisted
            $applicant->update(['voucher_eligible' => 2]);
            $waitlistedCount++;
            
            $this->info("✓ Marked applicant #{$applicant->id} ({$applicant->first_name} {$applicant->last_name}) as waitlisted.");
            
            Log::info("Voucher eligibility expired", [
                'applicant_id' => $applicant->id,
                'applicant_name' => "{$applicant->first_name} {$applicant->last_name}",
                'program_id' => $programId,
                'action' => 'marked_as_waitlisted',
                'expired_at' => Carbon::now()->toDateTimeString()
            ]);
            
            // Log to system_logs table
            DB::table('system_logs')->insert([
                'user_id' => $applicant->id,
                'action' => 'voucher_eligibility_expired',
                'description' => "Applicant {$applicant->first_name} {$applicant->last_name} (ID: {$applicant->id}) voucher eligibility expired after 3 days. Marked as waitlisted.",
                'log_level' => 'info',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
            
            // Find next not-eligible applicant for the same program and promote them
            $nextApplicant = User::where('role', 'applicant')
                ->where('application_status', 'pending')
                ->where('voucher_eligible', 0)
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
                    'description' => "Applicant {$nextApplicant->first_name} {$nextApplicant->last_name} (ID: {$nextApplicant->id}) promoted to eligible status for program {$programId}. Replaced applicant ID: {$applicant->id}",
                    'log_level' => 'info',
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
                
                // TODO: Send email notification to the newly eligible applicant
                // Uncomment when email template is ready
                // Mail::to($nextApplicant->email)->send(new VoucherEligibleNotification($nextApplicant));
            } else {
                $this->info("No not-eligible applicants found for program {$programId}.");
                
                Log::info("No replacement found", [
                    'program_id' => $programId,
                    'action' => 'no_eligible_replacement',
                    'expired_applicant_id' => $applicant->id
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
        $this->info("║ Marked as Waitlisted:  {$waitlistedCount} applicant(s)  ║");
        $this->info("║ Promoted to Eligible:  {$promotedCount} applicant(s)  ║");
        $this->info('╚═══════════════════════════════════════╝');
        $this->info('');
        
        return Command::SUCCESS;
    }
}
