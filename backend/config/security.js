/**
 * Configuration de sécurité pour dlpz.fr
 */

export const SECURITY_CONFIG = {
  // Limites de fichiers
  FILE_LIMITS: {
    MAX_SIZE: {
      IMAGE: 10 * 1024 * 1024, // 10MB
      VIDEO: 50 * 1024 * 1024, // 50MB
      AUDIO: 20 * 1024 * 1024, // 20MB
      PDF: 25 * 1024 * 1024, // 25MB
      ARCHIVE: 100 * 1024 * 1024, // 100MB
      DEFAULT: 5 * 1024 * 1024, // 5MB
    },
    MAX_FILES_PER_REQUEST: 5,
    MAX_FILENAME_LENGTH: 255,
  },

  // Rate limiting
  RATE_LIMITS: {
    GENERAL: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    },
    UPLOAD: {
      windowMs: 60 * 60 * 1000, // 1 heure
      max: 10,
    },
    URL_SHORTEN: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 50,
    },
  },

  // Types de fichiers autorisés
  ALLOWED_MIME_TYPES: {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "image/svg+xml": [".svg"],
    "application/pdf": [".pdf"],
    "application/zip": [".zip"],
    "application/x-rar-compressed": [".rar"],
    "application/x-7z-compressed": [".7z"],
    "text/plain": [".txt"],
    "text/csv": [".csv"],
    "application/json": [".json"],
    "text/javascript": [".js"],
    "text/css": [".css"],
    "text/html": [".html"],
    "audio/mpeg": [".mp3"],
    "audio/wav": [".wav"],
    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
  },

  // Extensions dangereuses interdites
  DANGEROUS_EXTENSIONS: [
    ".exe",
    ".bat",
    ".cmd",
    ".com",
    ".pif",
    ".scr",
    ".vbs",
    ".jar",
    ".php",
    ".asp",
    ".aspx",
    ".jsp",
    ".py",
    ".pl",
    ".sh",
    ".ps1",
    ".psm1",
    ".dll",
    ".so",
    ".dylib",
    ".app",
    ".deb",
    ".rpm",
    ".msi",
    ".dmg",
    ".sql",
    ".db",
    ".sqlite",
    ".mdb",
    ".accdb",
  ],

  // Mots-clés dangereux
  DANGEROUS_KEYWORDS: [
    "script",
    "exec",
    "eval",
    "system",
    "shell",
    "cmd",
    "powershell",
    "bash",
    "sh",
    "php",
    "asp",
    "jsp",
    "python",
    "perl",
    "ruby",
    "javascript",
    "vbscript",
    "applet",
    "embed",
    "object",
    "iframe",
  ],

  // Noms de fichiers réservés
  RESERVED_FILENAMES: [
    "con",
    "prn",
    "aux",
    "nul",
    "com1",
    "com2",
    "com3",
    "com4",
    "com5",
    "com6",
    "com7",
    "com8",
    "com9",
    "lpt1",
    "lpt2",
    "lpt3",
    "lpt4",
    "lpt5",
    "lpt6",
    "lpt7",
    "lpt8",
    "lpt9",
  ],

  // Domaines interdits pour les URLs
  BLOCKED_DOMAINS: [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "short.link",
  ],

  // Plages d'IP privées interdites
  PRIVATE_IP_RANGES: [
    "10.",
    "172.16.",
    "172.17.",
    "172.18.",
    "172.19.",
    "172.20.",
    "172.21.",
    "172.22.",
    "172.23.",
    "172.24.",
    "172.25.",
    "172.26.",
    "172.27.",
    "172.28.",
    "172.29.",
    "172.30.",
    "172.31.",
    "192.168.",
  ],

  // Patterns de contenu malveillant
  MALICIOUS_PATTERNS: [
    /<script[^>]*>/i,
    /javascript:/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /onclick\s*=/i,
    /eval\s*\(/i,
    /function\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
    /document\.write/i,
    /innerHTML\s*=/i,
    /outerHTML\s*=/i,
    /exec\s*\(/i,
    /system\s*\(/i,
    /shell_exec\s*\(/i,
    /passthru\s*\(/i,
    /proc_open\s*\(/i,
    /popen\s*\(/i,
    /file_get_contents\s*\(/i,
    /fopen\s*\(/i,
    /fwrite\s*\(/i,
    /include\s*\(/i,
    /require\s*\(/i,
    /import\s+/i,
    /from\s+/i,
    /__import__\s*\(/i,
    /subprocess/i,
    /os\.system/i,
    /os\.popen/i,
  ],

  // Headers de sécurité
  SECURITY_HEADERS: {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  },

  // Configuration CSP (Content Security Policy)
  CSP_DIRECTIVES: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: [],
  },
};

export default SECURITY_CONFIG;
