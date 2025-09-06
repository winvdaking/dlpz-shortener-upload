#!/bin/bash

# Script de sauvegarde automatique pour dlpz.fr
# Usage: ./scripts/backup.sh [daily|weekly|monthly]

set -e

PROJECT_ROOT="/var/www/dlpz"
BACKUP_DIR="${PROJECT_ROOT}/backups"
LOG_FILE="${PROJECT_ROOT}/logs/backup.log"

# Configuration
BACKUP_TYPE=${1:-daily}
RETENTION_DAYS=30
MAX_BACKUPS=10

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction de logging
log() {
    local message="$1"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[${timestamp}]${NC} $message" | tee -a "$LOG_FILE"
}

log_success() {
    local message="$1"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[${timestamp}] ✅${NC} $message" | tee -a "$LOG_FILE"
}

log_warning() {
    local message="$1"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[${timestamp}] ⚠️${NC} $message" | tee -a "$LOG_FILE"
}

log_error() {
    local message="$1"
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[${timestamp}] ❌${NC} $message" | tee -a "$LOG_FILE"
}

# Créer les répertoires nécessaires
create_directories() {
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
}

# Créer une sauvegarde complète
create_full_backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="dlpz_full_${BACKUP_TYPE}_${timestamp}"
    local backup_file="${BACKUP_DIR}/${backup_name}.tar.gz"
    
    log "Création de la sauvegarde complète: $backup_name"
    
    # Créer la sauvegarde
    tar -czf "$backup_file" \
        -C "$PROJECT_ROOT" \
        --exclude="node_modules" \
        --exclude="logs" \
        --exclude="backups" \
        --exclude=".git" \
        --exclude="*.log" \
        data/ \
        backend/uploads/ \
        backend/data/ \
        backend/package.json \
        backend/package-lock.json \
        backend/server.js \
        backend/routes/ \
        backend/middleware/ \
        backend/config/ \
        backend/utils/ \
        frontend/dist/ \
        frontend/package.json \
        frontend/package-lock.json
    
    if [[ -f "$backup_file" ]]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "Sauvegarde créée: $backup_file (Taille: $size)"
        echo "$backup_file"
    else
        log_error "Échec de la création de la sauvegarde"
        return 1
    fi
}

# Créer une sauvegarde des données uniquement
create_data_backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="dlpz_data_${BACKUP_TYPE}_${timestamp}"
    local backup_file="${BACKUP_DIR}/${backup_name}.tar.gz"
    
    log "Création de la sauvegarde des données: $backup_name"
    
    # Créer la sauvegarde des données
    tar -czf "$backup_file" \
        -C "$PROJECT_ROOT" \
        data/ \
        backend/uploads/ \
        backend/data/
    
    if [[ -f "$backup_file" ]]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "Sauvegarde des données créée: $backup_file (Taille: $size)"
        echo "$backup_file"
    else
        log_error "Échec de la création de la sauvegarde des données"
        return 1
    fi
}

# Créer une sauvegarde de la configuration
create_config_backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_name="dlpz_config_${BACKUP_TYPE}_${timestamp}"
    local backup_file="${BACKUP_DIR}/${backup_name}.tar.gz"
    
    log "Création de la sauvegarde de la configuration: $backup_name"
    
    # Créer la sauvegarde de la configuration
    tar -czf "$backup_file" \
        -C "$PROJECT_ROOT" \
        backend/package.json \
        backend/package-lock.json \
        backend/server.js \
        backend/routes/ \
        backend/middleware/ \
        backend/config/ \
        backend/utils/ \
        backend/env.production \
        frontend/package.json \
        frontend/package-lock.json \
        frontend/vite.config.js \
        frontend/env.production \
        deploy.sh \
        scripts/
    
    if [[ -f "$backup_file" ]]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "Sauvegarde de la configuration créée: $backup_file (Taille: $size)"
        echo "$backup_file"
    else
        log_error "Échec de la création de la sauvegarde de la configuration"
        return 1
    fi
}

