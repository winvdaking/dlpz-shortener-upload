#!/bin/bash

# Script de déploiement pour DLPZ Shortener
# Usage: ./deploy.sh [environment] [--fix-repos-only]
# Environment: dev, staging, production (défaut: production)
# --fix-repos-only: Corriger uniquement les dépôts Ubuntu

set -e  # Arrêter en cas d'erreur

# Configuration
ENVIRONMENT=${1:-production}
FIX_REPOS_ONLY=false

# Vérifier les arguments
if [[ "$2" == "--fix-repos-only" ]]; then
    FIX_REPOS_ONLY=true
fi

PROJECT_DIR="/var/www/dlpz.fr"
BACKUP_DIR="/var/backups/dlpz.fr"
LOG_FILE="/var/log/dlpz-deploy.log"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Correction complète des dépôts Ubuntu
fix_ubuntu_repos() {
    log "Correction complète des dépôts Ubuntu..."
    
    # Nettoyer les caches apt
    apt clean
    apt autoclean
    rm -rf /var/lib/apt/lists/*
    
    # Sauvegarder sources.list
    cp /etc/apt/sources.list /etc/apt/sources.list.backup.$(date +%Y%m%d-%H%M%S)
    
    # Créer un nouveau sources.list complètement propre pour Ubuntu 24.04 LTS
    log "Création d'un nouveau sources.list (Ubuntu 24.04 LTS - noble)..."
    cat > /etc/apt/sources.list << 'EOF'
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
    log "Suppression de tous les PPA problématiques..."
    rm -f /etc/apt/sources.list.d/*ondrej* 2>/dev/null || true
    rm -f /etc/apt/sources.list.d/*oracular* 2>/dev/null || true
    rm -f /etc/apt/sources.list.d/*jammy* 2>/dev/null || true
    find /etc/apt/sources.list.d/ -name "*.list" -exec grep -l "oracular\|jammy" {} \; 2>/dev/null | xargs -r rm -f
    find /etc/apt/sources.list.d/ -name ".*" -exec grep -l "oracular\|jammy" {} \; 2>/dev/null | xargs -r rm -f
    
    success "PPA problématiques supprimés"
    
    # Mettre à jour les listes
    apt update
    
    success "Dépôts Ubuntu corrigés"
}

# Mise à jour du système
update_system() {
    log "Mise à jour du système..."
    
    # Mettre à jour les listes de paquets
    apt update
    
    # Mettre à jour le système
    apt -y upgrade
    
    # Installer les outils de base nécessaires
    apt install -y curl wget unzip git composer nodejs npm nginx certbot python3-certbot-nginx
    
    success "Système mis à jour et outils installés"
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier si on est root ou sudo
    if [[ $EUID -ne 0 ]]; then
        error "Ce script doit être exécuté en tant que root ou avec sudo"
    fi
    
    # Vérifier la version Ubuntu
    UBUNTU_VERSION=$(lsb_release -d | cut -f2)
    log "Version Ubuntu détectée: $UBUNTU_VERSION"
    
    if lsb_release -c | grep -q "oracular"; then
        warning "Ubuntu 24.10 (oracular) détecté - Les dépôts seront redirigés vers Ubuntu 24.04 LTS (noble) pour la stabilité"
    fi
    
    # Vérifier les commandes nécessaires
    for cmd in git composer npm php nginx systemctl; do
        if ! command -v $cmd &> /dev/null; then
            warning "Commande manquante: $cmd - Installation en cours..."
        fi
    done
    
    success "Prérequis vérifiés"
}

# Création des répertoires nécessaires
create_directories() {
    log "Création des répertoires..."
    
    mkdir -p "$PROJECT_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "/var/log"
    
    success "Répertoires créés"
}

# Sauvegarde de la version actuelle
backup_current() {
    if [ -d "$PROJECT_DIR" ] && [ "$(ls -A $PROJECT_DIR)" ]; then
        log "Sauvegarde de la version actuelle..."
        
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
        
        cp -r "$PROJECT_DIR" "$BACKUP_PATH"
        
        # Garder seulement les 5 dernières sauvegardes
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs -r rm -rf
        
        success "Sauvegarde créée: $BACKUP_NAME"
    else
        warning "Aucune version actuelle à sauvegarder"
    fi
}

# Vérification du code source
check_code() {
    log "Vérification du code source..."
    
    if [ -d "$PROJECT_DIR" ] && [ "$(ls -A $PROJECT_DIR)" ]; then
        success "Code source trouvé dans $PROJECT_DIR"
    else
        error "Code source non trouvé dans $PROJECT_DIR. Veuillez d'abord cloner le dépôt."
    fi
}

# Installation des dépendances backend
install_backend_deps() {
    log "Installation des dépendances backend..."
    
    cd "$PROJECT_DIR/backend"
    
    # S'assurer que www-data peut écrire dans le répertoire
    sudo chown -R www-data:www-data "$PROJECT_DIR"
    
    # Installation des dépendances Composer (en tant que www-data)
    if [ "$ENVIRONMENT" = "production" ]; then
        sudo -u www-data composer install --no-dev --optimize-autoloader --no-interaction --no-scripts
    else
        sudo -u www-data composer install --no-interaction --no-scripts
    fi
    
    # Exécuter les scripts Symfony manuellement si nécessaire
    if [ -f "bin/console" ]; then
        log "Exécution des scripts Symfony..."
        sudo -u www-data php bin/console cache:clear --env=prod --no-debug 2>/dev/null || true
    fi
    
    success "Dépendances backend installées"
}

# Installation des dépendances frontend
install_frontend_deps() {
    log "Installation des dépendances frontend..."
    
    cd "$PROJECT_DIR"
    
    # Corriger le cache npm si nécessaire
    if [ -d "/var/www/.npm" ]; then
        log "Correction du cache npm..."
        WWW_DATA_UID=$(id -u www-data)
        WWW_DATA_GID=$(id -g www-data)
        sudo chown -R $WWW_DATA_UID:$WWW_DATA_GID "/var/www/.npm" 2>/dev/null || true
    fi
    
    # S'assurer que www-data peut écrire dans le répertoire
    sudo chown -R www-data:www-data "$PROJECT_DIR"
    
    # Installation des dépendances npm (en tant que www-data)
    # Utiliser un cache npm temporaire si le cache principal pose problème
    sudo -u www-data npm ci --cache /tmp/.npm-cache 2>/dev/null || {
        log "Tentative avec cache npm temporaire..."
        sudo -u www-data npm ci --cache /tmp/.npm-cache --no-optional
    }
    
    # Installer terser pour Vite (nécessaire pour la minification en production)
    log "Installation de terser pour Vite..."
    sudo -u www-data npm install --save-dev terser --cache /tmp/.npm-cache 2>/dev/null || {
        log "Installation de terser en mode global..."
        sudo -u www-data npm install -g terser --cache /tmp/.npm-cache
    }
    
    success "Dépendances frontend installées"
}

# Configuration des fichiers d'environnement
setup_environment() {
    log "Configuration de l'environnement..."
    
    # Backend
    if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
        cp "$PROJECT_DIR/backend/env.example" "$PROJECT_DIR/backend/.env"
        log "Fichier .env backend créé depuis env.example"
    fi
    
    # Frontend
    if [ ! -f "$PROJECT_DIR/.env.production" ]; then
        cp "$PROJECT_DIR/env.example" "$PROJECT_DIR/.env.production"
        log "Fichier .env.production frontend créé depuis env.example"
    fi
    
    # Configuration automatique pour la production
    log "Configuration automatique pour la production..."
    
    # Backend - Configuration de base
    if [ -f "$PROJECT_DIR/backend/.env" ]; then
        # Configurer l'environnement
        sed -i 's/APP_ENV=dev/APP_ENV=prod/' "$PROJECT_DIR/backend/.env"
        sed -i 's/APP_DEBUG=true/APP_DEBUG=false/' "$PROJECT_DIR/backend/.env"
        
        # Générer un APP_SECRET si nécessaire
        if ! grep -q "APP_SECRET=" "$PROJECT_DIR/backend/.env" || grep -q "APP_SECRET=ThisTokenIsNotSoSecretChangeIt" "$PROJECT_DIR/backend/.env"; then
            APP_SECRET=$(openssl rand -hex 32)
            if grep -q "APP_SECRET=" "$PROJECT_DIR/backend/.env"; then
                sed -i "s/APP_SECRET=.*/APP_SECRET=$APP_SECRET/" "$PROJECT_DIR/backend/.env"
            else
                echo "APP_SECRET=$APP_SECRET" >> "$PROJECT_DIR/backend/.env"
            fi
            log "APP_SECRET généré automatiquement"
        fi
        
        # Configurer la base de données (JSON par défaut)
        if ! grep -q "DATABASE_URL" "$PROJECT_DIR/backend/.env" || grep -q "DATABASE_URL=sqlite" "$PROJECT_DIR/backend/.env"; then
            echo "DATABASE_URL=sqlite:///%kernel.project_dir%/data/urls.json" >> "$PROJECT_DIR/backend/.env"
        fi
        
        log "Configuration backend mise à jour"
    fi
    
    # Frontend - Configuration de base
    if [ -f "$PROJECT_DIR/.env.production" ]; then
        # Configurer l'URL de l'API
        if ! grep -q "VITE_API_URL" "$PROJECT_DIR/.env.production"; then
            echo "VITE_API_URL=https://dlpz.fr" >> "$PROJECT_DIR/.env.production"
        fi
        
        log "Configuration frontend mise à jour"
    fi
    
    # Configurer les permissions des fichiers .env
    log "Configuration des permissions des fichiers .env..."
    sudo chown www-data:www-data "$PROJECT_DIR/backend/.env" 2>/dev/null || true
    sudo chown www-data:www-data "$PROJECT_DIR/.env.production" 2>/dev/null || true
    sudo chmod 644 "$PROJECT_DIR/backend/.env" 2>/dev/null || true
    sudo chmod 644 "$PROJECT_DIR/.env.production" 2>/dev/null || true
    
    # Rebuild du frontend avec la nouvelle configuration
    log "Rebuild du frontend avec la nouvelle configuration..."
    cd "$PROJECT_DIR"
    sudo -u www-data npm run build --cache /tmp/.npm-cache 2>/dev/null || {
        log "Tentative de build avec cache npm temporaire..."
        sudo -u www-data npm run build --cache /tmp/.npm-cache
    }
    
    success "Configuration d'environnement terminée"
}

