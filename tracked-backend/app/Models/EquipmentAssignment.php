<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EquipmentAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'equipment_id',
        'user_id',
        'quantity',
        'assigned_at',
        'due_date',
        'returned_at',
        'status',
        'purpose',
        'notes',
        'assigned_by',
        'returned_to',
        'return_notes'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'due_date' => 'datetime',
        'returned_at' => 'datetime',
    ];

    // Relationships
    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedBy()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function returnedTo()
    {
        return $this->belongsTo(User::class, 'returned_to');
    }
}
