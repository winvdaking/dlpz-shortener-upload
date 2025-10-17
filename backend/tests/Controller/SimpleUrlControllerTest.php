<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class SimpleUrlControllerTest extends WebTestCase
{
    public function testHealthCheck(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/health');

        $this->assertEquals(Response::HTTP_OK, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('OK', $responseData['status']);
        $this->assertEquals('URL Shortener API', $responseData['service']);
        $this->assertArrayHasKey('timestamp', $responseData);
    }

    public function testShortenUrlWithValidData(): void
    {
        $client = static::createClient();
        
        $client->request('POST', '/api/shorten', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['url' => 'https://example.com']));

        $this->assertEquals(Response::HTTP_CREATED, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('shortCode', $responseData);
        $this->assertArrayHasKey('shortUrl', $responseData);
        $this->assertArrayHasKey('original', $responseData);
        $this->assertEquals('https://example.com', $responseData['original']);
    }

    public function testShortenUrlWithInvalidData(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/shorten', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['url' => '']));

        $this->assertEquals(Response::HTTP_BAD_REQUEST, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('error', $responseData);
    }

    public function testGetAllUrls(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/urls');

        $this->assertEquals(Response::HTTP_OK, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($responseData);
    }
}