# Build du frontend
build_frontend() {
    log "Build du frontend..."
    
    cd "$PROJECT_DIR"
    
    # Corriger le cache npm si nécessaire
    if [ -d "/var/www/.npm" ]; then
        log "Correction du cache npm..."
        WWW_DATA_UID=$(id -u www-data)
        WWW_DATA_GID=$(id -g www-data)
        sudo chown -R $WWW_DATA_UID:$WWW_DATA_GID "/var/www/.npm" 2>/dev/null || true
    fi
    
    # S'assurer que www-data peut écrire dans le répertoire
    sudo chown -R www-data:www-data "$PROJECT_DIR"
    
    # Build en tant que www-data
    # Utiliser un cache npm temporaire si le cache principal pose problème
    sudo -u www-data npm run build --cache /tmp/.npm-cache 2>/dev/null || {
        log "Tentative de build avec cache npm temporaire..."
        sudo -u www-data npm run build --cache /tmp/.npm-cache
    }
    
    success "Frontend buildé"
}

# Configuration des permissions
setup_permissions() {
    log "Configuration des permissions..."
    
    # Propriétaire
    sudo chown -R www-data:www-data "$PROJECT_DIR"
    
    # Permissions
    sudo find "$PROJECT_DIR" -type d -exec chmod 755 {} \;
    sudo find "$PROJECT_DIR" -type f -exec chmod 644 {} \;
    
    # Permissions spéciales
    sudo chmod 755 "$PROJECT_DIR/backend/bin/console"
    sudo chmod -R 777 "$PROJECT_DIR/backend/var"
    sudo chmod -R 777 "$PROJECT_DIR/backend/data"
    
    success "Permissions configurées"
}

