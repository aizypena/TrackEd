<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'batch_id',
        'amount',
        'currency',
        'payment_method',
        'payment_status',
        'paymongo_payment_id',
        'paymongo_payment_intent_id',
        'paymongo_source_id',
        'paymongo_response',
        'reference_code',
        'payment_description',
        'notes',
        'paid_at',
        'failed_at',
        'refunded_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paymongo_response' => 'array',
        'paid_at' => 'datetime',
        'failed_at' => 'datetime',
        'refunded_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the payment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the batch for this payment.
     */
    public function batch()
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'batch_id');
    }

    /**
     * Scope a query to only include paid payments.
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /**
     * Scope a query to only include pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }

    /**
     * Scope a query to only include failed payments.
     */
    public function scopeFailed($query)
    {
        return $query->where('payment_status', 'failed');
    }

    /**
     * Scope a query to only include processing payments.
     */
    public function scopeProcessing($query)
    {
        return $query->where('payment_status', 'processing');
    }

    /**
     * Mark payment as paid.
     */
    public function markAsPaid()
    {
        $this->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    /**
     * Mark payment as failed.
     */
    public function markAsFailed($reason = null)
    {
        $this->update([
            'payment_status' => 'failed',
            'failed_at' => now(),
            'notes' => $reason ? ($this->notes ? $this->notes . "\n" . $reason : $reason) : $this->notes,
        ]);
    }

    /**
     * Mark payment as refunded.
     */
    public function markAsRefunded()
    {
        $this->update([
            'payment_status' => 'refunded',
            'refunded_at' => now(),
        ]);
    }

    /**
     * Mark payment as processing.
     */
    public function markAsProcessing()
    {
        $this->update([
            'payment_status' => 'processing',
        ]);
    }

    /**
     * Check if payment is paid.
     */
    public function isPaid()
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Check if payment is pending.
     */
    public function isPending()
    {
        return $this->payment_status === 'pending';
    }

    /**
     * Check if payment is failed.
     */
    public function isFailed()
    {
        return $this->payment_status === 'failed';
    }
}
