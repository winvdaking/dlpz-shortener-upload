import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { useAlert } from "../contexts/AlertContext";

const AlertContainer = () => {
  const { alerts, removeAlert } = useAlert();

  const getAlertIcon = (type) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "info":
        return <Info className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-500/90",
          border: "border-red-400/50",
          text: "text-white",
          icon: "text-red-200",
        };
      case "success":
        return {
          bg: "bg-green-500/90",
          border: "border-green-400/50",
          text: "text-white",
          icon: "text-green-200",
        };
      case "warning":
        return {
          bg: "bg-yellow-500/90",
          border: "border-yellow-400/50",
          text: "text-white",
          icon: "text-yellow-200",
        };
      case "info":
        return {
          bg: "bg-blue-500/90",
          border: "border-blue-400/50",
          text: "text-white",
          icon: "text-blue-200",
        };
      default:
        return {
          bg: "bg-gray-500/90",
          border: "border-gray-400/50",
          text: "text-white",
          icon: "text-gray-200",
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <AnimatePresence>
        {alerts.map((alert) => {
          const styles = getAlertStyles(alert.type);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              className={`
                ${styles.bg} ${styles.border} ${styles.text}
                backdrop-blur-xl border rounded-lg shadow-lg
                p-4 relative overflow-hidden
              `}
              style={{
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              {/* Effet de brillance */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* Contenu de l'alerte */}
              <div className="flex items-start gap-3">
                {/* Icône */}
                <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
                  {getAlertIcon(alert.type)}
                </div>

                {/* Texte */}
                <div className="flex-1 min-w-0">
                  {alert.title && (
                    <h4 className="font-semibold text-sm mb-1">
                      {alert.title}
                    </h4>
                  )}
                  <p className="text-sm opacity-90 leading-relaxed">
                    {alert.message}
                  </p>
                </div>

                {/* Bouton de fermeture */}
                <motion.button
                  onClick={() => removeAlert(alert.id)}
                  className={`
                    ${styles.icon} hover:opacity-80 
                    flex-shrink-0 p-1 rounded-full
                    transition-all duration-200
                    hover:bg-white/10
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Fermer l'alerte"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Barre de progression (optionnelle) */}
              {alert.duration > 0 && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-white/20"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: alert.duration / 1000,
                    ease: "linear",
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AlertContainer;
