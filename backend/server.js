import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";

// Import des routes
import urlRoutes from "./routes/url.js";
import uploadRoutes from "./routes/upload.js";

// Import du middleware de sécurité
import { sanitizeInput } from "./middleware/security.js";

// Configuration
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de sécurité renforcé
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "http://localhost:*", "http://127.0.0.1:*"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts:
      process.env.NODE_ENV === "production"
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
  })
);

// Compression
app.use(compression());

// Logging
app.use(morgan("combined"));

// Rate limiting renforcé
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    error: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // maximum 10 uploads par heure par IP
  message: {
    error: "Limite d'upload atteinte, veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const urlLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // maximum 50 URLs raccourcies par 5 minutes par IP
  message: {
    error:
      "Limite de raccourcissement d'URL atteinte, veuillez réessayer plus tard.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", generalLimiter);
app.use("/api/upload", uploadLimiter);
app.use("/api/url", urlLimiter);

// CORS - Configuration plus permissive pour le développement
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:3002",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permettre les requêtes sans origine (ex: Postman, applications mobiles)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked for origin:", origin);
        callback(new Error("Non autorisé par CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// Body parsing avec limites strictes
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      // Vérifier que le JSON est valide
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        throw new Error("JSON invalide");
      }
    },
  })
);
app.use(
  express.urlencoded({
    extended: false, // Désactiver l'analyse des objets complexes
    limit: "10mb",
    parameterLimit: 100, // Limiter le nombre de paramètres
  })
);

// Middleware de sanitisation des entrées
app.use((req, res, next) => {
  // Sanitiser les paramètres de requête
  if (req.query) {
    for (const key in req.query) {
      req.query[key] = sanitizeInput(req.query[key]);
    }
  }

  // Sanitiser le body
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }

  next();
});

// Servir les fichiers statiques avec sécurité
app.use(
  "/uploads",
  express.static(join(__dirname, "uploads"), {
    setHeaders: (res, path) => {
      // Désactiver l'exécution de scripts
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "1; mode=block");

      // Pour les images, définir le type MIME correct
      if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (path.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      } else if (path.endsWith(".gif")) {
        res.setHeader("Content-Type", "image/gif");
      } else if (path.endsWith(".webp")) {
        res.setHeader("Content-Type", "image/webp");
      } else if (path.endsWith(".svg")) {
        res.setHeader("Content-Type", "image/svg+xml");
      }
    },
  })
);

// Créer les dossiers nécessaires
const createDirectories = async () => {
  const dirs = ["uploads", "uploads/images", "uploads/files", "data"];
  for (const dir of dirs) {
    try {
      await fs.mkdir(join(__dirname, dir), { recursive: true });
    } catch (error) {
      console.log(`Dossier ${dir} existe déjà ou erreur:`, error.message);
    }
  }
};

// Initialiser les fichiers JSON s'ils n'existent pas
const initializeDataFiles = async () => {
  const dataDir = join(__dirname, "data");

  // Fichier pour les URLs raccourcies
  const urlsFile = join(dataDir, "urls.json");
  try {
    await fs.access(urlsFile);
  } catch {
    await fs.writeFile(urlsFile, JSON.stringify({}, null, 2));
  }

  // Fichier pour les fichiers uploadés
  const filesFile = join(dataDir, "files.json");
  try {
    await fs.access(filesFile);
  } catch {
    await fs.writeFile(filesFile, JSON.stringify({}, null, 2));
  }
};

// Routes
app.use("/api/url", urlRoutes);
app.use("/api/upload", uploadRoutes);

// Route de redirection pour les URLs raccourcies
app.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const urlsFile = join(__dirname, "data", "urls.json");

    const data = await fs.readFile(urlsFile, "utf8");
    const urls = JSON.parse(data);

    if (urls[shortId]) {
      // Incrémenter le compteur de clics
      urls[shortId].clicks = (urls[shortId].clicks || 0) + 1;
      urls[shortId].lastAccessed = new Date().toISOString();

      await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2));

      res.redirect(301, urls[shortId].originalUrl);
    } else {
      res.status(404).json({ error: "URL non trouvée" });
    }
  } catch (error) {
    console.error("Erreur lors de la redirection:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// Route de santé
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Route 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error("Erreur:", error);
  res.status(500).json({
    error: "Erreur interne du serveur",
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    await createDirectories();
    await initializeDataFiles();

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log("📁 Dossiers créés: uploads/, data/");
      console.log(
        `🌐 Frontend URL: ${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }`
      );
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
};

startServer();
