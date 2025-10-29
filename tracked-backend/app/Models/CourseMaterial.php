<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseMaterial extends Model
{
    protected $fillable = [
        'program_id',
        'uploaded_by',
        'title',
        'description',
        'type',
        'file_path',
        'file_name',
        'file_format',
        'file_size',
        'downloads'
    ];

    public function program()
    {
        return $this->belongsTo(\App\Models\Program::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
