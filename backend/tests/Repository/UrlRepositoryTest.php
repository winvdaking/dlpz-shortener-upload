<?php

namespace App\Tests\Repository;

use App\Entity\Url;
use App\Repository\UrlRepository;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Filesystem\Filesystem;

class UrlRepositoryTest extends TestCase
{
    private string $testDataFile;
    private UrlRepository $urlRepository;
    private Filesystem $filesystem;

    protected function setUp(): void
    {
        $this->testDataFile = sys_get_temp_dir() . '/test_project/data/urls.json';
        $this->filesystem = new Filesystem();
        
        // Nettoyer le fichier de test s'il existe
        if ($this->filesystem->exists($this->testDataFile)) {
            $this->filesystem->remove($this->testDataFile);
        }
        
        $this->urlRepository = new UrlRepository(sys_get_temp_dir() . '/test_project');
    }

    protected function tearDown(): void
    {
        // Nettoyer le fichier de test après chaque test
        if ($this->filesystem->exists($this->testDataFile)) {
            $this->filesystem->remove($this->testDataFile);
        }
    }

    public function testSaveAndFindUrl(): void
    {
        $url = new Url('https://example.com', 'abc123');
        
        $this->urlRepository->save($url);
        
        $foundUrl = $this->urlRepository->findByShortCode('abc123');
        
        $this->assertNotNull($foundUrl);
        $this->assertEquals('https://example.com', $foundUrl->getOriginal());
        $this->assertEquals('abc123', $foundUrl->getShortCode());
    }

    public function testFindByOriginalUrl(): void
    {
        $url = new Url('https://example.com', 'abc123');
        
        $this->urlRepository->save($url);
        
        $foundUrl = $this->urlRepository->findByOriginalUrl('https://example.com');
        
        $this->assertNotNull($foundUrl);
        $this->assertEquals('abc123', $foundUrl->getShortCode());
    }

    public function testFindNonExistentUrl(): void
    {
        $foundUrl = $this->urlRepository->findByShortCode('nonexistent');
        
        $this->assertNull($foundUrl);
    }

    public function testFindAllUrls(): void
    {
        $url1 = new Url('https://example1.com', 'abc123');
        $url2 = new Url('https://example2.com', 'def456');
        
        $this->urlRepository->save($url1);
        $this->urlRepository->save($url2);
        
        $allUrls = $this->urlRepository->findAll();
        
        $this->assertCount(2, $allUrls);
        $this->assertContainsOnlyInstancesOf(Url::class, $allUrls);
    }

    public function testDeleteUrl(): void
    {
        $url = new Url('https://example.com', 'abc123');
        
        $this->urlRepository->save($url);
        
        $deleted = $this->urlRepository->delete('abc123');
        
        $this->assertTrue($deleted);
        
        $foundUrl = $this->urlRepository->findByShortCode('abc123');
        $this->assertNull($foundUrl);
    }

    public function testDeleteNonExistentUrl(): void
    {
        $deleted = $this->urlRepository->delete('nonexistent');
        
        $this->assertFalse($deleted);
    }

    public function testIncrementClicks(): void
    {
        $url = new Url('https://example.com', 'abc123');
        
        $this->urlRepository->save($url);
        
        $incremented = $this->urlRepository->incrementClicks('abc123');
        
        $this->assertTrue($incremented);
        
        $foundUrl = $this->urlRepository->findByShortCode('abc123');
        $this->assertEquals(1, $foundUrl->getClicks());
    }

    public function testIncrementClicksMultipleTimes(): void
    {
        $url = new Url('https://example.com', 'abc123');
        
        $this->urlRepository->save($url);
        
        $this->urlRepository->incrementClicks('abc123');
        $this->urlRepository->incrementClicks('abc123');
        $this->urlRepository->incrementClicks('abc123');
        
        $foundUrl = $this->urlRepository->findByShortCode('abc123');
        $this->assertEquals(3, $foundUrl->getClicks());
    }

    public function testUpdateExistingUrl(): void
    {
        $url1 = new Url('https://example.com', 'abc123');
        $url1->setClicks(5);
        
        $this->urlRepository->save($url1);
        
        $url2 = new Url('https://updated-example.com', 'abc123');
        $url2->setClicks(10);
        
        $this->urlRepository->save($url2);
        
        $foundUrl = $this->urlRepository->findByShortCode('abc123');
        
        $this->assertEquals('https://updated-example.com', $foundUrl->getOriginal());
        $this->assertEquals(10, $foundUrl->getClicks());
    }

    public function testDataFileCreation(): void
    {
        // Créer un nouveau repository avec un fichier qui n'existe pas
        $nonExistentDir = sys_get_temp_dir() . '/non_existent_dir';
        $newRepository = new UrlRepository($nonExistentDir);
        
        $url = new Url('https://example.com', 'abc123');
        $newRepository->save($url);
        
        $dataFile = $nonExistentDir . '/data/urls.json';
        $this->assertTrue($this->filesystem->exists($dataFile));
        
        // Nettoyer
        $this->filesystem->remove($nonExistentDir);
    }
}
