<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        // Create an admin user
        $this->admin = User::factory()->create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'role' => 'admin',
            'email' => 'admin@test.com'
        ]);

        // Create some test users
        User::factory()->count(3)->create(['role' => 'applicant']);
        User::factory()->count(2)->create(['role' => 'student']);
        User::factory()->create(['role' => 'trainer']);
    }

    public function test_users_endpoint_requires_authentication()
    {
        $response = $this->getJson('/api/users');
        $response->assertStatus(401);
    }

    public function test_users_endpoint_returns_users_list_with_pagination()
    {
        Sanctum::actingAs($this->admin);
        
        $response = $this->getJson('/api/users');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'pagination' => [
                    'current_page',
                    'last_page',
                    'from',
                    'to',
                    'total'
                ]
            ]);
        
        $this->assertTrue($response->json('success'));
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_users_endpoint_supports_search_filter()
    {
        Sanctum::actingAs($this->admin);
        
        $testUser = User::factory()->create([
            'first_name' => 'TestSearchUser',
            'role' => 'student'
        ]);
        
        $response = $this->getJson('/api/users?search=TestSearchUser');
        
        $response->assertStatus(200)
            ->assertJsonPath('success', true);
            
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        $this->assertTrue(collect($data)->contains('first_name', 'TestSearchUser'));
    }

    public function test_users_stats_endpoint_requires_authentication()
    {
        $response = $this->getJson('/api/users/stats');
        $response->assertStatus(401);
    }

    public function test_users_stats_endpoint_returns_correct_statistics()
    {
        Sanctum::actingAs($this->admin);
        
        $response = $this->getJson('/api/users/stats');
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'stats' => [
                    'total_users',
                    'active_users',
                    'pending_applications',
                    'total_applicants'
                ]
            ])
            ->assertJsonPath('success', true);

        $stats = $response->json('stats');
        $this->assertEquals(7, $stats['total_users']); // All non-admin users (6 initial + 1 test user)
        $this->assertEquals(3, $stats['total_applicants']); // Users with applicant role
    }
}