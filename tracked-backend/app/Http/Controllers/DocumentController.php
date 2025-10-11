<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class DocumentController extends Controller
{
    /**
     * Get all documents for the authenticated user
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            $documents = [
                [
                    'type' => 'valid_id',
                    'name' => 'Valid ID',
                    'path' => $user->valid_id_path,
                    'uploaded' => !empty($user->valid_id_path),
                ],
                [
                    'type' => 'transcript',
                    'name' => 'Transcript of Records',
                    'path' => $user->transcript_path,
                    'uploaded' => !empty($user->transcript_path),
                ],
                [
                    'type' => 'diploma',
                    'name' => 'Diploma',
                    'path' => $user->diploma_path,
                    'uploaded' => !empty($user->diploma_path),
                ],
                [
                    'type' => 'photo',
                    'name' => 'Passport Photo',
                    'path' => $user->passport_photo_path,
                    'uploaded' => !empty($user->passport_photo_path),
                ],
            ];

            return response()->json([
                'success' => true,
                'documents' => $documents
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload a document
     */
    public function upload(Request $request)
    {
        try {
            $request->validate([
                'document' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120', // 5MB max
                'type' => 'required|in:valid_id,transcript,diploma,photo'
            ]);

            $user = $request->user();
            $documentType = $request->type;
            
                        // Map document types to database columns
            $columnMap = [
                'valid_id' => 'valid_id_path',
                'transcript' => 'transcript_path',
                'diploma' => 'diploma_path',
                'photo' => 'passport_photo_path',
            ];

            $column = $columnMap[$documentType];

            // Delete old file if exists
            if ($user->$column && Storage::disk('public')->exists($user->$column)) {
                Storage::disk('public')->delete($user->$column);
            }

            // Store the new file
            $file = $request->file('document');
            $filename = time() . '_' . $documentType . '_' . $user->id . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('documents/' . $user->id, $filename, 'public');

            // Update user record
            $user->$column = $path;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'document' => [
                    'type' => $documentType,
                    'name' => $request->file('document')->getClientOriginalName(),
                    'path' => $path,
                    'size' => $this->formatBytes($file->getSize()),
                    'uploadDate' => now()->format('Y-m-d'),
                    'url' => Storage::url($path)
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a document
     */
    public function delete(Request $request, $type)
    {
        try {
            $user = $request->user();
            
            // Map document types to database columns
            $columnMap = [
                'valid_id' => 'valid_id_path',
                'transcript' => 'transcript_path',
                'diploma' => 'diploma_path',
                'photo' => 'passport_photo_path',
            ];

            if (!isset($columnMap[$type])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid document type'
                ], 400);
            }

            $column = $columnMap[$type];

            // Delete file from storage
            if ($user->$column && Storage::disk('public')->exists($user->$column)) {
                Storage::disk('public')->delete($user->$column);
            }

            // Update user record
            $user->$column = null;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * View/download a document
     */
    public function view(Request $request, $type)
    {
        try {
            $user = $request->user();
            
            // Map document types to database columns
            $columnMap = [
                'valid_id' => 'valid_id_path',
                'transcript' => 'transcript_path',
                'diploma' => 'diploma_path',
                'photo' => 'passport_photo_path',
            ];

            if (!isset($columnMap[$type])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid document type'
                ], 404);
            }

            $column = $columnMap[$type];
            
            if (!$user->$column || !Storage::disk('public')->exists($user->$column)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            $path = Storage::disk('public')->path($user->$column);
            $file = Storage::disk('public')->get($user->$column);
            $filename = basename($user->$column);
            
            // Get mime type from file extension
            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            $mimeTypes = [
                'pdf' => 'application/pdf',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'doc' => 'application/msword',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            $mimeType = $mimeTypes[strtolower($extension)] ?? 'application/octet-stream';
            $mimeTypes = [
                'pdf' => 'application/pdf',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'doc' => 'application/msword',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ];
            $mimeType = $mimeTypes[strtolower($extension)] ?? 'application/octet-stream';

            return response($file, 200)->header('Content-Type', $mimeType);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error viewing document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format bytes to readable size
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
