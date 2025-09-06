import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import { sanitizeUrl } from "../middleware/security.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const urlsFile = join(__dirname, "..", "data", "urls.json");

// Validation d'URL avec sécurité renforcée
const isValidUrl = (string) => {
  const urlValidation = sanitizeUrl(string);
  return urlValidation.valid;
};

// Générer un ID court unique
const generateShortId = async () => {
  let shortId;
  let isUnique = false;

  while (!isUnique) {
    shortId = nanoid(6); // 6 caractères pour un bon équilibre
    const data = await fs.readFile(urlsFile, "utf8");
    const urls = JSON.parse(data);
    isUnique = !urls[shortId];
  }

  return shortId;
};

// POST /api/url/shorten - Raccourcir une URL
router.post("/shorten", async (req, res) => {
  try {
    const { url, customAlias } = req.body;

    // Validation
    if (!url) {
      return res.status(400).json({
        error: "URL requise",
        message: "Veuillez fournir une URL à raccourcir",
      });
    }

    const urlValidation = sanitizeUrl(url);
    if (!urlValidation.valid) {
      return res.status(400).json({
        error: "URL invalide",
        message:
          urlValidation.reason ||
          "Veuillez fournir une URL valide (http:// ou https://)",
      });
    }

    // Utiliser l'URL sanitisée
    const sanitizedUrl = urlValidation.url;

    // Lire les URLs existantes
    const data = await fs.readFile(urlsFile, "utf8");
    const urls = JSON.parse(data);

    // Vérifier si l'URL existe déjà
    const existingEntry = Object.entries(urls).find(
      ([_, data]) => data.originalUrl === sanitizedUrl
    );
    if (existingEntry) {
      const [existingShortId, existingData] = existingEntry;
      return res.json({
        success: true,
        shortUrl: `${req.protocol}://${req.get("host")}/${existingShortId}`,
        originalUrl: sanitizedUrl,
        shortId: existingShortId,
        clicks: existingData.clicks || 0,
        createdAt: existingData.createdAt,
        message: "URL déjà raccourcie",
      });
    }

    // Générer un ID court
    let shortId;
    if (customAlias) {
      // Vérifier si l'alias personnalisé est disponible
      if (urls[customAlias]) {
        return res.status(400).json({
          error: "Alias déjà utilisé",
          message: "Cet alias est déjà utilisé, veuillez en choisir un autre",
        });
      }
      shortId = customAlias;
    } else {
      shortId = await generateShortId();
    }

    // Créer l'entrée
    const urlEntry = {
      originalUrl: sanitizedUrl,
      shortId: shortId,
      clicks: 0,
      createdAt: new Date().toISOString(),
      lastAccessed: null,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    };

    // Sauvegarder
    urls[shortId] = urlEntry;
    await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2));

    res.json({
      success: true,
      shortUrl: `${req.protocol}://${req.get("host")}/${shortId}`,
      originalUrl: sanitizedUrl,
      shortId: shortId,
      clicks: 0,
      createdAt: urlEntry.createdAt,
    });
  } catch (error) {
    console.error("Erreur lors du raccourcissement:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de raccourcir l'URL",
    });
  }
});

// GET /api/url/:shortId - Obtenir les informations d'une URL raccourcie
router.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const data = await fs.readFile(urlsFile, "utf8");
    const urls = JSON.parse(data);

    if (urls[shortId]) {
      res.json({
        success: true,
        data: {
          shortId: shortId,
          originalUrl: urls[shortId].originalUrl,
          shortUrl: `${req.protocol}://${req.get("host")}/${shortId}`,
          clicks: urls[shortId].clicks || 0,
          createdAt: urls[shortId].createdAt,
          lastAccessed: urls[shortId].lastAccessed,
        },
      });
    } else {
      res.status(404).json({
        error: "URL non trouvée",
        message: "Cette URL raccourcie n'existe pas",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de récupérer les informations",
    });
  }
});

// GET /api/url/stats/all - Obtenir toutes les statistiques
router.get("/stats/all", async (req, res) => {
  try {
    const data = await fs.readFile(urlsFile, "utf8");
    const urls = JSON.parse(data);

    const totalUrls = Object.keys(urls).length;
    const totalClicks = Object.values(urls).reduce(
      (sum, url) => sum + (url.clicks || 0),
      0
    );

    // URLs les plus populaires
    const popularUrls = Object.entries(urls)
      .sort(([, a], [, b]) => (b.clicks || 0) - (a.clicks || 0))
      .slice(0, 10)
      .map(([shortId, data]) => ({
        shortId,
        originalUrl: data.originalUrl,
        clicks: data.clicks || 0,
        createdAt: data.createdAt,
      }));

    res.json({
      success: true,
      stats: {
        totalUrls,
        totalClicks,
        popularUrls,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de récupérer les statistiques",
    });
  }
});

// DELETE /api/url/:shortId - Supprimer une URL raccourcie
router.delete("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;

    const data = await fs.readFile(urlsFile, "utf8");
    const urls = JSON.parse(data);

    if (urls[shortId]) {
      delete urls[shortId];
      await fs.writeFile(urlsFile, JSON.stringify(urls, null, 2));

      res.json({
        success: true,
        message: "URL supprimée avec succès",
      });
    } else {
      res.status(404).json({
        error: "URL non trouvée",
        message: "Cette URL raccourcie n'existe pas",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de supprimer l'URL",
    });
  }
});

export default router;
