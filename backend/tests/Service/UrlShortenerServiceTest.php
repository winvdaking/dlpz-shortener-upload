<?php

namespace App\Tests\Service;

use App\Entity\Url;
use App\Repository\UrlRepository;
use App\Service\UrlShortenerService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\ConstraintViolationList;

class UrlShortenerServiceTest extends TestCase
{
    private UrlShortenerService $urlShortenerService;
    private UrlRepository $urlRepository;
    private ValidatorInterface $validator;

    protected function setUp(): void
    {
        $this->urlRepository = $this->createMock(UrlRepository::class);
        $this->validator = $this->createMock(ValidatorInterface::class);
        
        $this->urlShortenerService = new UrlShortenerService(
            $this->urlRepository,
            $this->validator,
            'https://test.com',
            6
        );
    }

    public function testShortenUrlWithValidUrl(): void
    {
        $originalUrl = 'https://example.com';
        $shortCode = 'abc123';
        
        $this->validator
            ->expects($this->once())
            ->method('validate')
            ->willReturn(new ConstraintViolationList());

        $this->urlRepository
            ->expects($this->once())
            ->method('findByOriginalUrl')
            ->with($originalUrl)
            ->willReturn(null);

        $this->urlRepository
            ->expects($this->once())
            ->method('save')
            ->with($this->isInstanceOf(Url::class));

        $result = $this->urlShortenerService->shortenUrl($originalUrl);

        $this->assertArrayHasKey('shortCode', $result);
        $this->assertArrayHasKey('shortUrl', $result);
        $this->assertArrayHasKey('original', $result);
        $this->assertArrayHasKey('createdAt', $result);
        $this->assertArrayHasKey('clicks', $result);
        $this->assertEquals($originalUrl, $result['original']);
        $this->assertEquals('https://test.com/' . $result['shortCode'], $result['shortUrl']);
        $this->assertEquals(0, $result['clicks']);
    }

    public function testShortenUrlWithExistingUrl(): void
    {
        $originalUrl = 'https://example.com';
        $existingUrl = new Url($originalUrl, 'abc123');
        $existingUrl->setClicks(5);
        
        $this->validator
            ->expects($this->once())
            ->method('validate')
            ->willReturn(new ConstraintViolationList());

        $this->urlRepository
            ->expects($this->once())
            ->method('findByOriginalUrl')
            ->with($originalUrl)
            ->willReturn($existingUrl);

        $this->urlRepository
            ->expects($this->never())
            ->method('save');

        $result = $this->urlShortenerService->shortenUrl($originalUrl);

        $this->assertEquals('abc123', $result['shortCode']);
        $this->assertEquals('https://test.com/abc123', $result['shortUrl']);
        $this->assertEquals(5, $result['clicks']);
    }

    public function testShortenUrlWithInvalidUrl(): void
    {
        $invalidUrl = 'not-a-valid-url';
        
        $violation = $this->createMock(\Symfony\Component\Validator\ConstraintViolation::class);
        $violation->method('getMessage')->willReturn('URL invalide');
        
        $violations = new ConstraintViolationList();
        $violations->add($violation);
        
        $this->validator
            ->expects($this->once())
            ->method('validate')
            ->willReturn($violations);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('URL invalide');

        $this->urlShortenerService->shortenUrl($invalidUrl);
    }

    public function testShortenUrlWithoutProtocol(): void
    {
        $urlWithoutProtocol = 'example.com';
        $expectedUrl = 'https://example.com';
        
        $this->validator
            ->expects($this->once())
            ->method('validate')
            ->willReturn(new ConstraintViolationList());

        $this->urlRepository
            ->expects($this->once())
            ->method('findByOriginalUrl')
            ->with($expectedUrl)
            ->willReturn(null);

        $this->urlRepository
            ->expects($this->once())
            ->method('save');

        $result = $this->urlShortenerService->shortenUrl($urlWithoutProtocol);

        $this->assertEquals($expectedUrl, $result['original']);
    }

    public function testGetOriginalUrlWithValidShortCode(): void
    {
        $shortCode = 'abc123';
        $originalUrl = 'https://example.com';
        $url = new Url($originalUrl, $shortCode);
        
        $this->urlRepository
            ->expects($this->once())
            ->method('findByShortCode')
            ->with($shortCode)
            ->willReturn($url);

        $this->urlRepository
            ->expects($this->once())
            ->method('incrementClicks')
            ->with($shortCode)
            ->willReturn(true);

        $result = $this->urlShortenerService->getOriginalUrl($shortCode);

        $this->assertEquals($originalUrl, $result);
    }

    public function testGetOriginalUrlWithInvalidShortCode(): void
    {
        $shortCode = 'invalid';
        
        $this->urlRepository
            ->expects($this->once())
            ->method('findByShortCode')
            ->with($shortCode)
            ->willReturn(null);

        $this->urlRepository
            ->expects($this->never())
            ->method('incrementClicks');

        $result = $this->urlShortenerService->getOriginalUrl($shortCode);

        $this->assertNull($result);
    }

    public function testGetAllUrls(): void
    {
        $urls = [
            new Url('https://example1.com', 'abc123'),
            new Url('https://example2.com', 'def456'),
        ];
        
        $this->urlRepository
            ->expects($this->once())
            ->method('findAll')
            ->willReturn($urls);

        $result = $this->urlShortenerService->getAllUrls();

        $this->assertCount(2, $result);
        $this->assertArrayHasKey('original', $result[0]);
        $this->assertArrayHasKey('code', $result[0]);
        $this->assertArrayHasKey('createdAt', $result[0]);
        $this->assertArrayHasKey('clicks', $result[0]);
    }

    public function testDeleteUrl(): void
    {
        $shortCode = 'abc123';
        
        $this->urlRepository
            ->expects($this->once())
            ->method('delete')
            ->with($shortCode)
            ->willReturn(true);

        $result = $this->urlShortenerService->deleteUrl($shortCode);

        $this->assertTrue($result);
    }

    public function testGetUrlStats(): void
    {
        $shortCode = 'abc123';
        $url = new Url('https://example.com', $shortCode);
        $url->setClicks(10);
        
        $this->urlRepository
            ->expects($this->once())
            ->method('findByShortCode')
            ->with($shortCode)
            ->willReturn($url);

        $result = $this->urlShortenerService->getUrlStats($shortCode);

        $this->assertIsArray($result);
        $this->assertEquals('https://example.com', $result['original']);
        $this->assertEquals('abc123', $result['code']);
        $this->assertEquals(10, $result['clicks']);
    }
}
