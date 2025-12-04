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

            // Call Gemini API (using v1 endpoint)
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->timeout(60)->post("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $request->prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 2000,
                    'topP' => 0.8,
                    'topK' => 40
                ]
            ]);

            if (!$response->successful()) {
                Log::error('Gemini API error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to generate AI interpretation. Please try again.'
                ], $response->status());
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
