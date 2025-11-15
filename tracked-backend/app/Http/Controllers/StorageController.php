<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class StorageController extends Controller
{
    /**
     * Serve files from storage
     * This handles serving files when using php artisan serve
     */
    public function serve($path)
    {
        $filePath = storage_path('app/public/' . $path);
        
        // Log the path being requested for debugging
        Log::info('Storage file requested', [
            'requested_path' => $path,
            'full_path' => $filePath,
            'file_exists' => file_exists($filePath)
        ]);
        
        if (!file_exists($filePath)) {
            abort(404, 'File not found. Path: ' . $path);
        }
        
        // Get mime type
        $mimeType = mime_content_type($filePath);
        
        // Return the file with proper headers
        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . basename($filePath) . '"',
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}
