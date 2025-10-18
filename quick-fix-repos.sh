#!/bin/bash

# Correction rapide des dépôts Ubuntu 24.10 (oracular) -> Ubuntu 24.04 LTS (noble)
# Usage: sudo ./quick-fix-repos.sh

set -e

echo "🔧 Correction rapide des dépôts Ubuntu..."

# Nettoyer les caches
echo "📦 Nettoyage des caches apt..."
sudo apt clean
sudo apt autoclean
sudo rm -rf /var/lib/apt/lists/*

# Sauvegarder l'ancien sources.list
echo "💾 Sauvegarde de sources.list..."
sudo cp /etc/apt/sources.list /etc/apt/sources.list.backup.$(date +%Y%m%d-%H%M%S)

# Corriger sources.list
echo "🔨 Correction de sources.list (oracular -> noble)..."
sudo sed -i 's/oracular/noble/g' /etc/apt/sources.list
sudo sed -i 's/jammy/noble/g' /etc/apt/sources.list

# Supprimer les PPA problématiques
echo "🗑️ Suppression des PPA problématiques..."
sudo find /etc/apt/sources.list.d/ -name "*ondrej*php*" -delete 2>/dev/null || true
sudo find /etc/apt/sources.list.d/ -name "*.list" -exec grep -l "oracular\|jammy" {} \; 2>/dev/null | xargs -r sudo rm -f

# Mettre à jour les listes
echo "🔄 Mise à jour des listes de paquets..."
sudo apt update

echo "✅ Correction terminée !"
echo "📋 Vous pouvez maintenant exécuter:"
echo "   sudo ./deploy.sh production"
echo ""
echo "ℹ️  Note: Ubuntu 24.10 (oracular) utilise maintenant les dépôts Ubuntu 24.04 LTS (noble) pour la stabilité"
