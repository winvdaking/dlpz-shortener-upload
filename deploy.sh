#!/bin/bash

# Script de déploiement pour DLPZ Shortener
# Usage: ./deploy.sh [environment]
# Environment: dev, staging, production (défaut: production)

set -e  # Arrêter en cas d'erreur

# Configuration
ENVIRONMENT=${1:-production}
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

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier si on est root ou sudo
    if [[ $EUID -ne 0 ]]; then
        error "Ce script doit être exécuté en tant que root ou avec sudo"
    fi
    
    # Vérifier les commandes nécessaires
    for cmd in git composer npm php nginx systemctl; do
        if ! command -v $cmd &> /dev/null; then
            error "Commande manquante: $cmd"
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

# Clonage/mise à jour du code
update_code() {
    log "Mise à jour du code source..."
    
    if [ -d "$PROJECT_DIR/.git" ]; then
        # Mise à jour d'un dépôt existant
        cd "$PROJECT_DIR"
        git fetch origin
        git reset --hard origin/main
        success "Code mis à jour via Git"
    else
        # Clonage initial
        git clone https://github.com/votre-username/dlpz-shortener.git "$PROJECT_DIR"
        success "Code cloné depuis Git"
    fi
}

# Installation des dépendances backend
install_backend_deps() {
    log "Installation des dépendances backend..."
    
    cd "$PROJECT_DIR/backend"
    
    # Installation des dépendances Composer
    if [ "$ENVIRONMENT" = "production" ]; then
        composer install --no-dev --optimize-autoloader --no-interaction
    else
        composer install --no-interaction
    fi
    
    success "Dépendances backend installées"
}

# Installation des dépendances frontend
install_frontend_deps() {
    log "Installation des dépendances frontend..."
    
    cd "$PROJECT_DIR"
    
    # Installation des dépendances npm
    npm ci
    
    success "Dépendances frontend installées"
}

# Configuration des fichiers d'environnement
setup_environment() {
    log "Configuration de l'environnement..."
    
    # Backend
    if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
        cp "$PROJECT_DIR/backend/env.example" "$PROJECT_DIR/backend/.env"
        warning "Fichier .env backend créé - Veuillez le configurer"
    fi
    
    # Frontend
    if [ ! -f "$PROJECT_DIR/.env.production" ]; then
        cp "$PROJECT_DIR/env.example" "$PROJECT_DIR/.env.production"
        warning "Fichier .env.production frontend créé - Veuillez le configurer"
    fi
    
    success "Configuration d'environnement terminée"
}

# Build du frontend
build_frontend() {
    log "Build du frontend..."
    
    cd "$PROJECT_DIR"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build
    else
        npm run build
    fi
    
    success "Frontend buildé"
}

# Configuration des permissions
setup_permissions() {
    log "Configuration des permissions..."
    
    # Propriétaire
    chown -R www-data:www-data "$PROJECT_DIR"
    
    # Permissions
    find "$PROJECT_DIR" -type d -exec chmod 755 {} \;
    find "$PROJECT_DIR" -type f -exec chmod 644 {} \;
    
    # Permissions spéciales
    chmod 755 "$PROJECT_DIR/backend/bin/console"
    chmod -R 777 "$PROJECT_DIR/backend/var"
    chmod -R 777 "$PROJECT_DIR/backend/data"
    
    success "Permissions configurées"
}

# Configuration Nginx
setup_nginx() {
    log "Configuration Nginx..."
    
    # Copier la configuration
    cp "$PROJECT_DIR/nginx/dlpz.fr.conf" "/etc/nginx/sites-available/dlpz.fr"
    
    # Activer le site
    ln -sf "/etc/nginx/sites-available/dlpz.fr" "/etc/nginx/sites-enabled/"
    
    # Tester la configuration
    nginx -t
    
    # Recharger Nginx
    systemctl reload nginx
    
    success "Nginx configuré et rechargé"
}

# Configuration PHP-FPM
setup_php_fpm() {
    log "Configuration PHP-FPM..."
    
    # Redémarrer PHP-FPM
    systemctl restart php8.1-fpm
    
    success "PHP-FPM redémarré"
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
    
    # Nettoyer les caches
    cd "$PROJECT_DIR/backend"
    php bin/console cache:clear --env=prod
    
    # Nettoyer les logs anciens
    find /var/log -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    success "Nettoyage terminé"
}

# Fonction principale
main() {
    log "Début du déploiement DLPZ Shortener (environnement: $ENVIRONMENT)"
    
    check_prerequisites
    create_directories
    backup_current
    update_code
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
}

# Gestion des erreurs
trap 'error "Déploiement interrompu par une erreur"' ERR

# Exécution
main "$@"