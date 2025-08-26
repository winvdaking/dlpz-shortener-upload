import { useEffect, useRef, useState } from "react";
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  Upload,
  Zap,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Lock,
  FileUp,
} from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { useTheme } from "../contexts/ThemeContext";

export default function Hero({
  urlInput,
  setUrlInput,
  fileInput,
  setFileInput,
  isLoading,
  resultUrl,
  error,
  copied,
  dragOver,
  handleShorten,
  handleUpload,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleCopy,
}) {
  const containerRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const { theme, getBackgroundClass, getThemeClass } = useTheme();

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true);
    const handleMouseLeave = () => setIsActive(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`h-screen relative overflow-hidden flex flex-col ${getThemeClass()}`}
    >
      <div id="background_noisy" className="absolute inset-0 w-full h-full" />
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter
            id="glass-effect"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter
            id="gooey-filter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient
            id="logo-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient
            id="hero-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#06b6d4" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
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
        className="absolute inset-0 w-full h-full opacity-60"
        colors={
          theme === "light"
            ? ["#f8fafc", "#e2e8f0", "#06b6d4", "#f97316"]
            : ["#000000", "#ffffff", "#06b6d4", "#f97316"]
        }
        speed={0.2}
        wireframe="true"
        backgroundColor="transparent"
      />

      {/* Header/Navbar */}
      <header className="relative z-20 flex items-center justify-between p-6 flex-shrink-0">
        <motion.div
          className="flex items-center group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.div
            className="text-xl font-light text-white group-hover:drop-shadow-lg transition-all duration-300 relative"
            style={{
              filter: "url(#logo-glow)",
            }}
            whileHover={{
              scale: 1.1,
              rotate: [0, -2, 2, 0],
              transition: {
                scale: { duration: 0.3 },
                rotate: { duration: 0.6, ease: "easeInOut" },
              },
            }}
          >
            <motion.span
              className="block tracking-wider font-light dark:text-white/50 text-black/50"
              whileHover={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                transition: { duration: 1.2, ease: "easeInOut" },
              }}
            >
              dlpz.fr
            </motion.span>
          </motion.div>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  y: [-10, -20, -10],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2">
          <a
            href="#"
            className="text-black/50 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200 dark:text-white/50"
          >
            dorianlopez.fr
          </a>
        </nav>

        {/* Login Button Group with Arrow */}
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex flex-col items-center justify-center flex-1 px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl mb-6 relative border border-white/15"
            style={{
              filter: "url(#glass-effect)",
            }}
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

          {/* Title */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.span className="block font-light text-white/90 text-3xl md:text-4xl lg:text-5xl mb-2 tracking-wider">
              URL Shortener & File Upload
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg font-light text-white/70 mb-12 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Shorten your URLs and upload your files with ease
          </motion.p>

          {/* Cards Container */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            {/* URL Shortener Card */}
            <motion.div
              className="group relative rounded-2xl bg-white/10 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/15"
              transition={{ duration: 0.2 }}
            >
              {/* Card Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-white/10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link className="w-6 h-6 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-4">
                  URL Shortener
                </h3>

                {/* Input */}
                <input
                  type="url"
                  placeholder="Enter your URL"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
                />

                {/* Button */}
                <motion.button
                  onClick={handleShorten}
                  disabled={!urlInput.trim() || isLoading}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-white to-white text-black font-medium rounded-lg transition-all duration-200 hover:from-white hover:to-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span className="text-white/80">Generating</span>
                      <motion.span
                        className="text-white/80"
                        animate={{ opacity: [1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        ...
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Shorten
                    </>
                  )}
                </motion.button>

                {/* Result */}
                <AnimatePresence>
                  {(resultUrl || error) && (
                    <motion.div
                      className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error ? (
                        <div className="flex items-center gap-2 text-red-400">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          {error}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-400">
                            <Sparkles className="w-4 h-4" />
                            URL shortened successfully
                          </div>
                          <div className="flex items-center gap-3">
                            <a
                              href={resultUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 truncate text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 transition-colors duration-200"
                            >
                              {resultUrl}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <motion.button
                              onClick={handleCopy}
                              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm hover:bg-white/20 transition-colors duration-200 flex items-center gap-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {copied ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Example Box */}
                <div className="mt-6 p-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg font-mono text-sm">
                  <div className="space-y-3">
                    {/* Example */}
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400">→</span>
                      <span className="text-white/60 truncate">
                        https://www.google.com/url?q=https://www.google.com&sa=D&source=web&cd=&ved=2ahUKEwj...
                      </span>
                    </div>

                    {/* Result */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">→</span>
                        <span className="text-green-400 font-semibold">
                          dlpz.fr/abc123
                        </span>
                      </div>
                      <Zap className="w-3 h-3" />
                    </div>

                    {/* Security */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <span>
                        <Lock className="w-3 h-3" />
                      </span>
                      <span className="text-white/60">Sécurisé et anonyme</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* File Upload Card */}
            <motion.div
              className="group relative rounded-2xl bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/10"
              transition={{ duration: 0.2 }}
            >
              {/* Card Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center bg-white/10"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="w-6 h-6 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  File Upload
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4">
                  Upload your files to the server
                </p>

                {/* Drop Zone */}
                <div
                  className={`w-full p-6 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer transition-all duration-200 hover:border-white/40 hover:bg-white/5 ${
                    dragOver ? "border-white/40 bg-white/5" : ""
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  <motion.div
                    animate={{ scale: dragOver ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-300">
                      Drop your files here or click to upload
                    </p>
                    {fileInput && (
                      <p className="text-xs text-white mt-2">
                        Selected: {fileInput.name}
                      </p>
                    )}
                  </motion.div>
                </div>

                {/* Hidden File Input */}
                <input
                  id="file-input"
                  type="file"
                  onChange={(e) => setFileInput(e.target.files?.[0] ?? null)}
                  className="hidden"
                />

                {/* Button */}
                <motion.button
                  onClick={handleUpload}
                  disabled={!fileInput || isLoading}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-white to-white text-black font-medium rounded-lg transition-all duration-200 hover:from-white hover:to-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span className="text-white/80">Uploading</span>
                      <motion.span
                        className="text-white/80"
                        animate={{ opacity: [1, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        ...
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </motion.button>

                {/* Result */}
                <AnimatePresence>
                  {(resultUrl || error) && (
                    <motion.div
                      className="mt-4 p-4 bg-white/10 rounded-lg border border-white/20"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error ? (
                        <div className="flex items-center gap-2 text-red-400">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          {error}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-400">
                            <Sparkles className="w-4 h-4" />
                            File uploaded successfully
                          </div>
                          <div className="flex items-center gap-3">
                            <a
                              href={resultUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 truncate text-orange-400 hover:text-orange-300 underline flex items-center gap-1 transition-colors duration-200"
                            >
                              {resultUrl}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <motion.button
                              onClick={handleCopy}
                              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm hover:bg-white/20 transition-colors duration-200 flex items-center gap-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {copied ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="mt-6 p-4 bg-black/30 backdrop-blur-sm border border-white/20 rounded-lg font-mono text-sm">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <span className="text-white/60 truncate">
                        Short URL and preview !
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-20 flex items-center justify-between py-6 px-6 text-black/50 text-sm flex-shrink-0 dark:text-white/50 font-light">
        {/* Avatar à gauche */}
        <div className="flex items-center">
          <img
            src="https://dorianlopez.fr/avatar.png"
            alt="Dorian Lopez"
            className="w-8 h-8 rounded-lg object-cover transition-all duration-200"
          />
        </div>

        {/* Contenu central */}
        <p className="text-black/50 dark:text-white/50">
          dlpz.fr © {new Date().getFullYear()} - Tous droits réservés{" "}
          <a
            href="https://dorianlopez.fr"
            target="_blank"
            rel="noreferrer"
            className="text-black/50 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200 dark:text-white/50"
          >
            <Zap className="w-4 h-4 inline" /> dorianlopez.fr
          </a>
        </p>

        {/* Espace vide à droite pour équilibrer */}
        <div className="w-8 h-8"></div>
      </footer>

      {/* Pulsing Border Element */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <PulsingBorder
            colors={[
              "#06b6d4",
              "#0891b2",
              "#f97316",
              "#00FF88",
              "#FFD700",
              "#FF6B35",
              "#ffffff",
            ]}
            colorBack="#00000000"
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.5}
            smokeSize={4}
            scale={0.65}
            rotation={0}
            frame={9161408.251009725}
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
            }}
          />

          {/* Rotating Text Around the Pulsing Border */}
          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ transform: "scale(1.6)" }}
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
    </div>
  );
}
