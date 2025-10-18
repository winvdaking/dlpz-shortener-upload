<?php

namespace App\Tests\Entity;

use App\Entity\Url;
use PHPUnit\Framework\TestCase;

class UrlTest extends TestCase
{
    public function testUrlCreation(): void
    {
        $originalUrl = 'https://example.com';
        $shortCode = 'abc123';
        
        $url = new Url($originalUrl, $shortCode);
        
        $this->assertEquals($originalUrl, $url->getOriginal());
        $this->assertEquals($shortCode, $url->getShortCode());
        $this->assertEquals(0, $url->getClicks());
        $this->assertInstanceOf(\DateTime::class, $url->getCreatedAt());
    }

    public function testUrlSetters(): void
    {
        $url = new Url('https://example.com', 'abc123');
        
        $newOriginal = 'https://updated.com';
        $newShortCode = 'def456';
        $newClicks = 10;
        $newDate = new \DateTime('2023-01-01');
        
        $url->setOriginal($newOriginal);
        $url->setShortCode($newShortCode);
        $url->setClicks($newClicks);
        $url->setCreatedAt($newDate);
        
        $this->assertEquals($newOriginal, $url->getOriginal());
        $this->assertEquals($newShortCode, $url->getShortCode());
        $this->assertEquals($newClicks, $url->getClicks());
        $this->assertEquals($newDate, $url->getCreatedAt());
    }

    public function testIncrementClicks(): void
    {
        $url = new Url('https://example.com', 'abc123');
        
        $this->assertEquals(0, $url->getClicks());
        
        $url->incrementClicks();
        $this->assertEquals(1, $url->getClicks());
        
        $url->incrementClicks();
        $this->assertEquals(2, $url->getClicks());
    }

    public function testToArray(): void
    {
        $originalUrl = 'https://example.com';
        $shortCode = 'abc123';
        $url = new Url($originalUrl, $shortCode);
        $url->setClicks(5);
        
        $array = $url->toArray();
        
        $this->assertIsArray($array);
        $this->assertEquals($shortCode, $array['code']);
        $this->assertEquals($originalUrl, $array['original']);
        $this->assertEquals(5, $array['clicks']);
        $this->assertArrayHasKey('createdAt', $array);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/', $array['createdAt']);
    }

    public function testFromArray(): void
    {
        $data = [
            'original' => 'https://example.com',
            'code' => 'abc123',
            'createdAt' => '2023-01-01T12:00:00Z',
            'clicks' => 10
        ];
        
        $url = Url::fromArray($data);
        
        $this->assertEquals($data['original'], $url->getOriginal());
        $this->assertEquals($data['code'], $url->getShortCode());
        $this->assertEquals($data['clicks'], $url->getClicks());
        $this->assertEquals(new \DateTime($data['createdAt']), $url->getCreatedAt());
    }

    public function testFromArrayWithLegacyFormat(): void
    {
        $data = [
            'original' => 'https://example.com',
            'short' => 'abc123', // Format legacy
            'createdAt' => '2023-01-01T12:00:00Z',
            'clicks' => 10
        ];
        
        $url = Url::fromArray($data);
        
        $this->assertEquals($data['original'], $url->getOriginal());
        $this->assertEquals($data['short'], $url->getShortCode());
        $this->assertEquals($data['clicks'], $url->getClicks());
    }

    public function testFromArrayWithDefaultClicks(): void
    {
        $data = [
            'original' => 'https://example.com',
            'code' => 'abc123',
            'createdAt' => '2023-01-01T12:00:00Z'
            // clicks manquant
        ];
        
        $url = Url::fromArray($data);
        
        $this->assertEquals(0, $url->getClicks());
    }
}
