import { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';
import Hero from './components/hero';
import { ThemeProvider } from './contexts/ThemeContext';
import { useUrlShortener, useUrlManager } from './hooks/useApi';

// Composant interne qui utilise les hooks
function AppContent() {
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const urlShortener = useUrlShortener();
  const urlManager = useUrlManager();

  // Charger les URLs au démarrage
  useEffect(() => {
    urlManager.loadUrls();
  }, [urlManager]);

  const handleShorten = async (url) => {
    try {
      await urlShortener.shorten(url);
      setShowResult(true);
      // Recharger la liste des URLs
      await urlManager.loadUrls();
    } catch (error) {
      console.error('Erreur lors du raccourcissement:', error);
    }
  };

  const handleCopy = async () => {
    if (!urlShortener.result) return;

    try {
      await navigator.clipboard.writeText(urlShortener.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleNewUrl = () => {
    setShowResult(false);
    urlShortener.clearResult();
  };

  return (
    <div className="min-h-screen">
      <SEO />
      
      {/* Hero Section */}
      <Hero
        isLoading={urlShortener.isLoading}
        resultUrl={urlShortener.result}
        copied={copied}
        handleShorten={handleShorten}
        handleCopy={handleCopy}
        recentUrls={urlManager.urls}
      />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;