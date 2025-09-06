#!/usr/bin/env node

/**
 * Script de démarrage pour le développement
 * Lance le backend et le frontend simultanément
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const backendDir = join(__dirname, "backend");
const frontendDir = __dirname;

console.log("🚀 Démarrage de dlpz.fr en mode développement...\n");

// Fonction pour lancer un processus
const startProcess = (command, args, cwd, name, color) => {
  console.log(`📦 Démarrage de ${name}...`);

  const process = spawn(command, args, {
    cwd,
    stdio: "pipe",
    shell: true,
  });

  // Couleurs pour les logs
  const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
  };

  const logColor = colors[color] || colors.cyan;

  process.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${logColor}[${name}]${colors.reset} ${line}`);
      }
    });
  });

  process.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${colors.red}[${name}]${colors.reset} ${line}`);
      }
    });
  });

  process.on("close", (code) => {
    if (code !== 0) {
      console.log(
        `${colors.red}[${name}] Processus terminé avec le code ${code}${colors.reset}`
      );
    }
  });

  return process;
};

// Démarrer le backend
const backendProcess = startProcess(
  "npm",
  ["run", "dev"],
  backendDir,
  "Backend",
  "green"
);

// Attendre un peu avant de démarrer le frontend
setTimeout(() => {
  // Démarrer le frontend
  const frontendProcess = startProcess(
    "npm",
    ["run", "dev"],
    frontendDir,
    "Frontend",
    "blue"
  );

  // Gestion de l'arrêt propre
  const cleanup = () => {
    console.log("\n🛑 Arrêt des processus...");
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}, 2000);

console.log("\n✅ Services démarrés !");
console.log("📱 Frontend: http://localhost:5173");
console.log("🔧 Backend: http://localhost:3002");
console.log("🔍 API Health: http://localhost:3002/api/health");
console.log("\n💡 Appuyez sur Ctrl+C pour arrêter tous les services\n");
