import { useState } from "react";
import { Button } from "../ui/button";
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  MousePointer, 
  Hash,
  Globe,
  Clock
} from "lucide-react";

const UrlDetailsModal = ({ url, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
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
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch {
      return "URL invalide";
    }
  };

  if (!isOpen || !url) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Détails de l'URL
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Code et domaine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Hash className="w-4 h-4" />
                Code de raccourcissement
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono flex-1">
                  {url.code}
                </code>
                <Button
                  onClick={() => handleCopy(url.code)}
                  variant="outline"
                  size="sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Globe className="w-4 h-4" />
                Domaine d'origine
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded text-sm">
                {getDomain(url.original)}
              </div>
            </div>
          </div>

          {/* URL originale */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <ExternalLink className="w-4 h-4" />
              URL originale
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded text-sm break-all flex-1">
                {url.original}
              </div>
              <Button
                onClick={() => handleCopy(url.original)}
                variant="outline"
                size="sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* URL raccourcie */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <ExternalLink className="w-4 h-4" />
              URL raccourcie
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded text-sm break-all flex-1 text-blue-600 dark:text-blue-400">
                {url.shortUrl}
              </div>
              <Button
                onClick={() => handleCopy(url.shortUrl)}
                variant="outline"
                size="sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                Date de création
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded text-sm">
                {formatDate(url.createdAt)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <MousePointer className="w-4 h-4" />
                Nombre de clics
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded text-sm">
                {url.clicks} clic{url.clicks > 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Fermer
          </Button>
          <Button
            onClick={handleOpenUrl}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Ouvrir le raccourci
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UrlDetailsModal;
