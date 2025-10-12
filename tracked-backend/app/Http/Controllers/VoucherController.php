<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VoucherController extends Controller
{
    // Get all vouchers
    public function index()
    {
        try {
            $vouchers = Voucher::with('issuer')->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $vouchers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch vouchers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get single voucher
    public function show($id)
    {
        try {
            $voucher = Voucher::with('issuer')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $voucher
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Voucher not found'
            ], 404);
        }
    }

    // Create new voucher
    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_id' => 'required|string|unique:vouchers,batch_id',
            'quantity' => 'required|integer|min:1',
            'issue_date' => 'required|date',
            'status' => 'required|in:pending,issued,used'
        ]);

        try {
            // Generate unique voucher ID
            $voucherIdPrefix = 'V-' . date('Y') . '-';
            $lastVoucher = Voucher::where('voucher_id', 'like', $voucherIdPrefix . '%')
                ->orderBy('voucher_id', 'desc')
                ->first();
            
            if ($lastVoucher) {
                $lastNumber = intval(substr($lastVoucher->voucher_id, -3));
                $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
            } else {
                $newNumber = '001';
            }
            
            $voucherId = $voucherIdPrefix . $newNumber;

            $voucher = Voucher::create([
                'voucher_id' => $voucherId,
                'batch_id' => $validated['batch_id'],
                'quantity' => $validated['quantity'],
                'used_count' => 0,
                'issue_date' => $validated['issue_date'],
                'status' => $validated['status'],
                'issued_by' => Auth::id()
            ]);

            $voucher->load('issuer');

            return response()->json([
                'success' => true,
                'message' => 'Voucher issued successfully',
                'data' => $voucher
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to issue voucher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update voucher
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'batch_id' => 'sometimes|string|unique:vouchers,batch_id,' . $id,
            'quantity' => 'sometimes|integer|min:1',
            'issue_date' => 'sometimes|date',
            'status' => 'sometimes|in:pending,issued,used',
            'used_count' => 'sometimes|integer|min:0'
        ]);

        try {
            $voucher = Voucher::findOrFail($id);
            $voucher->update($validated);
            $voucher->load('issuer');

            return response()->json([
                'success' => true,
                'message' => 'Voucher updated successfully',
                'data' => $voucher
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update voucher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete voucher
    public function destroy($id)
    {
        try {
            $voucher = Voucher::findOrFail($id);
            $voucher->delete();

            return response()->json([
                'success' => true,
                'message' => 'Voucher deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete voucher'
            ], 500);
        }
    }
}
