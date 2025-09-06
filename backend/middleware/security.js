import fs from "fs/promises";
import { extname } from "path";
import sharp from "sharp";

/**
 * Middleware de sécurité pour dlpz.fr
 * Protection contre les exécutions malveillantes et les attaques
 */

// Types de fichiers autorisés avec validation stricte
const ALLOWED_MIME_TYPES = {
  // Images uniquement
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],

  // Documents PDF uniquement
  "application/pdf": [".pdf"],

  // Archives compressées
  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],
  "application/x-7z-compressed": [".7z"],

  // Texte simple
  "text/plain": [".txt"],
  "text/csv": [".csv"],

  // Code (lecture seule)
  "application/json": [".json"],
  "text/javascript": [".js"],
  "text/css": [".css"],
  "text/html": [".html"],

  // Audio/Video (formats sûrs)
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
};

// Extensions dangereuses interdites
const DANGEROUS_EXTENSIONS = [
  ".exe",
  ".bat",
  ".cmd",
  ".com",
  ".pif",
  ".scr",
  ".vbs",
  ".js",
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
];

// Mots-clés dangereux dans les noms de fichiers
const DANGEROUS_KEYWORDS = [
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
];

/**
 * Valider le type MIME d'un fichier
 */
export const validateMimeType = (mimetype, filename) => {
  const ext = extname(filename).toLowerCase();

  // Vérifier si l'extension est dans les types autorisés
  if (!ALLOWED_MIME_TYPES[mimetype]) {
    return { valid: false, reason: "Type MIME non autorisé" };
  }

  // Vérifier si l'extension correspond au type MIME
  if (!ALLOWED_MIME_TYPES[mimetype].includes(ext)) {
    return { valid: false, reason: "Extension ne correspond pas au type MIME" };
  }

  return { valid: true };
};

/**
 * Valider le nom de fichier
 */
export const validateFilename = (filename) => {
  // Vérifier la longueur
  if (filename.length > 255) {
    return { valid: false, reason: "Nom de fichier trop long" };
  }

  // Vérifier les caractères interdits
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(filename)) {
    return {
      valid: false,
      reason: "Caractères interdits dans le nom de fichier",
    };
  }

  // Vérifier les extensions dangereuses
  const ext = extname(filename).toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { valid: false, reason: "Extension de fichier dangereuse" };
  }

  // Vérifier les mots-clés dangereux
  const lowerFilename = filename.toLowerCase();
  for (const keyword of DANGEROUS_KEYWORDS) {
    if (lowerFilename.includes(keyword)) {
      return {
        valid: false,
        reason: "Nom de fichier contient des mots-clés dangereux",
      };
    }
  }

  // Vérifier les noms réservés Windows
  const reservedNames = [
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
  ];
  const nameWithoutExt = filename.split(".")[0].toLowerCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return { valid: false, reason: "Nom de fichier réservé" };
  }

  return { valid: true };
};

/**
 * Analyser le contenu d'un fichier pour détecter du code malveillant
 */
export const analyzeFileContent = async (filePath, mimetype) => {
  try {
    // Pour les fichiers texte, vérifier le contenu
    if (mimetype.startsWith("text/") || mimetype === "application/json") {
      const content = await fs.readFile(filePath, "utf8");

      // Mots-clés dangereux dans le contenu
      const dangerousPatterns = [
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
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          return {
            safe: false,
            reason: "Contenu malveillant détecté dans le fichier",
          };
        }
      }
    }

    // Pour les images, vérifier avec Sharp
    if (mimetype.startsWith("image/")) {
      try {
        const metadata = await sharp(filePath).metadata();

        // Vérifier que c'est bien une image valide
        if (!metadata.width || !metadata.height) {
          return {
            safe: false,
            reason: "Image corrompue ou invalide",
          };
        }

        // Vérifier les dimensions (protection contre les attaques par déni de service)
        if (metadata.width > 10000 || metadata.height > 10000) {
          return {
            safe: false,
            reason: "Image trop grande (protection DoS)",
          };
        }
      } catch (error) {
        return {
          safe: false,
          reason: "Erreur lors de la validation de l'image",
        };
      }
    }

    return { safe: true };
  } catch (error) {
    return {
      safe: false,
      reason: "Erreur lors de l'analyse du fichier",
    };
  }
};

