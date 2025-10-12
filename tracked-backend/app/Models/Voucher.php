<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'voucher_id',
        'batch_id',
        'quantity',
        'used_count',
        'issue_date',
        'status',
        'issued_by'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'quantity' => 'integer',
        'used_count' => 'integer'
    ];

    // Relationship with user who issued the voucher
    public function issuer()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }
}
