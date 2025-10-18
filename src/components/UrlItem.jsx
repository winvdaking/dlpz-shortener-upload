import { useState } from "react";
import { Button } from "../ui/button";
import { 
  ExternalLink, 
  Info, 
  Calendar, 
  MousePointer, 
  Hash,
  Globe
} from "lucide-react";

const UrlItem = ({ url, onShowDetails }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur lors de la copie:", err);
    }
  };

  const handleOpenUrl = () => {
    window.open(url.shortUrl, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200">
      {/* Header avec nom de domaine et code */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {getDomain(url.original)}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
          <Hash className="w-3 h-3 text-gray-500" />
          <code className="font-mono text-xs">{url.code}</code>
        </div>
      </div>

      {/* Informations principales */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(url.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <MousePointer className="w-3 h-3" />
          <span>{url.clicks} clic{url.clicks > 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2">
        <Button
          onClick={() => onShowDetails(url)}
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
        >
          <Info className="w-3 h-3 mr-1" />
          Détails
        </Button>
        <Button
          onClick={handleOpenUrl}
          variant="default"
          size="sm"
          className="flex-1 text-xs"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ouvrir
        </Button>
      </div>
    </div>
  );
};

export default UrlItem;
