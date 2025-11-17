<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Store a new contact message
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $contactMessage = ContactMessage::create([
                'full_name' => $request->full_name,
                'email' => $request->email,
                'phone' => $request->phone,
                'subject' => $request->subject,
                'message' => $request->message,
                'status' => 'new'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully! We will get back to you soon.',
                'data' => $contactMessage
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again later.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all contact messages (for admin)
     */
    public function index(Request $request)
    {
        try {
            $query = ContactMessage::query();

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $messages = $query->orderBy('created_at', 'desc')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $messages
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch messages',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update message status
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:new,read,replied'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $message = ContactMessage::findOrFail($id);
            $message->status = $request->status;
            $message->save();

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => $message
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
