import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "./components/Navbar";
import Hero from "./components/hero";

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

  // Save language preference
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === "fr" ? "en" : "fr");
  };

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
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}

      {/* Hero Section */}
      <Hero
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        fileInput={fileInput}
        setFileInput={setFileInput}
        isLoading={isLoading}
        resultUrl={resultUrl}
        error={error}
        copied={copied}
        dragOver={dragOver}
        handleShorten={handleShorten}
        handleUpload={handleUpload}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handleCopy={handleCopy}
        t={t}
      />

      {/* Footer */}
      <motion.footer
        className="py-8 border-t border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-white/20 overflow-hidden">
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
                  className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold"
                  style={{ display: "none" }}
                >
                  DL
                </div>
              </div>
              <span className="text-sm text-slate-300">
                dlpz.fr - URL Shortener
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-300">
              <span>Tous droits réservés</span>
              <span>-</span>
              <span>© 2025 dorianlopez.fr</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;
