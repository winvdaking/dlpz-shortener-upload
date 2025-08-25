import { useEffect, useRef, useState } from "react"
import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, Upload, Zap, Heart, Sparkles, ExternalLink, Copy, Check } from "lucide-react"

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
  t
}) {
  const containerRef = useRef(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    };
  }, [])

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black relative overflow-hidden">
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint" />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#06b6d4", "#0891b2", "#164e63", "#f97316"]}
        speed={0.3}
        backgroundColor="#000000" />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#06b6d4", "#f97316"]}
        speed={0.2}
        wireframe="true"
        backgroundColor="transparent" />

      {/* Header/Navbar */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <motion.div
          className="flex items-center group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <motion.svg
            fill="currentColor"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="size-10 text-white group-hover:drop-shadow-lg transition-all duration-300"
            style={{
              filter: "url(#logo-glow)",
            }}
            whileHover={{
              fill: "url(#logo-gradient)",
              rotate: [0, -2, 2, 0],
              transition: {
                fill: { duration: 0.3 },
                rotate: { duration: 0.6, ease: "easeInOut" },
              },
            }}>
            <motion.path
              d="M15 85V15h12l18 35 18-35h12v70h-12V35L45 70h-10L17 35v50H15z"
              initial={{ pathLength: 1 }}
              whileHover={{
                pathLength: [1, 0, 1],
                transition: { duration: 1.2, ease: "easeInOut" },
              }} />
          </motion.svg>

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
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
                }} />
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2">
          <a
            href="#"
            className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            Features
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            Pricing
          </a>
          <a
            href="#"
            className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200">
            Docs
          </a>
        </nav>

        {/* Login Button Group with Arrow */}
        <div
          id="gooey-btn"
          className="relative flex items-center group"
          style={{ filter: "url(#gooey-filter)" }}>
          <button
            className="absolute right-0 px-2.5 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center justify-center -translate-x-10 group-hover:-translate-x-19 z-0">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
          <button
            className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center z-10">
            Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative border border-white/10"
            style={{
              filter: "url(#glass-effect)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <div
              className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent rounded-full" />
            <span className="text-white/90 text-sm font-medium relative z-10 tracking-wide">
              ✨ URL Shortener & File Upload
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}>
            <motion.span
              className="block font-light text-white/90 text-3xl md:text-4xl lg:text-5xl mb-2 tracking-wider"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #06b6d4 30%, #f97316 70%, #ffffff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "url(#text-glow)",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}>
              {t.hero.title}
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg font-light text-white/70 mb-12 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}>
            {t.hero.subtitle}
          </motion.p>

          {/* Cards Container */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}>

            {/* URL Shortener Card */}
            <motion.div
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
              style={{
                filter: "url(#glass-effect)",
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}>
              {/* Card Border Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-transparent to-orange-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Card Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-orange-600 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}>
                  <Link className="w-6 h-6 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-4">
                  {t.urlShortener.title}
                </h3>

                {/* Input */}
                <input
                  type="url"
                  placeholder={t.urlShortener.placeholder}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                />

                {/* Button */}
                <motion.button
                  onClick={handleShorten}
                  disabled={!urlInput.trim() || isLoading}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-orange-500 text-white font-medium rounded-lg transition-all duration-200 hover:from-cyan-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}>
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      {t.urlShortener.loading}
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      {t.urlShortener.button}
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
                      transition={{ duration: 0.3 }}>
                      {error ? (
                        <div className="flex items-center gap-2 text-red-400">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          {error}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-400">
                            <Sparkles className="w-4 h-4" />
                            {t.urlShortener.success}
                          </div>
                          <div className="flex items-center gap-3">
                            <a
                              href={resultUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 truncate text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 transition-colors duration-200">
                              {resultUrl}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <motion.button
                              onClick={handleCopy}
                              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm hover:bg-white/20 transition-colors duration-200 flex items-center gap-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}>
                              {copied ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  {t.urlShortener.copied}
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  {t.urlShortener.copy}
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* File Upload Card */}
            <motion.div
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20"
              style={{
                filter: "url(#glass-effect)",
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}>
              {/* Card Border Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/20 via-transparent to-pink-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Card Content */}
              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className="mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  whileTap={{ scale: 0.95 }}>
                  <Upload className="w-6 h-6 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t.fileUpload.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400 mb-4">
                  {t.fileUpload.description}
                </p>

                {/* Drop Zone */}
                <div
                  className={`w-full p-6 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer transition-all duration-200 hover:border-white/40 hover:bg-white/5 ${dragOver ? "border-orange-400 bg-orange-500/10" : ""
                    }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input").click()}>
                  <motion.div
                    animate={{ scale: dragOver ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-300">
                      {t.fileUpload.dropzone}
                    </p>
                    {fileInput && (
                      <p className="text-xs text-white mt-2">
                        {t.fileUpload.selected} {fileInput.name}
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
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white font-medium rounded-lg transition-all duration-200 hover:from-orange-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}>
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      {t.fileUpload.loading}
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      {t.fileUpload.button}
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
                      transition={{ duration: 0.3 }}>
                      {error ? (
                        <div className="flex items-center gap-2 text-red-400">
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          {error}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-400">
                            <Sparkles className="w-4 h-4" />
                            {t.fileUpload.success}
                          </div>
                          <div className="flex items-center gap-3">
                            <a
                              href={resultUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 truncate text-orange-400 hover:text-orange-300 underline flex items-center gap-1 transition-colors duration-200">
                              {resultUrl}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <motion.button
                              onClick={handleCopy}
                              className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm hover:bg-white/20 transition-colors duration-200 flex items-center gap-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}>
                              {copied ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  {t.urlShortener.copied}
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  {t.urlShortener.copy}
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Pulsing Border Element */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <PulsingBorder
            colors={["#06b6d4", "#0891b2", "#f97316", "#00FF88", "#FFD700", "#FF6B35", "#ffffff"]}
            colorBack="#00000000"
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            spotsPerColor={5}
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
            }} />

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
            style={{ transform: "scale(1.6)" }}>
            <defs>
              <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
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
