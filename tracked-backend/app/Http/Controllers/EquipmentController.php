<?php

namespace App\Http\Controllers;

use App\Models\Equipment;
use App\Models\EquipmentMaintenanceHistory;
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
            'model' => 'required|string',
            'serial_number' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'location' => 'required|string',
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
            'model' => $request->model,
            'serial_number' => $request->serial_number,
            'quantity' => $request->quantity,
            'available' => $request->quantity,
            'in_use' => 0,
            'maintenance' => 0,
            'damaged' => 0,
            'location' => $request->location,
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
            'model' => 'required|string',
            'serial_number' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'available' => 'required|integer|min:0',
            'in_use' => 'required|integer|min:0',
            'maintenance' => 'required|integer|min:0',
            'damaged' => 'required|integer|min:0',
            'location' => 'required|string',
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
            'notes' => 'nullable|string'
        ]);

        $history = EquipmentMaintenanceHistory::create([
            'equipment_id' => $id,
            'date' => $request->date,
            'type' => $request->type,
            'notes' => $request->notes
        ]);

        $equipment->update([
            'last_maintenance' => $request->date
        ]);

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
}
