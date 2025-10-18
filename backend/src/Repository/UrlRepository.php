<?php

namespace App\Repository;

use App\Entity\Url;
use Symfony\Component\Filesystem\Filesystem;

class UrlRepository
{
    private string $dataFile;
    private Filesystem $filesystem;

    public function __construct(string $projectDir)
    {
        $this->dataFile = $projectDir . '/data/urls.json';
        $this->filesystem = new Filesystem();
        $this->ensureDataFileExists();
    }

    private function ensureDataFileExists(): void
    {
        if (!$this->filesystem->exists($this->dataFile)) {
            $this->filesystem->dumpFile($this->dataFile, json_encode([]));
        }
    }

    /**
     * @return Url[]
     */
    public function findAll(): array
    {
        $data = $this->loadData();
        $urls = [];

        foreach ($data as $urlData) {
            $urls[] = Url::fromArray($urlData);
        }

        return $urls;
    }

    public function findByShortCode(string $shortCode): ?Url
    {
        $data = $this->loadData();

        foreach ($data as $urlData) {
            $code = $urlData['code'] ?? $urlData['short'] ?? null;
            if ($code === $shortCode) {
                return Url::fromArray($urlData);
            }
        }

        return null;
    }

    public function findByOriginalUrl(string $originalUrl): ?Url
    {
        $data = $this->loadData();

        foreach ($data as $urlData) {
            if ($urlData['original'] === $originalUrl) {
                return Url::fromArray($urlData);
            }
        }

        return null;
    }

    public function save(Url $url): void
    {
        $data = $this->loadData();
        $urlArray = $url->toArray();

        // Vérifier si l'URL existe déjà
        $existingIndex = null;
        foreach ($data as $index => $existingUrl) {
            $code = $existingUrl['code'] ?? $existingUrl['short'] ?? null;
            if ($code === $url->getShortCode()) {
                $existingIndex = $index;
                break;
            }
        }

        if ($existingIndex !== null) {
            // Mettre à jour l'URL existante
            $data[$existingIndex] = $urlArray;
        } else {
            // Ajouter une nouvelle URL
            $data[] = $urlArray;
        }

        $this->saveData($data);
    }

    public function delete(string $shortCode): bool
    {
        $data = $this->loadData();
        $found = false;

        foreach ($data as $index => $urlData) {
            $code = $urlData['code'] ?? $urlData['short'] ?? null;
            if ($code === $shortCode) {
                unset($data[$index]);
                $found = true;
                break;
            }
        }

        if ($found) {
            $this->saveData(array_values($data)); // Réindexer le tableau
        }

        return $found;
    }

    public function incrementClicks(string $shortCode): bool
    {
        $data = $this->loadData();
        $found = false;

        foreach ($data as $index => $urlData) {
            $code = $urlData['code'] ?? $urlData['short'] ?? null;
            if ($code === $shortCode) {
                $data[$index]['clicks'] = ($data[$index]['clicks'] ?? 0) + 1;
                $found = true;
                break;
            }
        }

        if ($found) {
            $this->saveData($data);
        }

        return $found;
    }

    private function loadData(): array
    {
        if (!$this->filesystem->exists($this->dataFile)) {
            return [];
        }

        $content = file_get_contents($this->dataFile);
        $data = json_decode($content, true);

        return is_array($data) ? $data : [];
    }

    private function saveData(array $data): void
    {
        $this->filesystem->dumpFile($this->dataFile, json_encode($data, JSON_PRETTY_PRINT));
    }
}
