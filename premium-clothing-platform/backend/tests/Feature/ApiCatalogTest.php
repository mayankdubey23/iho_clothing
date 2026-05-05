<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
