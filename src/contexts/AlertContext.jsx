import { createContext, useContext, useState, useCallback } from "react";

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((alert) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      type: alert.type || "error", // 'error', 'success', 'warning', 'info'
      title: alert.title || "",
      message: alert.message || "",
      duration: alert.duration || 5000, // 5 secondes par défaut
      ...alert,
    };

    setAlerts((prev) => [...prev, newAlert]);

    // Auto-suppression après la durée spécifiée
    if (newAlert.duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, newAlert.duration);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const showError = useCallback(
    (message, title = "Erreur") => {
      return addAlert({ type: "error", title, message });
    },
    [addAlert]
  );

  const showSuccess = useCallback(
    (message, title = "Succès") => {
      return addAlert({ type: "success", title, message, duration: 3000 });
    },
    [addAlert]
  );

  const showWarning = useCallback(
    (message, title = "Attention") => {
      return addAlert({ type: "warning", title, message });
    },
    [addAlert]
  );

  const showInfo = useCallback(
    (message, title = "Information") => {
      return addAlert({ type: "info", title, message });
    },
    [addAlert]
  );

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
