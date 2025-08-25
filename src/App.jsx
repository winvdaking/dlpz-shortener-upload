import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  Upload,
  Zap,
  Heart,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Navbar } from "./components/Navbar";
import { Input } from "./components/Input";
import { AuroraBackground } from "./components/ui/aurora-background";

// Translations
const translations = {
  fr: {
    hero: {
      title: "Raccourcisseur d'URL & Upload de Fichiers",
      subtitle:
        "Hi 👋. I'm a powerful URL shortener that can also handle file uploads. Create short links instantly and share them with the world.",
    },
    urlShortener: {
      title: "URL Shortener",
      description:
        "Transformez vos longs liens en versions courtes et élégantes",
      placeholder: "https://votre-lien-super-long.com/...",
      button: "Raccourcir",
      loading: "Chargement...",
      features: {
        unlimited: "Liens illimités et gratuits",
        stats: "Statistiques de clics",
        custom: "Liens personnalisables",
      },
      example: {
        title: "Exemple de sortie :",
        original: "URL originale :",
        short: "URL courte :",
        security: "Sécurité :",
        https: "✓ HTTPS",
      },
      success: "Lien court généré avec succès !",
      copy: "Copier",
      copied: "Copié !",
    },
    fileUpload: {
      title: "Upload Media",
      description: "Partagez vos fichiers avec des liens courts et sécurisés",
      dropzone:
        "Glissez-déposez votre fichier ici ou cliquez pour sélectionner",
      selected: "Fichier sélectionné:",
      button: "Uploader",
      loading: "Chargement...",
      success: "Fichier uploadé avec succès !",
    },
    footer: {
      madeWith: "Fait avec",
      by: "par",
      github: "GitHub",
      linkedin: "LinkedIn",
    },
    errors: {
      invalidUrl: "URL invalide",
      uploadFailed: "Échec de l'upload",
      copyFailed: "Impossible de copier",
    },
  },
  en: {
    hero: {
      title: "URL Shortener & File Upload",
      subtitle:
        "Hi 👋. I'm a powerful URL shortener that can also handle file uploads. Create short links instantly and share them with the world.",
    },
    urlShortener: {
      title: "URL Shortener",
      description: "Transform your long links into short and elegant versions",
      placeholder: "https://your-super-long-link.com/...",
      button: "Shorten",
      loading: "Loading...",
      features: {
        unlimited: "Unlimited and free links",
        stats: "Click statistics",
        custom: "Customizable links",
      },
      example: {
        title: "Example output:",
        original: "Original URL:",
        short: "Short URL:",
        security: "Security:",
        https: "✓ HTTPS",
      },
      success: "Short link generated successfully!",
      copy: "Copy",
      copied: "Copied!",
    },
    fileUpload: {
      title: "File Upload",
      description: "Share your files with short and secure links",
      dropzone: "Drag and drop your file here or click to select",
      selected: "Selected file:",
      button: "Upload",
      loading: "Loading...",
      success: "File uploaded successfully!",
    },
    footer: {
      madeWith: "Made with",
      by: "by",
      github: "GitHub",
      linkedin: "LinkedIn",
    },
    errors: {
      invalidUrl: "Invalid URL",
      uploadFailed: "Upload failed",
      copyFailed: "Unable to copy",
    },
  },
};