# Configuration Nginx
setup_nginx() {
    log "Configuration Nginx..."
    
    # Détecter la version PHP installée
    PHP_VERSION=$(php -v | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    
    # Copier la configuration
    cp "$PROJECT_DIR/nginx/dlpz.fr.conf" "/etc/nginx/sites-available/dlpz.fr"
    
    # Corriger la version PHP dans la configuration Nginx
    log "Correction de la version PHP dans Nginx (version détectée: $PHP_VERSION)..."
    sed -i "s/php8\.1-fpm/php${PHP_VERSION}-fpm/g" "/etc/nginx/sites-available/dlpz.fr"
    
    # Activer le site
    ln -sf "/etc/nginx/sites-available/dlpz.fr" "/etc/nginx/sites-enabled/"
    
    # Tester la configuration
    nginx -t
    
    # Recharger Nginx
    systemctl reload nginx
    
    success "Nginx configuré et rechargé (PHP $PHP_VERSION)"
}

# Configuration PHP-FPM
setup_php_fpm() {
    log "Configuration PHP-FPM..."
    
    # Détecter la version PHP installée
    PHP_VERSION=$(php -v | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    PHP_FPM_SERVICE="php${PHP_VERSION}-fpm"
    
    # Vérifier si PHP-FPM est installé et configuré
    if ! systemctl is-active --quiet $PHP_FPM_SERVICE; then
        log "Installation et configuration de PHP-FPM..."
        apt install -y php-fpm
        systemctl enable $PHP_FPM_SERVICE
    fi
    
    # Redémarrer PHP-FPM
    systemctl restart $PHP_FPM_SERVICE
    
    # Vérifier le statut
    if systemctl is-active --quiet $PHP_FPM_SERVICE; then
        success "PHP-FPM redémarré et actif (version $PHP_VERSION)"
    else
        error "Échec du démarrage de PHP-FPM"
    fi
}

# Tests de déploiement
run_tests() {
    log "Exécution des tests..."
    
    cd "$PROJECT_DIR/backend"
    
    # Tests unitaires
    if [ "$ENVIRONMENT" != "production" ]; then
        php bin/phpunit --testdox
        success "Tests unitaires passés"
    else
        warning "Tests unitaires ignorés en production"
    fi
    
    # Test de santé de l'API
    sleep 5  # Attendre que les services redémarrent
    
    if curl -f -s "http://localhost/api/health" > /dev/null; then
        success "Test de santé API réussi"
    else
        error "Test de santé API échoué"
    fi
}

# Nettoyage
cleanup() {
    log "Nettoyage..."
    
    # Nettoyer les caches Symfony
    cd "$PROJECT_DIR/backend"
    if [ -f "bin/console" ]; then
        sudo -u www-data php bin/console cache:clear --env=prod --no-debug 2>/dev/null || true
    fi
    
    # Nettoyer les logs anciens
    find /var/log -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    success "Nettoyage terminé"
}

# Fonction principale
main() {
    if [[ "$FIX_REPOS_ONLY" == "true" ]]; then
        log "Correction des dépôts Ubuntu uniquement..."
        fix_ubuntu_repos
        update_system
        success "Correction des dépôts terminée !"
        log "Vous pouvez maintenant exécuter le déploiement complet avec: ./deploy.sh $ENVIRONMENT"
    else
        log "Début du déploiement DLPZ Shortener (environnement: $ENVIRONMENT)"
        
        # Correction des dépôts Ubuntu en premier
        fix_ubuntu_repos
        update_system
        
        check_prerequisites
        create_directories
        backup_current
        check_code
        install_backend_deps
        install_frontend_deps
        setup_environment
        build_frontend
        setup_permissions
        setup_nginx
        setup_php_fpm
        run_tests
        cleanup
        
        success "Déploiement terminé avec succès !"
        log "Application disponible sur: https://dlpz.fr"
    fi
}

# Gestion des erreurs
trap 'error "Déploiement interrompu par une erreur"' ERR

# Exécution
main "$@"