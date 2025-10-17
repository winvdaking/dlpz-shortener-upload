<?php

namespace App\Controller;

use App\Service\UrlShortenerService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class UrlController extends AbstractController
{
    private UrlShortenerService $urlShortenerService;

    public function __construct(UrlShortenerService $urlShortenerService)
    {
        $this->urlShortenerService = $urlShortenerService;
    }

    #[Route('/api/shorten', name: 'api_shorten', methods: ['POST'])]
    public function shorten(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['url']) || empty($data['url'])) {
                return new JsonResponse([
                    'error' => 'Le champ "url" est requis'
                ], Response::HTTP_BAD_REQUEST);
            }

            $result = $this->urlShortenerService->shortenUrl($data['url']);

            return new JsonResponse([
                'shortCode' => $result['shortCode'],
                'shortUrl' => $result['shortUrl'],
                'original' => $result['original'],
                'createdAt' => $result['createdAt'],
                'clicks' => $result['clicks']
            ], Response::HTTP_CREATED);

        } catch (\InvalidArgumentException $e) {
            return new JsonResponse([
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur interne s\'est produite'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{shortCode}', name: 'redirect', methods: ['GET'], requirements: ['shortCode' => '[a-zA-Z0-9]{6}'])]
    public function redirectToUrl(string $shortCode): Response
    {
        $originalUrl = $this->urlShortenerService->getOriginalUrl($shortCode);

        if (!$originalUrl) {
            return new JsonResponse([
                'error' => 'Code court introuvable'
            ], Response::HTTP_NOT_FOUND);
        }

        return new RedirectResponse($originalUrl, Response::HTTP_MOVED_PERMANENTLY);
    }

    #[Route('/api/urls', name: 'api_urls', methods: ['GET'])]
    public function getAllUrls(): JsonResponse
    {
        try {
            $urls = $this->urlShortenerService->getAllUrls();

            return new JsonResponse($urls, Response::HTTP_OK);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur interne s\'est produite'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/urls/{shortCode}', name: 'api_delete_url', methods: ['DELETE'], requirements: ['shortCode' => '[a-zA-Z0-9]{6}'])]
    public function deleteUrl(string $shortCode): JsonResponse
    {
        try {
            $deleted = $this->urlShortenerService->deleteUrl($shortCode);

            if (!$deleted) {
                return new JsonResponse([
                    'error' => 'Code court introuvable'
                ], Response::HTTP_NOT_FOUND);
            }

            return new JsonResponse([
                'deleted' => true,
                'message' => 'URL supprimée avec succès'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur interne s\'est produite'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/urls/{shortCode}/stats', name: 'api_url_stats', methods: ['GET'], requirements: ['shortCode' => '[a-zA-Z0-9]{6}'])]
    public function getUrlStats(string $shortCode): JsonResponse
    {
        try {
            $stats = $this->urlShortenerService->getUrlStats($shortCode);

            if (!$stats) {
                return new JsonResponse([
                    'error' => 'Code court introuvable'
                ], Response::HTTP_NOT_FOUND);
            }

            return new JsonResponse($stats, Response::HTTP_OK);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur interne s\'est produite'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/health', name: 'api_health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'OK',
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s'),
            'service' => 'URL Shortener API'
        ], Response::HTTP_OK);
    }
}
