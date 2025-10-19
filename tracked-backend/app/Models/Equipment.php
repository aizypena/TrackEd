<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    protected $table = 'equipment';

    protected $fillable = [
        'equipment_code',
        'name',
        'category',
        'brand',
        'model',
        'serial_number',
        'quantity',
        'available',
        'in_use',
        'maintenance',
        'damaged',
        'location',
        'status',
        'condition',
        'purchase_date',
        'last_maintenance',
        'next_maintenance',
        'value',
        'description'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'last_maintenance' => 'date',
        'next_maintenance' => 'date',
        'value' => 'decimal:2'
    ];

    public function maintenanceHistory()
    {
        return $this->hasMany(EquipmentMaintenanceHistory::class);
    }
}
