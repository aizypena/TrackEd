<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentMaintenanceHistory;
use App\Models\EquipmentAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EquipmentController extends Controller
{
    // Get all equipment with optional filters
    public function index(Request $request)
    {
        $query = Equipment::with('maintenanceHistory');

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by location
        if ($request->has('location') && $request->location !== 'all') {
            $query->where('location', $request->location);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('equipment_code', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('model', 'LIKE', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        if ($sortBy === 'name') {
            $query->orderBy('name', $sortOrder);
        } elseif ($sortBy === 'category') {
            $query->orderBy('category', $sortOrder);
        } elseif ($sortBy === 'quantity') {
            $query->orderBy('quantity', $sortOrder === 'asc' ? 'desc' : 'asc');
        } elseif ($sortBy === 'value') {
            $query->orderBy('value', $sortOrder === 'asc' ? 'desc' : 'asc');
        }

        $equipment = $query->get();

        return response()->json([
            'success' => true,
            'data' => $equipment
        ]);
    }

    // Get single equipment
    public function show($id)
    {
        $equipment = Equipment::with('maintenanceHistory')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $equipment
        ]);
    }

    // Create equipment
    public function store(Request $request)
    {
        $request->validate([
            'equipment_code' => 'required|string|unique:equipment,equipment_code',
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'brand' => 'required|string',
            'serial_number' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'status' => 'required|in:available,inUse,maintenance,damaged,retired',
            'condition' => 'required|in:excellent,good,fair,poor',
            'purchase_date' => 'nullable|date',
            'value' => 'required|numeric|min:0',
            'description' => 'nullable|string'
        ]);

        $equipment = Equipment::create([
            'equipment_code' => $request->equipment_code,
            'name' => $request->name,
            'category' => $request->category,
            'brand' => $request->brand,
            'serial_number' => $request->serial_number,
            'quantity' => $request->quantity,
            'available' => $request->quantity,
            'in_use' => 0,
            'maintenance' => 0,
            'damaged' => 0,
            'status' => $request->status,
            'condition' => $request->condition,
            'purchase_date' => $request->purchase_date,
            'last_maintenance' => $request->last_maintenance,
            'next_maintenance' => $request->next_maintenance,
            'value' => $request->value,
            'description' => $request->description
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Equipment created successfully',
            'data' => $equipment
        ], 201);
    }

    // Update equipment
    public function update(Request $request, $id)
    {
        $equipment = Equipment::findOrFail($id);

        $request->validate([
            'equipment_code' => 'required|string|unique:equipment,equipment_code,' . $id,
            'name' => 'required|string|max:255',
            'category' => 'required|string',
            'brand' => 'required|string',
            'serial_number' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'available' => 'required|integer|min:0',
            'in_use' => 'required|integer|min:0',
            'maintenance' => 'required|integer|min:0',
            'damaged' => 'required|integer|min:0',
            'status' => 'required|in:available,inUse,maintenance,damaged,retired',
            'condition' => 'required|in:excellent,good,fair,poor',
            'purchase_date' => 'nullable|date',
            'value' => 'required|numeric|min:0',
            'description' => 'nullable|string'
        ]);

        $equipment->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Equipment updated successfully',
            'data' => $equipment
        ]);
    }

    // Delete equipment
    public function destroy($id)
    {
        $equipment = Equipment::findOrFail($id);
        $equipment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Equipment deleted successfully'
        ]);
    }

    // Add maintenance history
    public function addMaintenanceHistory(Request $request, $id)
    {
        $equipment = Equipment::findOrFail($id);

        $request->validate([
            'date' => 'required|date',
            'type' => 'required|string',
            'notes' => 'required|string',
            'performed_by' => 'nullable|string',
            'cost' => 'nullable|numeric|min:0',
            'condition_after' => 'nullable|in:excellent,good,fair,poor',
            'next_maintenance_date' => 'nullable|date|after:date',
            'mark_as_under_maintenance' => 'nullable|boolean'
        ]);

        $history = EquipmentMaintenanceHistory::create([
            'equipment_id' => $id,
            'date' => $request->date,
            'type' => $request->type,
            'notes' => $request->notes,
            'performed_by' => $request->performed_by,
            'cost' => $request->cost
        ]);

        // Update equipment
        $updateData = [
            'last_maintenance' => $request->date
        ];

        // Update condition if provided
        if ($request->has('condition_after')) {
            $updateData['condition'] = $request->condition_after;
        }

        // Update next maintenance date if provided
        if ($request->has('next_maintenance_date')) {
            $updateData['next_maintenance'] = $request->next_maintenance_date;
        }

        // Mark as under maintenance if requested
        if ($request->mark_as_under_maintenance) {
            $updateData['status'] = 'maintenance';
            
            // Move available equipment to maintenance count
            if ($equipment->available > 0) {
                $maintenanceCount = min($equipment->available, $equipment->quantity);
                $updateData['maintenance'] = ($equipment->maintenance ?? 0) + $maintenanceCount;
                $updateData['available'] = max(0, $equipment->available - $maintenanceCount);
            }
        }

        $equipment->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Maintenance history added successfully',
            'data' => $history
        ]);
    }

    // Get statistics
    public function statistics()
    {
        $stats = [
            'total_equipment' => Equipment::sum('quantity'),
            'available' => Equipment::sum('available'),
            'in_use' => Equipment::sum('in_use'),
            'needs_maintenance' => Equipment::whereIn('status', ['maintenance', 'damaged'])->count(),
            'total_value' => Equipment::sum(DB::raw('value * quantity')),
            'by_category' => Equipment::select('category', DB::raw('SUM(quantity) as total_quantity'), DB::raw('COUNT(*) as count'))
                ->groupBy('category')
                ->orderBy('category')
                ->get(),
            'by_status' => Equipment::select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get()
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    // Get categories (from programs offered)
    public function categories()
    {
        // Get all programs as categories
        $categories = DB::table('programs')
            ->select('title')
            ->orderBy('title')
            ->pluck('title');

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    // Get locations
    public function locations()
    {
        $locations = Equipment::select('location')
            ->distinct()
            ->orderBy('location')
            ->pluck('location');

        return response()->json([
            'success' => true,
            'data' => $locations
        ]);
    }

    // Assign equipment to a user (checkout)
    public function assignEquipment(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required_without:batch_id|exists:users,id',
            'batch_id' => 'required_without:user_id|exists:batches,id',
            'quantity' => 'required|integer|min:1',
            'purpose' => 'nullable|string',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string'
        ]);

        $equipment = Equipment::findOrFail($id);

        // Check if enough equipment is available
        if ($equipment->available < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough equipment available. Only ' . $equipment->available . ' available.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Create assignment record
            $assignmentData = [
                'equipment_id' => $id,
                'quantity' => $request->quantity,
                'assigned_at' => now(),
                'due_date' => $request->due_date,
                'status' => 'active',
                'purpose' => $request->purpose,
                'notes' => $request->notes,
                'assigned_by' => $request->user()->id
            ];
            
            // Add either user_id or batch_id
            if ($request->has('user_id')) {
                $assignmentData['user_id'] = $request->user_id;
            }
            if ($request->has('batch_id')) {
                $assignmentData['batch_id'] = $request->batch_id;
            }
            
            $assignment = EquipmentAssignment::create($assignmentData);

            // Update equipment counts with safeguards
            $equipment->available = max(0, $equipment->available - $request->quantity);
            $equipment->in_use = min($equipment->quantity, $equipment->in_use + $request->quantity);
            
            // Update status if all equipment is now in use
            if ($equipment->available == 0) {
                $equipment->status = 'inUse';
            }
            
            $equipment->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Equipment assigned successfully',
                'data' => $assignment->load(['user', 'equipment', 'assignedBy'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    // Return equipment (checkin)
    public function returnEquipment(Request $request, $assignmentId)
    {
        $request->validate([
            'return_notes' => 'nullable|string',
            'condition' => 'nullable|in:excellent,good,fair,poor'
        ]);

        $assignment = EquipmentAssignment::with('equipment')->findOrFail($assignmentId);

        if ($assignment->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This assignment is not active'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update assignment
            $assignment->returned_at = now();
            $assignment->status = 'returned';
            $assignment->return_notes = $request->return_notes;
            $assignment->returned_to = $request->user()->id;
            $assignment->save();

            // Update equipment counts
            $equipment = $assignment->equipment;
            $equipment->in_use = max(0, $equipment->in_use - $assignment->quantity);
            $equipment->available = min($equipment->quantity, $equipment->available + $assignment->quantity);
            
            // Update condition if provided
            if ($request->has('condition')) {
                $equipment->condition = $request->condition;
            }
            
            // Update status back to available if items are now available
            if ($equipment->available > 0 && $equipment->status === 'inUse') {
                $equipment->status = 'available';
            }
            
            $equipment->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Equipment returned successfully',
                'data' => $assignment->load(['user', 'equipment', 'returnedTo'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to return equipment: ' . $e->getMessage()
            ], 500);
        }
    }

    // Get all assignments for an equipment
    public function getAssignments($id)
    {
        $assignments = EquipmentAssignment::with(['user', 'assignedBy', 'returnedTo'])
            ->where('equipment_id', $id)
            ->orderBy('assigned_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assignments
        ]);
    }

    // Get active assignments for an equipment
    public function getActiveAssignments($id)
    {
        $assignments = EquipmentAssignment::with(['user', 'assignedBy'])
            ->where('equipment_id', $id)
            ->where('status', 'active')
            ->orderBy('assigned_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assignments
        ]);
    }
}