/**
 * Sanitiser une URL
 */
export const sanitizeUrl = (url) => {
  try {
    const urlObj = new URL(url);

    // Vérifier le protocole
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return { valid: false, reason: "Protocole non autorisé" };
    }

    // Vérifier l'hostname (bloquer les IPs privées et localhost)
    const hostname = urlObj.hostname.toLowerCase();
    const privateRanges = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
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
    ];

    for (const range of privateRanges) {
      if (hostname.startsWith(range)) {
        return { valid: false, reason: "URL pointe vers une adresse privée" };
      }
    }

    // Vérifier les domaines suspects
    const suspiciousDomains = [
      "bit.ly",
      "tinyurl.com",
      "t.co",
      "goo.gl",
      "ow.ly",
      "short.link",
    ];

    if (suspiciousDomains.some((domain) => hostname.includes(domain))) {
      return {
        valid: false,
        reason: "Domaine de raccourcissement d'URL non autorisé",
      };
    }

    return { valid: true, url: urlObj.toString() };
  } catch (error) {
    return { valid: false, reason: "URL invalide" };
  }
};

/**
 * Sanitiser les entrées utilisateur
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") {
    return input;
  }

  // Supprimer les caractères de contrôle
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, "");

  // Échapper les caractères HTML
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  // Limiter la longueur
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }

  return sanitized;
};

/**
 * Valider la taille d'un fichier
 */
export const validateFileSize = (size, mimetype) => {
  const maxSizes = {
    "image/": 10 * 1024 * 1024, // 10MB pour les images
    "video/": 50 * 1024 * 1024, // 50MB pour les vidéos
    "audio/": 20 * 1024 * 1024, // 20MB pour l'audio
    "application/pdf": 25 * 1024 * 1024, // 25MB pour les PDF
    "application/zip": 100 * 1024 * 1024, // 100MB pour les archives
    default: 5 * 1024 * 1024, // 5MB par défaut
  };

  let maxSize = maxSizes.default;

  for (const [type, limit] of Object.entries(maxSizes)) {
    if (mimetype.startsWith(type)) {
      maxSize = limit;
      break;
    }
  }

  if (size > maxSize) {
    return {
      valid: false,
      reason: `Fichier trop volumineux (max: ${Math.round(
        maxSize / 1024 / 1024
      )}MB)`,
    };
  }

  return { valid: true };
};

/**
 * Middleware de validation de fichier complet
 */
export const fileValidationMiddleware = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    for (const file of req.files) {
      // Validation du nom de fichier
      const filenameValidation = validateFilename(file.originalname);
      if (!filenameValidation.valid) {
        await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({
          error: "Fichier rejeté",
          message: filenameValidation.reason,
        });
      }

      // Validation du type MIME
      const mimeValidation = validateMimeType(file.mimetype, file.originalname);
      if (!mimeValidation.valid) {
        await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({
          error: "Fichier rejeté",
          message: mimeValidation.reason,
        });
      }

      // Validation de la taille
      const sizeValidation = validateFileSize(file.size, file.mimetype);
      if (!sizeValidation.valid) {
        await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({
          error: "Fichier rejeté",
          message: sizeValidation.reason,
        });
      }

      // Analyse du contenu
      const contentAnalysis = await analyzeFileContent(
        file.path,
        file.mimetype
      );
      if (!contentAnalysis.safe) {
        await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({
          error: "Fichier rejeté",
          message: contentAnalysis.reason,
        });
      }
    }

    next();
  } catch (error) {
    console.error("Erreur lors de la validation des fichiers:", error);

    // Nettoyer les fichiers en cas d'erreur
    if (req.files) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
    }

    res.status(500).json({
      error: "Erreur de validation",
      message: "Impossible de valider les fichiers",
    });
  }
};
