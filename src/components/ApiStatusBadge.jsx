import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useApiStatus } from '../hooks/useApiStatus';

const ApiStatusBadge = () => {
  const { isOnline, isLoading } = useApiStatus();

  const getStatusConfig = () => {
    if (isLoading) {
      return {
        icon: Loader2,
        text: 'Vérification...',
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        iconClassName: 'animate-spin',
      };
    }

    if (isOnline) {
      return {
        icon: Wifi,
        text: 'API en ligne',
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
        iconClassName: '',
      };
    }

    return {
      icon: WifiOff,
      text: 'API hors ligne',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
      iconClassName: '',
    };
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium backdrop-blur-sm transition-all duration-300 ${config.className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <IconComponent className={`w-3 h-3 ${config.iconClassName}`} />
      <span>{config.text}</span>
    </motion.div>
  );
};

export default ApiStatusBadge;
