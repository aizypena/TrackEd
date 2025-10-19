<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EquipmentMaintenanceHistory extends Model
{
    protected $table = 'equipment_maintenance_history';

    protected $fillable = [
        'equipment_id',
        'date',
        'type',
        'notes'
    ];

    protected $casts = [
        'date' => 'date'
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }
}
