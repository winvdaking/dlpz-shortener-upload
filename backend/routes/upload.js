import express from "express";
import multer from "multer";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import { fileValidationMiddleware } from "../middleware/security.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const filesFile = join(__dirname, "..", "data", "files.json");

// Gestion des requêtes OPTIONS (preflight CORS)
router.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Déterminer le dossier de destination selon le type de fichier
    const isImage = file.mimetype.startsWith("image/");
    const uploadPath = isImage
      ? join(__dirname, "..", "uploads", "images")
      : join(__dirname, "..", "uploads", "files");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueName = `${nanoid(12)}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    // Texte
    "text/plain",
    "text/csv",
    // Code
    "application/json",
    "text/javascript",
    "text/css",
    "text/html",
    // Audio/Video
    "audio/mpeg",
    "audio/wav",
    "video/mp4",
    "video/webm",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 5, // Maximum 5 fichiers par requête
  },
});

// Fonction de compression d'image
const compressImage = async (inputPath, outputPath, originalSize) => {
  try {
    const metadata = await sharp(inputPath).metadata();

    // Paramètres de compression selon la taille originale
    let quality = 90;
    let width = metadata.width;
    let height = metadata.height;

    // Ajuster la qualité selon la taille
    if (originalSize > 5 * 1024 * 1024) {
      // > 5MB
      quality = 80;
    } else if (originalSize > 2 * 1024 * 1024) {
      // > 2MB
      quality = 85;
    }

    // Redimensionner si l'image est très grande
    if (width > 2048 || height > 2048) {
      const ratio = Math.min(2048 / width, 2048 / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    await sharp(inputPath)
      .resize(width, height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: quality, progressive: true })
      .png({ quality: quality, progressive: true })
      .webp({ quality: quality })
      .toFile(outputPath);

    return {
      compressed: true,
      originalSize,
      compressedSize: (await fs.stat(outputPath)).size,
      compressionRatio: Math.round(
        (1 - (await fs.stat(outputPath)).size / originalSize) * 100
      ),
    };
  } catch (error) {
    console.error("Erreur lors de la compression:", error);
    // Si la compression échoue, copier le fichier original
    await fs.copyFile(inputPath, outputPath);
    return {
      compressed: false,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }
};

// POST /api/upload - Upload de fichiers
router.post(
  "/",
  upload.array("files", 5),
  fileValidationMiddleware,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: "Aucun fichier fourni",
          message: "Veuillez sélectionner au moins un fichier à uploader",
        });
      }

      const uploadedFiles = [];
      const filesData = await fs.readFile(filesFile, "utf8");
      const files = JSON.parse(filesData);

      for (const file of req.files) {
        const fileId = nanoid(8);
        const isImage = file.mimetype.startsWith("image/");

        let compressionInfo = null;
        let finalPath = file.path;

        // Compression pour les images
        if (isImage) {
          const originalSize = file.size;
          const compressedPath = file.path.replace(
            extname(file.path),
            "_compressed.jpg"
          );

          compressionInfo = await compressImage(
            file.path,
            compressedPath,
            originalSize
          );

          // Supprimer l'original et renommer le compressé
          await fs.unlink(file.path);
          await fs.rename(compressedPath, file.path);
          finalPath = file.path;
        }

        // Créer l'entrée dans la base de données
        const fileEntry = {
          fileId: fileId,
          originalName: file.originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: finalPath,
          isImage: isImage,
          compression: compressionInfo,
          uploadDate: new Date().toISOString(),
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          downloads: 0,
          lastAccessed: null,
        };

        files[fileId] = fileEntry;

        uploadedFiles.push({
          fileId: fileId,
          originalName: file.originalname,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          isImage: isImage,
          compression: compressionInfo,
          downloadUrl: `${req.protocol}://${req.get(
            "host"
          )}/api/upload/download/${fileId}`,
          previewUrl: isImage
            ? `${req.protocol}://${req.get("host")}/uploads/images/${
                file.filename
              }`
            : null,
        });
      }

      // Sauvegarder les données
      await fs.writeFile(filesFile, JSON.stringify(files, null, 2));

      res.json({
        success: true,
        message: `${req.files.length} fichier(s) uploadé(s) avec succès`,
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);

      // Nettoyer les fichiers uploadés en cas d'erreur
      if (req.files) {
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error(
              "Erreur lors de la suppression du fichier:",
              unlinkError
            );
          }
        }
      }

      res.status(500).json({
        error: "Erreur lors de l'upload",
        message: error.message || "Impossible d'uploader le fichier",
      });
    }
  }
);

// GET /api/upload/download/:fileId - Télécharger un fichier
router.get("/download/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const filesData = await fs.readFile(filesFile, "utf8");
    const files = JSON.parse(filesData);

    if (!files[fileId]) {
      return res.status(404).json({
        error: "Fichier non trouvé",
        message: "Ce fichier n'existe pas ou a été supprimé",
      });
    }

    const file = files[fileId];

    // Vérifier si le fichier existe physiquement
    try {
      await fs.access(file.path);
    } catch {
      return res.status(404).json({
        error: "Fichier non trouvé",
        message: "Le fichier physique n'existe plus",
      });
    }

    // Incrémenter le compteur de téléchargements
    file.downloads = (file.downloads || 0) + 1;
    file.lastAccessed = new Date().toISOString();

    await fs.writeFile(filesFile, JSON.stringify(files, null, 2));

    // Définir les headers pour le téléchargement
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`
    );
    res.setHeader("Content-Type", file.mimetype);

    // Envoyer le fichier
    res.sendFile(file.path);
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de télécharger le fichier",
    });
  }
});

