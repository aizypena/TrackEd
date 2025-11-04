<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'career_opportunities',
        'core_competencies',
        'duration',
        'pricing',
        'availability',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'career_opportunities' => 'array',
        'core_competencies' => 'array',
    ];
}
