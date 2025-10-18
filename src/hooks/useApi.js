import { useState, useCallback } from "react";
import { shortenUrl, getAllUrls, deleteUrl, checkApiHealth } from "../config/api";
import { useAlert } from "../contexts/AlertContext";

/**
 * Hook personnalisé pour gérer les appels API
 */
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showSuccess } = useAlert();

  const handleApiCall = useCallback(
    async (apiCall, onSuccess, onError, successMessage) => {
      setIsLoading(true);

      try {
        const result = await apiCall();
        if (onSuccess) {
          onSuccess(result);
        }
        if (successMessage) {
          showSuccess(successMessage);
        }
        return result;
      } catch (err) {
        const errorMessage = err.message || "Une erreur est survenue";
        showError(errorMessage);
        if (onError) {
          onError(err);
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showError, showSuccess]
  );

  return {
    isLoading,
    handleApiCall,
  };
};

/**
 * Hook pour le raccourcissement d'URL
 */
export const useUrlShortener = () => {
  const { isLoading, handleApiCall } = useApi();
  const [result, setResult] = useState("");

  const shorten = useCallback(
    async (url) => {
      return await handleApiCall(
        () => shortenUrl(url),
        (data) => {
          if (data.success && data.shortUrl) {
            setResult(data.shortUrl);
          } else {
            throw new Error(data.message || "Échec du raccourcissement");
          }
        },
        null,
        "URL raccourcie avec succès !"
      );
    },
    [handleApiCall]
  );

  const clearResult = useCallback(() => {
    setResult("");
  }, []);

  return {
    isLoading,
    result,
    shorten,
    clearResult,
  };
};

/**
 * Hook pour gérer les URLs
 */
export const useUrlManager = () => {
  const { isLoading, handleApiCall } = useApi();
  const [urls, setUrls] = useState([]);

  const loadUrls = useCallback(async () => {
    return await handleApiCall(
      () => getAllUrls(),
      (data) => {
        if (data.success) {
          setUrls(data.urls || []);
        } else {
          throw new Error(data.message || "Échec du chargement");
        }
      }
    );
  }, [handleApiCall]);

  const removeUrl = useCallback(async (code) => {
    return await handleApiCall(
      () => deleteUrl(code),
      (data) => {
        if (data.success) {
          setUrls(prev => prev.filter(url => url.code !== code));
        } else {
          throw new Error(data.message || "Échec de la suppression");
        }
      },
      null,
      "URL supprimée avec succès !"
    );
  }, [handleApiCall]);

  return {
    isLoading,
    urls,
    loadUrls,
    removeUrl,
  };
};

/**
 * Hook pour vérifier la santé de l'API
 */
export const useApiHealth = () => {
  const { isLoading, handleApiCall } = useApi();
  const [isHealthy, setIsHealthy] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      await handleApiCall(
        () => checkApiHealth(),
        (data) => {
          setIsHealthy(data.status === "OK");
        }
      );
      return true;
    } catch {
      setIsHealthy(false);
      return false;
    }
  }, [handleApiCall]);

  return {
    isLoading,
    isHealthy,
    checkHealth,
  };
};
