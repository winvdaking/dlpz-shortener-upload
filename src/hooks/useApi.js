import { useState, useCallback } from "react";
import { shortenUrl, uploadFile, checkApiHealth } from "../config/api";

/**
 * Hook personnalisé pour gérer les appels API
 */
export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const handleApiCall = useCallback(async (apiCall, onSuccess, onError) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await apiCall();
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      const errorMessage = err.message || "Une erreur est survenue";
      setError(errorMessage);
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    clearError,
    handleApiCall,
  };
};

/**
 * Hook pour le raccourcissement d'URL
 */
export const useUrlShortener = () => {
  const { isLoading, error, clearError, handleApiCall } = useApi();
  const [result, setResult] = useState("");

  const shorten = useCallback(
    async (url, customAlias = null) => {
      return await handleApiCall(
        () => shortenUrl(url, customAlias),
        (data) => {
          if (data.success && data.shortUrl) {
            setResult(data.shortUrl);
          } else {
            throw new Error(data.message || "Échec du raccourcissement");
          }
        }
      );
    },
    [handleApiCall]
  );

  const clearResult = useCallback(() => {
    setResult("");
    clearError();
  }, [clearError]);

  return {
    isLoading,
    error,
    result,
    shorten,
    clearResult,
  };
};

/**
 * Hook pour l'upload de fichiers
 */
export const useFileUpload = () => {
  const { isLoading, error, clearError, handleApiCall } = useApi();
  const [result, setResult] = useState("");

  const upload = useCallback(
    async (file) => {
      return await handleApiCall(
        () => uploadFile(file),
        (data) => {
          if (data.success && data.files && data.files[0]) {
            const uploadedFile = data.files[0];
            const fileUrl = uploadedFile.previewUrl || uploadedFile.downloadUrl;
            if (fileUrl) {
              setResult(fileUrl);
            } else {
              throw new Error("URL du fichier non disponible");
            }
          } else {
            throw new Error(data.message || "Échec de l'upload");
          }
        }
      );
    },
    [handleApiCall]
  );

  const clearResult = useCallback(() => {
    setResult("");
    clearError();
  }, [clearError]);

  return {
    isLoading,
    error,
    result,
    upload,
    clearResult,
  };
};

/**
 * Hook pour vérifier la santé de l'API
 */
export const useApiHealth = () => {
  const { isLoading, error, handleApiCall } = useApi();
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
    error,
    isHealthy,
    checkHealth,
  };
};
