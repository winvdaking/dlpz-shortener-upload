import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  MousePointer, 
  Hash,
  Globe,
  Link as LinkIcon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const AllUrlsModal = ({ urls, isOpen, onClose }) => {
  const [copied, setCopied] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const { theme } = useTheme();

  const handleCopy = async (text, urlCode) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(urlCode);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleOpenUrl = (url) => {
    window.open(url, '_blank');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDomain = (url) => {
    try {
      return new window.URL(url).hostname.replace('www.', '');
    } catch {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  // Sélectionner le premier URL par défaut
  useEffect(() => {
    if (urls.length > 0 && !selectedUrl) {
      setSelectedUrl(urls[0]);
    }
  }, [urls, selectedUrl]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
        {/* Backdrop avec blur macOS */}
        <motion.div
          className="absolute inset-0 bg-black/20 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Container - Très large */}
        <motion.div
          className={`relative w-full max-w-7xl max-h-[90vh] rounded-2xl border shadow-2xl ${
            theme === 'dark' 
              ? 'bg-black/80 border-white/20' 
              : 'bg-white/90 border-gray-200/50'
          } backdrop-blur-xl`}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200/50'
          }`}>
            <div>
              <h2 className={`text-2xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Tous vos raccourcis
              </h2>
              <p className={`text-sm mt-1 ${
                theme === 'dark' ? 'text-white/60' : 'text-gray-600'
              }`}>
                {urls.length} raccourci{urls.length > 1 ? 's' : ''} au total
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-white/10 text-white/70 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Layout en 2 colonnes */}
          <div className="flex h-[70vh]">
            {/* Colonne gauche - Liste des raccourcis */}
            <div className={`w-1/2 border-r ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200/50'
            } overflow-y-auto`}>
              <div className="p-4">
                {urls.length === 0 ? (
                  <div className="text-center py-12">
                    <Globe className={`w-12 h-12 mx-auto mb-4 ${
                      theme === 'dark' ? 'text-white/30' : 'text-gray-400'
                    }`} />
                    <p className={`text-lg ${
                      theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      Aucun raccourci pour le moment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {urls.map((url, index) => (
                      <motion.div
                        key={url.code}
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          selectedUrl?.code === url.code
                            ? theme === 'dark'
                              ? 'bg-blue-600/20 border-blue-500/50'
                              : 'bg-blue-100 border-blue-300'
                            : theme === 'dark'
                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                            : 'bg-gray-50/50 border-gray-200/50 hover:bg-gray-100/50'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedUrl(url)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Globe className={`w-4 h-4 flex-shrink-0 ${
                              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                            }`} />
                            <span className={`text-sm font-medium truncate ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {getDomain(url.original)}
                            </span>
                          </div>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            theme === 'dark' ? 'bg-white/10' : 'bg-gray-200/50'
                          }`}>
                            <Hash className={`w-3 h-3 ${
                              theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                            }`} />
                            <code className={`font-mono text-xs ${
                              theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                            }`}>
                              {url.code}
                            </code>
                          </div>
                        </div>
                        <div className={`text-xs font-mono ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          dlpz.fr/{url.code}
                        </div>
                        <div className={`flex items-center gap-4 mt-2 text-xs ${
                          theme === 'dark' ? 'text-white/50' : 'text-gray-500'
                        }`}>
                          <div className="flex items-center gap-1">
                            <MousePointer className="w-3 h-3" />
                            <span>{url.clicks} clic{url.clicks > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(url.createdAt)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Colonne droite - Stats du raccourci sélectionné */}
            <div className="w-1/2 p-6">
              {selectedUrl ? (
                <motion.div
                  key={selectedUrl.code}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  {/* Header du raccourci sélectionné */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${
                        theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'
                      }`}>
                        <LinkIcon className={`w-6 h-6 ${
                          theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {getDomain(selectedUrl.original)}
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                        }`}>
                          Code: {selectedUrl.code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* URL complète */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      URL originale
                    </label>
                    <div className={`p-3 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-white/5 border-white/10 text-white/80' 
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                      <p className="text-sm break-all">{selectedUrl.original}</p>
                    </div>
                  </div>

                  {/* URL raccourcie */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      URL raccourcie
                    </label>
                    <div className={`p-3 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-blue-900/20 border-blue-500/30 text-blue-400'
                        : 'bg-blue-50 border-blue-200 text-blue-600'
                    }`}>
                      <p className="text-sm font-mono">{selectedUrl.shortUrl}</p>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="mb-6">
                    <label className={`block text-sm font-medium mb-3 ${
                      theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                    }`}>
                      Statistiques
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <MousePointer className={`w-4 h-4 ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                          }`}>
                            Clics
                          </span>
                        </div>
                        <p className={`text-2xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {selectedUrl.clicks}
                        </p>
                      </div>
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className={`w-4 h-4 ${
                            theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                          }`} />
                          <span className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                          }`}>
                            Créé le
                          </span>
                        </div>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-white/80' : 'text-gray-700'
                        }`}>
                          {formatDate(selectedUrl.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCopy(selectedUrl.shortUrl, selectedUrl.code)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                          theme === 'dark'
                            ? 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                            : 'bg-gray-200/50 hover:bg-gray-300/50 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        {copied === selectedUrl.code ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copié
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copier
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenUrl(selectedUrl.shortUrl)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                          theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Accéder au raccourci
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Globe className={`w-12 h-12 mx-auto mb-4 ${
                      theme === 'dark' ? 'text-white/30' : 'text-gray-400'
                    }`} />
                    <p className={`text-lg ${
                      theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      Sélectionnez un raccourci
                    </p>
                    <p className={`text-sm mt-2 ${
                      theme === 'dark' ? 'text-white/40' : 'text-gray-500'
                    }`}>
                      Cliquez sur un raccourci à gauche pour voir ses détails
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AllUrlsModal;
