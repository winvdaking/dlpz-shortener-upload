import { useState, useCallback } from "react";
import { HelmetProvider } from "react-helmet-async";
import Hero from "./components/hero";
import SEO from "./components/SEO";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useUrlShortener, useFileUpload } from "./hooks/useApi";

function App() {
  const [urlInput, setUrlInput] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Hooks pour les appels API
  const urlShortener = useUrlShortener();
  const fileUpload = useFileUpload();

  // Optimisation: useCallback pour éviter les re-créations de fonctions
  const handleShorten = useCallback(async () => {
    if (!urlInput.trim()) return;
    await urlShortener.shorten(urlInput.trim());
  }, [urlInput, urlShortener]);

  const handleUpload = useCallback(async () => {
    if (!fileInput) return;
    await fileUpload.upload(fileInput);
  }, [fileInput, fileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFileInput(files[0]);
    }
  }, []);

  const handleCopy = useCallback(async () => {
    const currentResult = urlShortener.result || fileUpload.result;
    if (!currentResult) return;

    try {
      await navigator.clipboard.writeText(currentResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [urlShortener.result, fileUpload.result]);

  return (
    <HelmetProvider>
      <ThemeProvider>
        <div className="min-h-screen">
          <SEO />
          <Hero
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            fileInput={fileInput}
            setFileInput={setFileInput}
            isLoading={urlShortener.isLoading || fileUpload.isLoading}
            resultUrl={urlShortener.result || fileUpload.result}
            error={urlShortener.error || fileUpload.error}
            copied={copied}
            dragOver={dragOver}
            handleShorten={handleShorten}
            handleUpload={handleUpload}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleCopy={handleCopy}
          />
        </div>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