function App() {
  const [urlInput, setUrlInput] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [dragOver, setDragOver] = useState(false);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "fr";
  });

  const t = translations[language];

  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };

  // Mouse tracking for card glow effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Update CSS custom properties for card glow effect
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Handle URL shortening
  const handleShorten = async () => {
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setError("");
    setResultUrl("");

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      if (!response.ok) {
        throw new Error("Échec de la requête");
      }

      const data = await response.json();
      const shortUrl = data.shortUrl || data.url || data.link || "";

      if (!shortUrl) {
        throw new Error("Réponse invalide du serveur");
      }

      setResultUrl(shortUrl);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!fileInput) return;

    setIsLoading(true);
    setError("");
    setResultUrl("");

    try {
      const formData = new FormData();
      formData.append("file", fileInput);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Échec de l'upload");
      }

      const data = await response.json();
      const shortUrl = data.shortUrl || data.url || data.link || "";

      if (!shortUrl) {
        throw new Error("Réponse invalide du serveur");
      }

      setResultUrl(shortUrl);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFileInput(files[0]);
    }
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!resultUrl) return;

    try {
      await navigator.clipboard.writeText(resultUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <AuroraBackground className="min-h-screen">
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar language={language} onToggleLanguage={toggleLanguage} />
        <div id="background_noisy" className="absolute inset-0 z-0" />

        <main className="flex-1 relative z-10">
          {/* Modern Header */}
          <div className="clean-header pt-16 pb-12">
            <motion.h1
              className="text-adaptive mix-blend-exclusion"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {t.hero.title}
            </motion.h1>
            <motion.p
              className="font-poppins text-muted-adaptive mix-blend-exclusion"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {t.hero.subtitle}
            </motion.p>
          </div>

          {/* Direct Interface */}
          <div className="max-w-6xl mx-auto px-6 pb-8 relative z-10">
            <div className="direct-interface">
              {/* URL Shortener Section */}
              <motion.div
                className="interface-section"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="section-header">
                  <motion.div
                    className="icon-container mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link className="w-8 h-8" />
                  </motion.div>
                  <h3 className="section-title font-poppins">
                    {t.urlShortener.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  <Input
                    type="url"
                    placeholder={t.urlShortener.placeholder}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                    className="w-full"
                  />
                  <motion.button
                    onClick={handleShorten}
                    disabled={!urlInput.trim()}
                    className="glass-button w-full font-poppins"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        {t.urlShortener.loading}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" />
                        {t.urlShortener.button}
                      </div>
                    )}
                  </motion.button>

                  {/* Example output */}
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <div className="text-xs text-muted-adaptive mb-2">
                      {t.urlShortener.example.title}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-adaptive">
                          {t.urlShortener.example.original}
                        </span>
                        <span className="text-adaptive font-mono text-xs truncate max-w-[250px]">
                          https://example.com/very-long-url...
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-adaptive">
                          {t.urlShortener.example.short}
                        </span>
                        <span className="text-blue-700 font-mono text-xs">
                          dlpz.fr/abc123
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-adaptive">
                          {t.urlShortener.example.security}
                        </span>
                        <span className="text-green-500 text-xs">
                          {t.urlShortener.example.https}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {(resultUrl || error) && (
                    <motion.div
                      className="mt-6 border-t border-border/50 pt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error ? (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          {error}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground font-poppins">
                            <Sparkles className="w-4 h-4 text-blue-700" />
                            {t.urlShortener.success}
                          </div>
                          <div className="glass-card p-4">
                            <div className="flex items-center gap-3">
                              <a
                                href={resultUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 truncate text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline flex items-center gap-1 transition-colors duration-200"
                              >
                                {resultUrl}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <motion.button
                                onClick={handleCopy}
                                className="glass-button shrink-0 inline-flex items-center gap-1 px-4 py-2 text-sm font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    {t.urlShortener.copied}
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    {t.urlShortener.copy}
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* File Upload Section */}
              <motion.div
                className="interface-section"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="section-header">
                  <motion.div
                    className="icon-container mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="w-8 h-8" />
                  </motion.div>
                  <h3 className="section-title font-poppins">
                    {t.fileUpload.title}
                  </h3>
                  <p className="section-description font-poppins">
                    {t.fileUpload.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div
                    className={`drag-drop-area ${dragOver ? "dragover" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-input").click()
                    }
                  >
                    <motion.div
                      animate={{ scale: dragOver ? 1.05 : 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-adaptive" />
                      <p className="text-muted-adaptive font-poppins">
                        {t.fileUpload.dropzone}
                      </p>
                      {fileInput && (
                        <p className="text-sm text-adaptive mt-2 font-poppins">
                          {t.fileUpload.selected} {fileInput.name}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  <input
                    id="file-input"
                    type="file"
                    onChange={(e) => setFileInput(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />

                  <motion.button
                    onClick={handleUpload}
                    disabled={!fileInput}
                    className="glass-button w-full font-poppins"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                        {t.fileUpload.loading}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Heart className="w-4 h-4" />
                        {t.fileUpload.button}
                      </div>
                    )}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {(resultUrl || error) && (
                    <motion.div
                      className="mt-6 border-t border-border/50 pt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error ? (
                        <div className="flex items-center gap-2 text-sm text-red-500">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          {error}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground font-poppins">
                            <Sparkles className="w-4 h-4 text-blue-700" />
                            {t.fileUpload.success}
                          </div>
                          <div className="glass-card p-4">
                            <div className="flex items-center gap-3">
                              <a
                                href={resultUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 truncate text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline flex items-center gap-1 transition-colors duration-200"
                              >
                                {resultUrl}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <motion.button
                                onClick={handleCopy}
                                className="glass-button shrink-0 inline-flex items-center gap-1 px-4 py-2 text-sm font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {copied ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    {t.urlShortener.copied}
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    {t.urlShortener.copy}
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </main>

        {/* Footer - full width at bottom */}
        <motion.footer
          className="mini-footer py-4 mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="footer-container px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="avatar-container w-6 h-6 border border-white/20 dark:border-white/20 light:border-gray-300/50">
                  <img
                    src="/avatar.png"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div
                    className="avatar-fallback text-xs"
                    style={{ display: "none" }}
                  >
                    DL
                  </div>
                </div>
                <span className="text-sm text-muted-adaptive font-poppins">
                  dlpz.fr - URL Shortener
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-adaptive font-poppins">
                <span>Tous droits réservés</span>
                <span>-</span>
                <span>© 2025 dorianlopez.fr</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </AuroraBackground>
  );
}

export default App;
