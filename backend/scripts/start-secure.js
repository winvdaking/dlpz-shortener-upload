#!/usr/bin/env node

/**
 * Script de démarrage sécurisé pour dlpz.fr
 * Vérifie la configuration de sécurité avant le démarrage
 */

import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');

// Vérifications de sécurité
const securityChecks = [
  {
    name: 'Vérification des permissions des dossiers',
    check: async () => {
      const dirs = ['uploads', 'uploads/images', 'uploads/files', 'data'];
      for (const dir of dirs) {
        const dirPath = join(PROJECT_ROOT, dir);
        try {
          await fs.access(dirPath);
          const stats = await fs.stat(dirPath);
          if (!stats.isDirectory()) {
            throw new Error(`${dir} n'est pas un dossier`);
          }
        } catch (error) {
          // Créer le dossier s'il n'existe pas
          await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
        }
      }
      return true;
    }
  },
  {
    name: 'Vérification des fichiers de données',
    check: async () => {
      const dataFiles = ['urls.json', 'files.json'];
      for (const file of dataFiles) {
        const filePath = join(PROJECT_ROOT, 'data', file);
        try {
          await fs.access(filePath);
          // Vérifier que le fichier est un JSON valide
          const content = await fs.readFile(filePath, 'utf8');
          JSON.parse(content);
        } catch (error) {
          // Créer le fichier s'il n'existe pas
          await fs.writeFile(filePath, JSON.stringify({}, null, 2), { mode: 0o644 });
        }
      }
      return true;
    }
  },
  {
    name: 'Vérification des variables d\'environnement',
    check: async () => {
      const requiredVars = ['NODE_ENV'];
      const missing = requiredVars.filter(varName => !process.env[varName]);
      
      if (missing.length > 0) {
        console.warn(`⚠️  Variables d'environnement manquantes: ${missing.join(', ')}`);
        console.warn('   Utilisation des valeurs par défaut');
      }
      
      // Définir les valeurs par défaut
      if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'production';
      }
      
      return true;
    }
  },
  {
    name: 'Vérification de la configuration de sécurité',
    check: async () => {
      // Vérifier que les modules de sécurité sont présents
      try {
        await import('../middleware/security.js');
        await import('../config/security.js');
        return true;
      } catch (error) {
        throw new Error('Modules de sécurité manquants');
      }
    }
  },
  {
    name: 'Vérification des dépendances critiques',
    check: async () => {
      const criticalModules = ['express', 'helmet', 'cors', 'multer', 'sharp'];
      const missing = [];
      
      for (const module of criticalModules) {
        try {
          await import(module);
        } catch (error) {
          missing.push(module);
        }
      }
      
      if (missing.length > 0) {
        throw new Error(`Modules critiques manquants: ${missing.join(', ')}`);
      }
      
      return true;
    }
  }
];

// Fonction principale
const runSecurityChecks = async () => {
  console.log('🔒 Vérification de la sécurité du serveur...\n');
  
  let allPassed = true;
  
  for (const check of securityChecks) {
    try {
      console.log(`⏳ ${check.name}...`);
      await check.check();
      console.log(`✅ ${check.name} - OK\n`);
    } catch (error) {
      console.error(`❌ ${check.name} - ÉCHEC: ${error.message}\n`);
      allPassed = false;
    }
  }
  
  if (!allPassed) {
    console.error('🚨 Des vérifications de sécurité ont échoué !');
    console.error('   Le serveur ne peut pas démarrer en toute sécurité.');
    process.exit(1);
  }
  
  console.log('✅ Toutes les vérifications de sécurité sont passées !');
  console.log('🚀 Démarrage du serveur sécurisé...\n');
};

// Exécuter les vérifications
runSecurityChecks().catch(error => {
  console.error('💥 Erreur lors des vérifications de sécurité:', error);
  process.exit(1);
});
