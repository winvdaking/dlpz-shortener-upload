#!/bin/bash

# Correction complète des dépôts Ubuntu 24.10 (oracular) -> Ubuntu 24.04 LTS (noble)
# Usage: sudo ./fix-repos-complete.sh

set -e

echo "🔧 Correction complète des dépôts Ubuntu..."

# Nettoyer les caches
echo "📦 Nettoyage des caches apt..."
sudo apt clean
sudo apt autoclean
sudo rm -rf /var/lib/apt/lists/*

# Sauvegarder l'ancien sources.list
echo "💾 Sauvegarde de sources.list..."
sudo cp /etc/apt/sources.list /etc/apt/sources.list.backup.$(date +%Y%m%d-%H%M%S)

# Créer un nouveau sources.list complètement propre
echo "🔨 Création d'un nouveau sources.list (Ubuntu 24.04 LTS - noble)..."
sudo tee /etc/apt/sources.list > /dev/null << 'EOF'
# Ubuntu 24.04 LTS (Noble Numbat) - Dépôts officiels
deb http://archive.ubuntu.com/ubuntu/ noble main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ noble-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ noble-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ noble-security main restricted universe multiverse

# Dépôts pour les sources
deb-src http://archive.ubuntu.com/ubuntu/ noble main restricted universe multiverse
deb-src http://archive.ubuntu.com/ubuntu/ noble-updates main restricted universe multiverse
deb-src http://archive.ubuntu.com/ubuntu/ noble-backports main restricted universe multiverse
deb-src http://security.ubuntu.com/ubuntu/ noble-security main restricted universe multiverse
EOF

# Supprimer TOUS les PPA problématiques
echo "🗑️ Suppression de tous les PPA problématiques..."
sudo rm -f /etc/apt/sources.list.d/*ondrej* 2>/dev/null || true
sudo rm -f /etc/apt/sources.list.d/*oracular* 2>/dev/null || true
sudo rm -f /etc/apt/sources.list.d/*jammy* 2>/dev/null || true

# Supprimer les fichiers qui contiennent oracular ou jammy
sudo find /etc/apt/sources.list.d/ -name "*.list" -exec grep -l "oracular\|jammy" {} \; 2>/dev/null | xargs -r sudo rm -f

# Mettre à jour les listes
echo "🔄 Mise à jour des listes de paquets..."
sudo apt update

echo "✅ Correction complète terminée !"
echo "📋 Vous pouvez maintenant exécuter:"
echo "   sudo ./deploy.sh production"
echo ""
echo "ℹ️  Note: Ubuntu 24.10 (oracular) utilise maintenant les dépôts Ubuntu 24.04 LTS (noble) pour la stabilité"
