/**
 * Configuration de l'API pour dlpz.fr
 */

// Configuration de l'API selon l'environnement
const API_CONFIG = {
  // URL de base du backend
  BASE_URL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:8000" : "https://dlpz.fr"),

  // Endpoints
  ENDPOINTS: {
    URL_SHORTEN: "/api/shorten",
    URL_INFO: "/api/urls",
    URL_STATS: "/api/urls",
    URL_DELETE: "/api/urls",
    HEALTH: "/api/health",
  },

  // Configuration des requêtes
  REQUEST_CONFIG: {
    timeout: 30000, // 30 secondes
    headers: {
      "Content-Type": "application/json",
    },
  },
};

/**
 * Construire l'URL complète pour un endpoint
 */
export const buildApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;

  // Ajouter les paramètres de requête si nécessaire
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  return url;
};

/**
 * Effectuer une requête API avec gestion d'erreur
 */
export const apiRequest = async (url, options = {}) => {
  const config = {
    ...API_CONFIG.REQUEST_CONFIG,
    ...options,
    headers: {
      ...API_CONFIG.REQUEST_CONFIG.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
};

/**
 * Raccourcir une URL
 */
export const shortenUrl = async (url) => {
  const requestBody = { url };

  const response = await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.URL_SHORTEN), {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  // Adapter la réponse du backend Symfony au format attendu par le frontend
  return {
    success: true,
    shortUrl: response.shortUrl,
  };
};

/**
 * Obtenir les informations d'une URL raccourcie
 */
export const getUrlInfo = async (shortId) => {
  return await apiRequest(
    buildApiUrl(`${API_CONFIG.ENDPOINTS.URL_INFO}/${shortId}`)
  );
};

/**
 * Obtenir toutes les URLs
 */
export const getAllUrls = async () => {
  const response = await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.URL_STATS));
  
  // Adapter la réponse du backend Symfony
  return {
    success: true,
    urls: response,
    total: response.length,
  };
};

/**
 * Supprimer une URL
 */
export const deleteUrl = async (shortCode) => {
  const response = await apiRequest(
    buildApiUrl(`${API_CONFIG.ENDPOINTS.URL_DELETE}/${shortCode}`),
    {
      method: "DELETE",
    }
  );
  
  return {
    success: true,
    deleted: response.deleted,
  };
};

/**
 * Vérifier la santé de l'API
 */
export const checkApiHealth = async () => {
  const response = await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH));
  
  // Adapter la réponse du backend Symfony
  return {
    success: true,
    status: response.status,
    service: response.service,
    timestamp: response.timestamp,
  };
};

export default API_CONFIG;
