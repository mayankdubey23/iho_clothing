<?php

namespace Tests\Feature;

use App\Models\FranchisePlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_products_endpoint_returns_seeded_catalog(): void
    {
        $this->seed();

        $response = $this->getJson('/api/products');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['slug' => 'premium-dry-fit-sports-tshirt'])
            ->assertJsonFragment(['slug' => 'pro-compression-track-pants'])
            ->assertJsonStructure([
                'data' => [
                    'data' => [
                        '*' => [
                            'category',
                            'skus',
                            'images',
                        ],
                    ],
                ],
            ]);
    }

    public function test_franchise_plans_endpoint_returns_seeded_plans(): void
    {
        $this->seed();

        $response = $this->getJson('/api/franchise-plans');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_products_endpoint_can_filter_catalog(): void
    {
        $this->seed();

        $response = $this->getJson('/api/products?category=premium-tshirts&size=L&min_price=1000&max_price=1500');

        $response
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['slug' => 'premium-dry-fit-sports-tshirt'])
            ->assertJsonMissing(['slug' => 'pro-compression-track-pants']);
    }

    public function test_customer_can_submit_franchise_application(): void
    {
        $this->seed();

        $user = User::factory()->create(['role' => 'customer']);
        $plan = FranchisePlan::query()->firstOrFail();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/franchise-applications', [
            'franchise_plan_id' => $plan->id,
            'business_name' => 'IHO City Store',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user_id', $user->id)
            ->assertJsonPath('data.franchise_plan_id', $plan->id)
            ->assertJsonPath('data.business_name', 'IHO City Store');
    }

    public function test_customer_can_logout(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        Sanctum::actingAs($user);

        $this->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('success', true);
    }
}
