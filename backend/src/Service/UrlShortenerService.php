<?php

namespace App\Service;

use App\Entity\Url;
use App\Repository\UrlRepository;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\Validator\Constraints as Assert;

class UrlShortenerService
{
    private UrlRepository $urlRepository;
    private ValidatorInterface $validator;
    private string $baseUrl;
    private int $shortCodeLength;

    public function __construct(
        UrlRepository $urlRepository,
        ValidatorInterface $validator,
        string $baseUrl = 'https://dlpz.fr',
        int $shortCodeLength = 6
    ) {
        $this->urlRepository = $urlRepository;
        $this->validator = $validator;
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->shortCodeLength = $shortCodeLength;
    }

    public function shortenUrl(string $originalUrl): array
    {
        // Validation de l'URL
        $this->validateUrl($originalUrl);

        // Normaliser l'URL
        $normalizedUrl = $this->normalizeUrl($originalUrl);

        // Vérifier si l'URL existe déjà
        $existingUrl = $this->urlRepository->findByOriginalUrl($normalizedUrl);
        if ($existingUrl) {
            return [
                'shortCode' => $existingUrl->getShortCode(),
                'shortUrl' => $this->baseUrl . '/' . $existingUrl->getShortCode(),
                'original' => $existingUrl->getOriginal(),
                'createdAt' => $existingUrl->getCreatedAt()->format('Y-m-d\TH:i:s\Z'),
                'clicks' => $existingUrl->getClicks(),
            ];
        }

        // Générer un code court unique
        $shortCode = $this->generateUniqueShortCode();

        // Créer et sauvegarder l'URL
        $url = new Url($normalizedUrl, $shortCode);
        $this->urlRepository->save($url);

        return [
            'shortCode' => $shortCode,
            'shortUrl' => $this->baseUrl . '/' . $shortCode,
            'original' => $normalizedUrl,
            'createdAt' => $url->getCreatedAt()->format('Y-m-d\TH:i:s\Z'),
            'clicks' => 0,
        ];
    }

    public function getOriginalUrl(string $shortCode): ?string
    {
        $url = $this->urlRepository->findByShortCode($shortCode);
        
        if ($url) {
            // Incrémenter le compteur de clics
            $this->urlRepository->incrementClicks($shortCode);
            return $url->getOriginal();
        }

        return null;
    }

    public function getAllUrls(): array
    {
        $urls = $this->urlRepository->findAll();
        
        return array_map(function (Url $url) {
            return $url->toArray();
        }, $urls);
    }

    public function deleteUrl(string $shortCode): bool
    {
        return $this->urlRepository->delete($shortCode);
    }

    public function getUrlStats(string $shortCode): ?array
    {
        $url = $this->urlRepository->findByShortCode($shortCode);
        
        if (!$url) {
            return null;
        }

        return $url->toArray();
    }

    private function validateUrl(string $url): void
    {
        $constraints = new Assert\Url(
            message: 'L\'URL fournie n\'est pas valide.',
            requireTld: false
        );

        $violations = $this->validator->validate($url, $constraints);
        
        if (count($violations) > 0) {
            throw new \InvalidArgumentException('URL invalide: ' . $violations[0]->getMessage());
        }
    }

    private function normalizeUrl(string $url): string
    {
        // Supprimer les espaces
        $url = trim($url);
        
        // Ajouter le protocole si manquant
        if (!preg_match('/^https?:\/\//', $url)) {
            $url = 'https://' . $url;
        }

        return $url;
    }

    private function generateUniqueShortCode(): string
    {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $maxAttempts = 100;
        $attempts = 0;

        do {
            $shortCode = '';
            for ($i = 0; $i < $this->shortCodeLength; $i++) {
                $shortCode .= $characters[random_int(0, strlen($characters) - 1)];
            }
            
            $attempts++;
            
            // Vérifier l'unicité
            if (!$this->urlRepository->findByShortCode($shortCode)) {
                return $shortCode;
            }
            
        } while ($attempts < $maxAttempts);

        throw new \RuntimeException('Impossible de générer un code court unique après ' . $maxAttempts . ' tentatives.');
    }
}