# Nettoyer les anciennes sauvegardes
cleanup_old_backups() {
    log "Nettoyage des anciennes sauvegardes..."
    
    # Supprimer les sauvegardes plus anciennes que RETENTION_DAYS
    find "$BACKUP_DIR" -name "dlpz_*_${BACKUP_TYPE}_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    # Garder seulement les MAX_BACKUPS plus récentes pour chaque type
    for backup_type in full data config; do
        local backups=($(find "$BACKUP_DIR" -name "dlpz_${backup_type}_${BACKUP_TYPE}_*.tar.gz" -type f -printf '%T@ %p\n' | sort -n | cut -d' ' -f2-))
        local count=${#backups[@]}
        
        if [[ $count -gt $MAX_BACKUPS ]]; then
            local to_delete=$((count - MAX_BACKUPS))
            for ((i=0; i<to_delete; i++)); do
                rm -f "${backups[$i]}"
                log "Suppression de l'ancienne sauvegarde: ${backups[$i]}"
            done
        fi
    done
    
    log_success "Nettoyage des anciennes sauvegardes terminé"
}

# Vérifier l'intégrité des sauvegardes
verify_backups() {
    log "Vérification de l'intégrité des sauvegardes..."
    
    local backup_files=($(find "$BACKUP_DIR" -name "dlpz_*_${BACKUP_TYPE}_*.tar.gz" -type f))
    local verified=0
    local failed=0
    
    for backup_file in "${backup_files[@]}"; do
        if tar -tzf "$backup_file" >/dev/null 2>&1; then
            ((verified++))
        else
            log_error "Sauvegarde corrompue: $backup_file"
            ((failed++))
        fi
    done
    
    log_success "Vérification terminée: $verified sauvegardes valides, $failed corrompues"
}

# Afficher les statistiques des sauvegardes
show_backup_stats() {
    log "Statistiques des sauvegardes:"
    
    local total_size=$(du -sh "$BACKUP_DIR" | cut -f1)
    local backup_count=$(find "$BACKUP_DIR" -name "dlpz_*.tar.gz" -type f | wc -l)
    
    echo "  - Nombre total de sauvegardes: $backup_count"
    echo "  - Taille totale: $total_size"
    echo "  - Répertoire: $BACKUP_DIR"
    
    # Statistiques par type
    for backup_type in full data config; do
        local type_count=$(find "$BACKUP_DIR" -name "dlpz_${backup_type}_*.tar.gz" -type f | wc -l)
        if [[ $type_count -gt 0 ]]; then
            local type_size=$(find "$BACKUP_DIR" -name "dlpz_${backup_type}_*.tar.gz" -type f -exec du -ch {} + | tail -1 | cut -f1)
            echo "  - $backup_type: $type_count sauvegardes ($type_size)"
        fi
    done
}

# Fonction principale
main() {
    log "Début de la sauvegarde $BACKUP_TYPE pour dlpz.fr"
    
    create_directories
    
    case "$BACKUP_TYPE" in
        "daily")
            create_data_backup
            ;;
        "weekly")
            create_full_backup
            ;;
        "monthly")
            create_full_backup
            create_config_backup
            ;;
        "stats")
            show_backup_stats
            exit 0
            ;;
        "verify")
            verify_backups
            exit 0
            ;;
        "cleanup")
            cleanup_old_backups
            exit 0
            ;;
        *)
            log_error "Type de sauvegarde invalide: $BACKUP_TYPE"
            echo "Types supportés: daily, weekly, monthly, stats, verify, cleanup"
            exit 1
            ;;
    esac
    
    cleanup_old_backups
    verify_backups
    show_backup_stats
    
    log_success "Sauvegarde $BACKUP_TYPE terminée avec succès"
}

# Gestion des erreurs
trap 'log_error "Erreur lors de la sauvegarde. Vérifiez les logs."; exit 1' ERR

# Exécuter le script principal
main "$@"
