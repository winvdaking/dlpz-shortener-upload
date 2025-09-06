import { useState, useCallback } from "react";
import { shortenUrl, uploadFile, checkApiHealth } from "../config/api";
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
    async (url, customAlias = null) => {
      return await handleApiCall(
        () => shortenUrl(url, customAlias),
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
 * Hook pour l'upload de fichiers
 */
export const useFileUpload = () => {
  const { isLoading, handleApiCall } = useApi();
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
        },
        null,
        "Fichier uploadé avec succès !"
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
    upload,
    clearResult,
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
