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
                $response = new JsonResponse([
                    'error' => 'Le champ "url" est requis'
                ], Response::HTTP_BAD_REQUEST);
            } else {
                $result = $this->urlShortenerService->shortenUrl($data['url']);
                $response = new JsonResponse([
                    'shortUrl' => $result['shortUrl']
                ], Response::HTTP_CREATED);
            }

            // Headers CORS temporaires
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

            return $response;

        } catch (\InvalidArgumentException $e) {
            $response = new JsonResponse([
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
            
            // Headers CORS temporaires
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            
            return $response;

        } catch (\Exception $e) {
            $response = new JsonResponse([
                'error' => 'Une erreur interne s\'est produite'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
            
            // Headers CORS temporaires
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            
            return $response;
        }
    }

    #[Route('/{code}', name: 'redirect', methods: ['GET'], requirements: ['code' => '[a-zA-Z0-9]+'])]
    public function redirectToUrl(string $code): Response
    {
        $originalUrl = $this->urlShortenerService->getOriginalUrl($code);

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

            $response = new JsonResponse($urls, Response::HTTP_OK);
            
            // Headers CORS temporaires
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

            return $response;

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur interne s\'est produite'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/urls/{code}', name: 'api_delete_url', methods: ['DELETE'], requirements: ['code' => '[a-zA-Z0-9]+'])]
    public function deleteUrl(string $code): JsonResponse
    {
        try {
            $deleted = $this->urlShortenerService->deleteUrl($code);

            if (!$deleted) {
                return new JsonResponse([
                    'error' => 'Code court introuvable'
                ], Response::HTTP_NOT_FOUND);
            }

            return new JsonResponse([
                'deleted' => true
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Une erreur interne s\'est produite'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/urls/{code}/stats', name: 'api_url_stats', methods: ['GET'], requirements: ['code' => '[a-zA-Z0-9]+'])]
    public function getUrlStats(string $code): JsonResponse
    {
        try {
            $stats = $this->urlShortenerService->getUrlStats($code);

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
        $response = new JsonResponse([
            'status' => 'OK',
            'timestamp' => (new \DateTime())->format('Y-m-d H:i:s'),
            'service' => 'URL Shortener API'
        ], Response::HTTP_OK);
        
        // Headers CORS
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        
        return $response;
    }

    #[Route('/api/{path}', name: 'api_options', methods: ['OPTIONS'], requirements: ['path' => '.*'])]
    public function options(): Response
    {
        $response = new Response();
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        $response->headers->set('Access-Control-Max-Age', '3600');
        
        return $response;
    }
}
