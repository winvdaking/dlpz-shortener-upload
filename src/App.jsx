import { useState } from "react";
import Hero from "./components/hero";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  const [urlInput, setUrlInput] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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
    <ThemeProvider>
      <div className="min-h-screen">
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
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
