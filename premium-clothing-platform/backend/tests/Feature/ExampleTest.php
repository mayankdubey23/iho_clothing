<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_application_returns_a_successful_response(): void
    {
        $this->seed();

        config(['view.compiled' => storage_path('framework/testing/views')]);
        File::ensureDirectoryExists(storage_path('framework/testing/views'));

        $response = $this->get('/');

        $response
            ->assertStatus(200)
            ->assertSee('"component":"Storefront"', false);
    }
}
