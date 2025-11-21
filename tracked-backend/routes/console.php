<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule voucher eligibility updates
Schedule::command('voucher:update-eligibility')
    ->daily()
    ->at('00:00')
    ->timezone('Asia/Manila');