// GET /api/upload/info/:fileId - Obtenir les informations d'un fichier
router.get("/info/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const filesData = await fs.readFile(filesFile, "utf8");
    const files = JSON.parse(filesData);

    if (!files[fileId]) {
      return res.status(404).json({
        error: "Fichier non trouvé",
        message: "Ce fichier n'existe pas",
      });
    }

    const file = files[fileId];

    res.json({
      success: true,
      data: {
        fileId: file.fileId,
        originalName: file.originalName,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        isImage: file.isImage,
        compression: file.compression,
        uploadDate: file.uploadDate,
        downloads: file.downloads || 0,
        lastAccessed: file.lastAccessed,
        downloadUrl: `${req.protocol}://${req.get(
          "host"
        )}/api/upload/download/${fileId}`,
        previewUrl: file.isImage
          ? `${req.protocol}://${req.get("host")}/uploads/images/${
              file.filename
            }`
          : null,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des infos:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de récupérer les informations du fichier",
    });
  }
});

// GET /api/upload/stats - Obtenir les statistiques des uploads
router.get("/stats", async (req, res) => {
  try {
    const filesData = await fs.readFile(filesFile, "utf8");
    const files = JSON.parse(filesData);

    const totalFiles = Object.keys(files).length;
    const totalSize = Object.values(files).reduce(
      (sum, file) => sum + file.size,
      0
    );
    const totalDownloads = Object.values(files).reduce(
      (sum, file) => sum + (file.downloads || 0),
      0
    );

    // Fichiers par type
    const filesByType = {};
    Object.values(files).forEach((file) => {
      const type = file.mimetype.split("/")[0];
      filesByType[type] = (filesByType[type] || 0) + 1;
    });

    // Fichiers les plus téléchargés
    const popularFiles = Object.entries(files)
      .sort(([, a], [, b]) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 10)
      .map(([fileId, data]) => ({
        fileId,
        originalName: data.originalName,
        downloads: data.downloads || 0,
        uploadDate: data.uploadDate,
      }));

    res.json({
      success: true,
      stats: {
        totalFiles,
        totalSize,
        totalDownloads,
        filesByType,
        popularFiles,
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

// DELETE /api/upload/:fileId - Supprimer un fichier
router.delete("/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    const filesData = await fs.readFile(filesFile, "utf8");
    const files = JSON.parse(filesData);

    if (!files[fileId]) {
      return res.status(404).json({
        error: "Fichier non trouvé",
        message: "Ce fichier n'existe pas",
      });
    }

    const file = files[fileId];

    // Supprimer le fichier physique
    try {
      await fs.unlink(file.path);
    } catch (unlinkError) {
      console.error(
        "Erreur lors de la suppression du fichier physique:",
        unlinkError
      );
    }

    // Supprimer l'entrée de la base de données
    delete files[fileId];
    await fs.writeFile(filesFile, JSON.stringify(files, null, 2));

    res.json({
      success: true,
      message: "Fichier supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({
      error: "Erreur interne du serveur",
      message: "Impossible de supprimer le fichier",
    });
  }
});

export default router;
