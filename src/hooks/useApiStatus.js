import { useState, useEffect } from 'react';
import API_CONFIG, { buildApiUrl } from '../config/api';

export const useApiStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const checkApiStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout de 5 secondes
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (error) {
      console.warn('API Status Check Failed:', error);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Vérification initiale
    checkApiStatus();

    // Vérification périodique toutes les 30 secondes
    const interval = setInterval(checkApiStatus, 30000);

    // Vérification lors du retour en ligne
    const handleOnline = () => {
      checkApiStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isLoading,
    checkStatus: checkApiStatus,
  };
};
