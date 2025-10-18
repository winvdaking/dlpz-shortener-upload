import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { MeshGradient, PulsingBorder } from '@paper-design/shaders-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link,
  Zap,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Globe,
  Eye,
} from 'lucide-react';
import ThemeToggle from './theme-toggle';
import { useTheme } from '../contexts/ThemeContext';
import UrlForm from './UrlForm';
import AllUrlsModal from './AllUrlsModal';
import ApiStatusBadge from './ApiStatusBadge';

export default function Hero({
  isLoading,
  resultUrl,
  copied,
  handleShorten,
  handleCopy,
  recentUrls = [],
}) {
  const containerRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isAllUrlsModalOpen, setIsAllUrlsModalOpen] = useState(false);
  const { theme, getBackgroundClass, getThemeClass } = useTheme();

  // Optimisation: useCallback pour éviter les re-créations de fonctions
  const handleMouseEnter = useCallback(() => setIsActive(true), []);
  const handleMouseLeave = useCallback(() => setIsActive(false), []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [handleMouseEnter, handleMouseLeave]);

  // Optimisation: useMemo pour les valeurs calculées
  const meshColors = useMemo(
    () =>
      theme === 'light'
        ? ['#f8fafc', '#e2e8f0', '#06b6d4', '#f97316']
        : ['#000000', '#ffffff', '#06b6d4', '#f97316'],
    [theme]
  );

  const pulsingColors = useMemo(
    () => [
      '#06b6d4',
      '#0891b2',
      '#f97316',
      '#00FF88',
      '#FFD700',
      '#FF6B35',
      '#ffffff',
    ],
    []
  );

  return (
    <div
      ref={containerRef}
      className={`min-h-screen relative overflow-hidden flex flex-col ${getThemeClass()}`}
    >
      <div id="background_noisy" className="absolute inset-0 w-full h-full" />

      {/* SVG simplifié avec moins de filtres */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter
            id="glass-effect"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence baseFrequency="0.01" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.2" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Dynamic Background */}
      <div
        className={`absolute inset-0 w-full h-full ${getBackgroundClass()}`}
      />

      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={meshColors}
        speed={0.1}
        wireframe="true"
        backgroundColor="transparent"
      />

      {/* Header/Navbar */}
      <header className="relative z-20 flex items-center justify-between p-6 flex-shrink-0 w-full">
        {/* Logo à gauche */}
        <motion.div
          className="flex items-center group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <motion.div
            className="text-xl font-light text-white group-hover:drop-shadow-lg transition-all duration-300 relative"
            style={{ filter: 'url(#logo-glow)' }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="block tracking-wider font-light dark:text-white/50 text-black/50">
              dlpz.fr
            </span>
          </motion.div>
        </motion.div>

        {/* Navigation au centre */}
        <nav className="flex items-center space-x-2">
          <a
            href="#"
            className="text-black/50 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200 dark:text-white/50"
          >
            dorianlopez.fr
          </a>
        </nav>

        {/* ThemeToggle à droite */}
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex flex-col items-center justify-center flex-1 px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl mb-6 relative border border-white/15"
            style={{ filter: 'url(#glass-effect)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent rounded-full" />
            <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
              <Sparkles className="w-4 h-4 inline-block mr-2" />
              NEW
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Raccourcissez vos URLs rapidement et facilement avec React et Symfony
          </motion.p>

          {/* URL Shortener Form */}
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div
              className="group relative rounded-xl bg-white/10 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/15"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link className="w-6 h-6 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-4 text-center">
                  Raccourcir une URL
                </h3>

                {/* Form */}
                <UrlForm onSubmit={handleShorten} isLoading={isLoading} />

                {/* Result */}
                <AnimatePresence>
                  {resultUrl && (
                    <motion.div
                      className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <Sparkles className="w-3 h-3" />
                          URL raccourcie avec succès !
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={resultUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 truncate text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 transition-colors duration-200 text-sm"
                          >
                            {resultUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <motion.button
                            onClick={handleCopy}
                            className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs hover:bg-white/20 transition-colors duration-200 flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {copied ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copié
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copier
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          {/* Carrousel des raccourcis récents */}
          <motion.div
            className="mt-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="text-center mb-4">
              <h4 className="text-sm font-medium text-white/70 mb-2">Raccourcis récents</h4>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {/* 3 derniers raccourcis */}
              {recentUrls.length > 0 ? recentUrls.slice(0, 5).map((url, index) => {
                const getDomain = (urlString) => {
                  try {
                    const domain = new window.URL(urlString).hostname;
                    return domain.replace('www.', '');
                  } catch {
                    return urlString.length > 20 ? urlString.substring(0, 20) + '...' : urlString;
                  }
                };

                return (
                  <motion.div
                    key={url.code}
                    className="flex-shrink-0 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-200 min-w-[140px] cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    onClick={() => window.open(url.shortUrl || `http://localhost:8000/${url.code}`, '_blank')}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Globe className="w-4 h-4 text-blue-400 mr-1" />
                        <span className="text-xs text-white/80 truncate">{getDomain(url.original)}</span>
                      </div>
                      <div className="text-xs text-cyan-400 font-mono mb-1">dlpz.fr/{url.code}</div>
                      <div className="text-xs text-white/50">{url.clicks} clic{url.clicks > 1 ? 's' : ''}</div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="flex items-center justify-center w-full py-8">
                  <p className="text-white/50 text-sm">Aucun raccourci récent</p>
                </div>
              )}
            </div>
            
            {/* Bouton Voir tous les raccourcis */}
            {recentUrls.length > 0 && (
              <motion.div
                className="text-center mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.2 }}
              >
                <button
                  onClick={() => setIsAllUrlsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-all duration-200 backdrop-blur-sm"
                >
                  <Eye className="w-4 h-4" />
                  Voir tous les raccourcis ({recentUrls.length})
                </button>
              </motion.div>
            )}
          </motion.div>

        </div>
      </main>

      <footer className="relative z-20 flex items-center justify-between py-6 px-6 text-black/50 text-sm flex-shrink-0 dark:text-white/50 font-light">
        <div className="flex items-center">
          <img
            src="https://dorianlopez.fr/avatar.png"
            alt="Dorian Lopez"
            className="w-8 h-8 rounded-lg object-cover transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-4">
          <p className="text-black/50 dark:text-white/50">
            dlpz.fr © {new Date().getFullYear()} - Tous droits réservés{' '}
            <a
              href="https://dorianlopez.fr"
              target="_blank"
              rel="noreferrer"
              className="text-black/50 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200 dark:text-white/50"
            >
              <Zap className="w-4 h-4 inline" /> dorianlopez.fr
            </a>
          </p>
          
          <ApiStatusBadge />
        </div>

        <div className="w-8 h-8"></div>
      </footer>

      {/* Pulsing Border Element - Optimisé */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <PulsingBorder
            colors={pulsingColors}
            colorBack="#00000000"
            speed={1}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={3}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.3}
            smokeSize={3}
            scale={0.65}
            rotation={0}
            frame={9161408.251009725}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
            }}
          />

          {/* Rotating Text - Optimisé */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{
              duration: 30,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
            style={{ transform: 'scale(1.6)' }}
          >
            <defs>
              <path
                id="circle"
                d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
              />
            </defs>
            <text className="text-sm fill-white/80 font-medium">
              <textPath href="#circle" startOffset="0%">
                dlpz.fr - dorianlopez.fr - dlpz.fr
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>

      {/* Modal Tous les raccourcis */}
      <AllUrlsModal
        urls={recentUrls}
        isOpen={isAllUrlsModalOpen}
        onClose={() => setIsAllUrlsModalOpen(false)}
      />
    </div>
  );
}
