#!/bin/bash

# Script de correction des dépôts Ubuntu pour DLPZ Shortener
# Usage: ./fix-ubuntu-repos.sh

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier si on est root
if [[ $EUID -ne 0 ]]; then
    error "Ce script doit être exécuté en tant que root ou avec sudo"
fi

log "Correction des dépôts Ubuntu..."

# 1. Nettoyer les caches apt
log "Nettoyage des caches apt..."
apt clean
apt autoclean
rm -rf /var/lib/apt/lists/*
success "Caches apt nettoyés"

# 2. Mettre à jour les sources.list avec des dépôts valides
log "Mise à jour des sources.list..."

# Sauvegarder l'ancien fichier
cp /etc/apt/sources.list /etc/apt/sources.list.backup.$(date +%Y%m%d-%H%M%S)

# Créer un nouveau sources.list avec des dépôts valides pour Ubuntu 24.10
cat > /etc/apt/sources.list << 'EOF'
# Ubuntu 24.10 (Noble Numbat) - Dépôts officiels
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

success "Sources.list mis à jour"

# 3. Supprimer les PPA problématiques
log "Suppression des PPA problématiques..."

# Supprimer les PPA ondrej/php s'ils existent (toutes versions)
find /etc/apt/sources.list.d/ -name "*ondrej*php*" -delete
warning "PPA ondrej/php supprimés"

# Supprimer d'autres PPA potentiellement problématiques
find /etc/apt/sources.list.d/ -name "*.list" -exec grep -l "oracular\|jammy" {} \; | xargs -r rm -f

success "PPA problématiques supprimés"

# 4. Ajouter le PPA ondrej/php correctement
log "Ajout du PPA ondrej/php (version correcte)..."

# Installer les outils nécessaires
apt update
apt install -y software-properties-common

# Ajouter le PPA ondrej/php pour Ubuntu 24.10
add-apt-repository -y ppa:ondrej/php

success "PPA ondrej/php ajouté correctement"

# 5. Mettre à jour les listes de paquets
log "Mise à jour des listes de paquets..."
apt update

success "Listes de paquets mises à jour"

# 6. Installer PHP 8.1 et les extensions nécessaires
log "Installation de PHP 8.1 et des extensions..."

apt install -y \
    php8.1 \
    php8.1-cli \
    php8.1-fpm \
    php8.1-common \
    php8.1-mysql \
    php8.1-xml \
    php8.1-xmlrpc \
    php8.1-curl \
    php8.1-gd \
    php8.1-imagick \
    php8.1-dev \
    php8.1-imap \
    php8.1-mbstring \
    php8.1-opcache \
    php8.1-soap \
    php8.1-zip \
    php8.1-intl \
    php8.1-bcmath

success "PHP 8.1 et extensions installés"

# 7. Installer les autres dépendances nécessaires
log "Installation des autres dépendances..."

apt install -y \
    nginx \
    composer \
    git \
    curl \
    unzip \
    nodejs \
    npm \
    certbot \
    python3-certbot-nginx

success "Dépendances installées"

# 8. Vérifier les versions installées
log "Vérification des versions installées..."
echo "PHP version: $(php8.1 -v | head -n1)"
echo "Composer version: $(composer --version)"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Nginx version: $(nginx -v 2>&1)"

success "Correction des dépôts Ubuntu terminée !"
log "Vous pouvez maintenant exécuter le script de déploiement: ./deploy.sh"
