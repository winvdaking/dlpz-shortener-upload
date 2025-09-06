/**
 * Configuration de l'API pour dlpz.fr
 */

// Configuration de l'API selon l'environnement
const API_CONFIG = {
  // URL de base du backend
  BASE_URL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "" : "http://localhost:3002"),

  // Endpoints
  ENDPOINTS: {
    URL_SHORTEN: "/api/url/shorten",
    URL_INFO: "/api/url",
    URL_STATS: "/api/url/stats/all",
    UPLOAD: "/api/upload",
    UPLOAD_INFO: "/api/upload/info",
    UPLOAD_DOWNLOAD: "/api/upload/download",
    UPLOAD_STATS: "/api/upload/stats",
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
export const shortenUrl = async (url, customAlias = null) => {
  const requestBody = { url };
  if (customAlias) {
    requestBody.customAlias = customAlias;
  }

  return await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.URL_SHORTEN), {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
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
 * Obtenir les statistiques des URLs
 */
export const getUrlStats = async () => {
  return await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.URL_STATS));
};

/**
 * Uploader un fichier
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("files", file);

  return await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD), {
    method: "POST",
    headers: {}, // Laisser le navigateur définir Content-Type pour FormData
    body: formData,
  });
};

/**
 * Uploader plusieurs fichiers
 */
export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  return await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD), {
    method: "POST",
    headers: {}, // Laisser le navigateur définir Content-Type pour FormData
    body: formData,
  });
};

/**
 * Obtenir les informations d'un fichier
 */
export const getFileInfo = async (fileId) => {
  return await apiRequest(
    buildApiUrl(`${API_CONFIG.ENDPOINTS.UPLOAD_INFO}/${fileId}`)
  );
};

/**
 * Obtenir les statistiques des uploads
 */
export const getUploadStats = async () => {
  return await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_STATS));
};

/**
 * Vérifier la santé de l'API
 */
export const checkApiHealth = async () => {
  return await apiRequest(buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH));
};

export default API_CONFIG;
