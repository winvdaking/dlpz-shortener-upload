<?php

namespace App\Tests\Controller;

use App\Service\UrlShortenerService;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class UrlControllerTest extends WebTestCase
{
    public function testShortenUrlSuccess(): void
    {
        $client = static::createClient();
        
        $client->request('POST', '/api/shorten', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['url' => 'https://example.com']));

        $this->assertEquals(Response::HTTP_CREATED, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('shortUrl', $responseData);
        $this->assertNotEmpty($responseData['shortUrl']);
        $this->assertStringContainsString('dlpz.fr/', $responseData['shortUrl']);
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

    public function testShortenUrlWithMissingUrl(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/shorten', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode([]));

        $this->assertEquals(Response::HTTP_BAD_REQUEST, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('error', $responseData);
    }

    public function testShortenUrlWithInvalidUrl(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/shorten', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['url' => 'invalid-url']));

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

    public function testDeleteUrlNotFound(): void
    {
        $client = static::createClient();

        $client->request('DELETE', '/api/urls/nonexistent');

        $this->assertEquals(Response::HTTP_NOT_FOUND, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        if ($responseData !== null) {
            $this->assertArrayHasKey('error', $responseData);
            $this->assertEquals('Code court introuvable', $responseData['error']);
        }
    }

    public function testGetUrlStatsNotFound(): void
    {
        $client = static::createClient();

        $client->request('GET', '/api/urls/nonexistent/stats');

        $this->assertEquals(Response::HTTP_NOT_FOUND, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        if ($responseData !== null) {
            $this->assertArrayHasKey('error', $responseData);
            $this->assertEquals('Code court introuvable', $responseData['error']);
        }
    }

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

    public function testRedirectToUrlNotFound(): void
    {
        $client = static::createClient();

        $client->request('GET', '/nonexistent');

        $this->assertEquals(Response::HTTP_NOT_FOUND, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('error', $responseData);
        $this->assertEquals('Code court introuvable', $responseData['error']);
    }

    public function testDeleteUrlSuccess(): void
    {
        $client = static::createClient();

        // D'abord créer une URL
        $client->request('POST', '/api/shorten', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['url' => 'https://example.com']));

        $this->assertEquals(Response::HTTP_CREATED, $client->getResponse()->getStatusCode());
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $shortUrl = $responseData['shortUrl'];
        $shortCode = basename($shortUrl);

        // Puis la supprimer
        $client->request('DELETE', "/api/urls/{$shortCode}");

        $this->assertEquals(Response::HTTP_OK, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('deleted', $responseData);
        $this->assertTrue($responseData['deleted']);
    }

    public function testGetUrlStatsSuccess(): void
    {
        $client = static::createClient();

        // D'abord créer une URL
        $client->request('POST', '/api/shorten', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['url' => 'https://example.com']));

        $this->assertEquals(Response::HTTP_CREATED, $client->getResponse()->getStatusCode());
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $shortUrl = $responseData['shortUrl'];
        $shortCode = basename($shortUrl);

        // Puis récupérer ses stats
        $client->request('GET', "/api/urls/{$shortCode}/stats");

        $this->assertEquals(Response::HTTP_OK, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('code', $responseData);
        $this->assertArrayHasKey('original', $responseData);
        $this->assertArrayHasKey('createdAt', $responseData);
        $this->assertArrayHasKey('clicks', $responseData);
        $this->assertEquals($shortCode, $responseData['code']);
        $this->assertEquals('https://example.com', $responseData['original']);
    }
}