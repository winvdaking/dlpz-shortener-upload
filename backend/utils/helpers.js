import fs from "fs/promises";
import { join } from "path";

/**
 * Utilitaires pour le backend dlpz.fr
 */

// Formater la taille des fichiers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Formater la date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Calculer le temps écoulé
export const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Il y a quelques secondes";
  if (diffInSeconds < 3600)
    return `Il y a ${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400)
    return `Il y a ${Math.floor(diffInSeconds / 3600)} heures`;
  if (diffInSeconds < 2592000)
    return `Il y a ${Math.floor(diffInSeconds / 86400)} jours`;

  return formatDate(dateString);
};

// Nettoyer les anciens fichiers
export const cleanupOldFiles = async (maxAge = 30 * 24 * 60 * 60 * 1000) => {
  try {
    const filesFile = join(process.cwd(), "data", "files.json");
    const data = await fs.readFile(filesFile, "utf8");
    const files = JSON.parse(data);

    const now = new Date();
    const filesToDelete = [];

    for (const [fileId, file] of Object.entries(files)) {
      const fileDate = new Date(file.uploadDate);
      const age = now - fileDate;

      if (age > maxAge) {
        filesToDelete.push({ fileId, path: file.path });
      }
    }

    // Supprimer les fichiers physiques
    for (const { path } of filesToDelete) {
      try {
        await fs.unlink(path);
      } catch (error) {
        console.error(
          `Erreur lors de la suppression de ${path}:`,
          error.message
        );
      }
    }

    // Supprimer les entrées de la base de données
    for (const { fileId } of filesToDelete) {
      delete files[fileId];
    }

    if (filesToDelete.length > 0) {
      await fs.writeFile(filesFile, JSON.stringify(files, null, 2));
      console.log(`${filesToDelete.length} fichiers anciens supprimés`);
    }

    return filesToDelete.length;
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error);
    return 0;
  }
};

// Générer un rapport de statistiques
export const generateStatsReport = async () => {
  try {
    const urlsFile = join(process.cwd(), "data", "urls.json");
    const filesFile = join(process.cwd(), "data", "files.json");

    const [urlsData, filesData] = await Promise.all([
      fs.readFile(urlsFile, "utf8"),
      fs.readFile(filesFile, "utf8"),
    ]);

    const urls = JSON.parse(urlsData);
    const files = JSON.parse(filesData);

    const report = {
      timestamp: new Date().toISOString(),
      urls: {
        total: Object.keys(urls).length,
        totalClicks: Object.values(urls).reduce(
          (sum, url) => sum + (url.clicks || 0),
          0
        ),
        todayCreated: Object.values(urls).filter((url) => {
          const today = new Date().toDateString();
          return new Date(url.createdAt).toDateString() === today;
        }).length,
      },
      files: {
        total: Object.keys(files).length,
        totalSize: Object.values(files).reduce(
          (sum, file) => sum + file.size,
          0
        ),
        totalDownloads: Object.values(files).reduce(
          (sum, file) => sum + (file.downloads || 0),
          0
        ),
        todayUploaded: Object.values(files).filter((file) => {
          const today = new Date().toDateString();
          return new Date(file.uploadDate).toDateString() === today;
        }).length,
      },
    };

    return report;
  } catch (error) {
    console.error("Erreur lors de la génération du rapport:", error);
    return null;
  }
};

// Valider une URL
export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return ["http:", "https:"].includes(url.protocol);
  } catch (_) {
    return false;
  }
};

// Obtenir l'extension d'un fichier
export const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

// Vérifier si un fichier est une image
export const isImageFile = (mimetype) => {
  return mimetype.startsWith("image/");
};

// Obtenir le type MIME d'un fichier
export const getMimeType = (filename) => {
  const ext = getFileExtension(filename).toLowerCase();
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    js: "text/javascript",
    css: "text/css",
    html: "text/html",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    mp4: "video/mp4",
    webm: "video/webm",
  };

  return mimeTypes[ext] || "application/octet-stream";
};
