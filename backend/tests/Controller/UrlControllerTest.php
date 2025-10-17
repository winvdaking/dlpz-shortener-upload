<?php

namespace App\Tests\Controller;

use App\Service\UrlShortenerService;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class UrlControllerTest extends WebTestCase
{
    private UrlShortenerService $urlShortenerService;

    protected function setUp(): void
    {
        $this->urlShortenerService = $this->createMock(UrlShortenerService::class);
    }

    public function testShortenUrlSuccess(): void
    {
        $client = static::createClient();
        
        $expectedResult = [
            'shortCode' => 'abc123',
            'shortUrl' => 'https://dlpz.fr/abc123',
            'original' => 'https://example.com',
            'createdAt' => '2024-01-01 12:00:00',
            'clicks' => 0
        ];

        $this->urlShortenerService
            ->expects($this->once())
            ->method('shortenUrl')
            ->with('https://example.com')
            ->willReturn($expectedResult);

        $client->getContainer()->set(UrlShortenerService::class, $this->urlShortenerService);

        $client->request('POST', '/api/shorten', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['url' => 'https://example.com']));

        $this->assertEquals(Response::HTTP_CREATED, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('abc123', $responseData['shortCode']);
        $this->assertEquals('https://dlpz.fr/abc123', $responseData['shortUrl']);
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

        $this->urlShortenerService
            ->expects($this->once())
            ->method('shortenUrl')
            ->with('invalid-url')
            ->willThrowException(new \InvalidArgumentException('URL invalide'));

        $client->getContainer()->set(UrlShortenerService::class, $this->urlShortenerService);

        $client->request('POST', '/api/shorten', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['url' => 'invalid-url']));

        $this->assertEquals(Response::HTTP_BAD_REQUEST, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('error', $responseData);
        $this->assertEquals('URL invalide', $responseData['error']);
    }

    public function testRedirectWithValidShortCode(): void
    {
        $client = static::createClient();

        $this->urlShortenerService
            ->expects($this->once())
            ->method('getOriginalUrl')
            ->with('abc123')
            ->willReturn('https://example.com');

        $client->getContainer()->set(UrlShortenerService::class, $this->urlShortenerService);

        $client->request('GET', '/abc123');

        $this->assertEquals(Response::HTTP_MOVED_PERMANENTLY, $client->getResponse()->getStatusCode());
        $this->assertEquals('https://example.com', $client->getResponse()->headers->get('Location'));
    }

    public function testRedirectWithInvalidShortCode(): void
    {
        $client = static::createClient();

        $this->urlShortenerService
            ->expects($this->once())
            ->method('getOriginalUrl')
            ->with('invalid')
            ->willReturn(null);

        $client->getContainer()->set(UrlShortenerService::class, $this->urlShortenerService);

        $client->request('GET', '/invalid');

        $this->assertEquals(Response::HTTP_NOT_FOUND, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        if ($responseData !== null) {
            $this->assertArrayHasKey('error', $responseData);
            $this->assertEquals('Code court introuvable', $responseData['error']);
        }
    }

    public function testGetAllUrls(): void
    {
        $client = static::createClient();

        $expectedUrls = [
            [
                'original' => 'https://example1.com',
                'short' => 'abc123',
                'createdAt' => '2024-01-01 12:00:00',
                'clicks' => 5
            ],
            [
                'original' => 'https://example2.com',
                'short' => 'def456',
                'createdAt' => '2024-01-01 13:00:00',
                'clicks' => 10
            ]
        ];

        $this->urlShortenerService
            ->expects($this->once())
            ->method('getAllUrls')
            ->willReturn($expectedUrls);

        $client->getContainer()->set(UrlShortenerService::class, $this->urlShortenerService);

        $client->request('GET', '/api/urls');

        $this->assertEquals(Response::HTTP_OK, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertCount(2, $responseData);
        $this->assertEquals('https://example1.com', $responseData[0]['original']);
        $this->assertEquals('abc123', $responseData[0]['short']);
    }

    public function testDeleteUrlSuccess(): void
    {
        $client = static::createClient();

        $this->urlShortenerService
            ->expects($this->once())
            ->method('deleteUrl')
            ->with('abc123')
            ->willReturn(true);

        $client->getContainer()->set(UrlShortenerService::class, $this->urlShortenerService);

        $client->request('DELETE', '/api/urls/abc123');

        $this->assertEquals(Response::HTTP_OK, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertTrue($responseData['deleted']);
        $this->assertEquals('URL supprimée avec succès', $responseData['message']);
    }

    public function testDeleteUrlNotFound(): void
    {
        $client = static::createClient();

        $this->urlShortenerService
            ->expects($this->once())
            ->method('deleteUrl')
            ->with('nonexistent')
            ->willReturn(false);

        $client->getContainer()->set(UrlShortenerService::class, $this->urlShortenerService);

        $client->request('DELETE', '/api/urls/nonexistent');

        $this->assertEquals(Response::HTTP_NOT_FOUND, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        if ($responseData !== null) {
            $this->assertArrayHasKey('error', $responseData);
            $this->assertEquals('Code court introuvable', $responseData['error']);
        }
    }

    public function testGetUrlStats(): void
    {
        $client = static::createClient();

        $expectedStats = [
            'original' => 'https://example.com',
            'short' => 'abc123',
            'createdAt' => '2024-01-01 12:00:00',
            'clicks' => 15
        ];

        $this->urlShortenerService
            ->expects($this->once())
            ->method('getUrlStats')
            ->with('abc123')
            ->willReturn($expectedStats);

        $client->getContainer()->set(UrlShortenerService::class, $this->urlShortenerService);

        $client->request('GET', '/api/urls/abc123/stats');

        $this->assertEquals(Response::HTTP_OK, $client->getResponse()->getStatusCode());
        
        $responseData = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('https://example.com', $responseData['original']);
        $this->assertEquals('abc123', $responseData['short']);
        $this->assertEquals(15, $responseData['clicks']);
    }

    public function testGetUrlStatsNotFound(): void
    {
        $client = static::createClient();

        $this->urlShortenerService
            ->expects($this->once())
            ->method('getUrlStats')
            ->with('nonexistent')
            ->willReturn(null);

        $client->getContainer()->set(UrlShortenerService::class, $this->urlShortenerService);

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
}
