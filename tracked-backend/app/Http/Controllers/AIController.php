<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    /**
     * Generate AI interpretation for enrollment trends
     */
    public function generateInterpretation(Request $request)
    {
        try {
            $request->validate([
                'prompt' => 'required|string',
            ]);

            $apiKey = env('GEMINI_API_KEY');
            
            if (!$apiKey) {
                Log::error('Gemini API key not configured');
                return response()->json([
                    'success' => false,
                    'message' => 'AI service not configured. Please contact administrator.'
                ], 500);
            }

            // Call Gemini API (using v1beta endpoint with X-goog-api-key header)
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-goog-api-key' => $apiKey,
            ])->timeout(60)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $request->prompt]
                        ]
                    ]
                ]
            ]);

            if (!$response->successful()) {
                Log::error('Gemini API error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                
                // Handle specific error codes with user-friendly messages
                $status = $response->status();
                $message = 'Failed to generate AI interpretation. Please try again.';
                
                if ($status === 429) {
                    $message = 'AI service is temporarily busy due to high usage. Please wait a moment and try again.';
                } elseif ($status === 401 || $status === 403) {
                    $message = 'AI service authentication failed. Please contact administrator.';
                } elseif ($status >= 500) {
                    $message = 'AI service is temporarily unavailable. Please try again later.';
                }
                
                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'retryAfter' => $status === 429 ? 30 : null
                ], $status);
            }

            $data = $response->json();
            
            // Extract the text from the response
            $interpretation = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$interpretation) {
                return response()->json([
                    'success' => false,
                    'message' => 'No interpretation generated'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'interpretation' => $interpretation
            ]);

        } catch (\Exception $e) {
            Log::error('AI interpretation error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while generating interpretation: ' . $e->getMessage()
            ], 500);
        }
    }
}
