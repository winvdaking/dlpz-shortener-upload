#!/bin/bash

# Script de gestion des services dlpz.fr
# Usage: ./scripts/manage-service.sh [start|stop|restart|status|logs|enable|disable]

set -e

SERVICE_NAME="dlpz-backend"
PROJECT_ROOT="/var/www/dlpz"
BACKEND_DIR="${PROJECT_ROOT}/backend"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Vérifier si on est root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Ce script doit être exécuté en tant que root"
        exit 1
    fi
}

# Afficher l'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commandes disponibles:"
    echo "  start     - Démarrer le service backend"
    echo "  stop      - Arrêter le service backend"
    echo "  restart   - Redémarrer le service backend"
    echo "  status    - Afficher le statut du service"
    echo "  logs      - Afficher les logs du service"
    echo "  enable    - Activer le service au démarrage"
    echo "  disable   - Désactiver le service au démarrage"
    echo "  health    - Vérifier la santé de l'API"
    echo "  backup    - Créer une sauvegarde des données"
    echo "  restore   - Restaurer une sauvegarde"
    echo "  update    - Mettre à jour le service"
    echo ""
    echo "Exemples:"
    echo "  $0 start"
    echo "  $0 logs -f"
    echo "  $0 health"
}

# Démarrer le service
start_service() {
    log "Démarrage du service ${SERVICE_NAME}..."
    systemctl start "${SERVICE_NAME}"
    sleep 2
    if systemctl is-active --quiet "${SERVICE_NAME}"; then
        log_success "Service ${SERVICE_NAME} démarré avec succès"
    else
        log_error "Échec du démarrage du service ${SERVICE_NAME}"
        systemctl status "${SERVICE_NAME}" --no-pager
        exit 1
    fi
}

# Arrêter le service
stop_service() {
    log "Arrêt du service ${SERVICE_NAME}..."
    systemctl stop "${SERVICE_NAME}"
    log_success "Service ${SERVICE_NAME} arrêté"
}

# Redémarrer le service
restart_service() {
    log "Redémarrage du service ${SERVICE_NAME}..."
    systemctl restart "${SERVICE_NAME}"
    sleep 2
    if systemctl is-active --quiet "${SERVICE_NAME}"; then
        log_success "Service ${SERVICE_NAME} redémarré avec succès"
    else
        log_error "Échec du redémarrage du service ${SERVICE_NAME}"
        systemctl status "${SERVICE_NAME}" --no-pager
        exit 1
    fi
}

# Afficher le statut
show_status() {
    log "Statut du service ${SERVICE_NAME}:"
    systemctl status "${SERVICE_NAME}" --no-pager
}

# Afficher les logs
show_logs() {
    local follow=${1:-""}
    if [[ "$follow" == "-f" ]]; then
        log "Affichage des logs en temps réel (Ctrl+C pour arrêter)..."
        journalctl -u "${SERVICE_NAME}" -f
    else
        log "Derniers logs du service ${SERVICE_NAME}:"
        journalctl -u "${SERVICE_NAME}" --no-pager -n 50
    fi
}

# Activer le service
enable_service() {
    log "Activation du service ${SERVICE_NAME} au démarrage..."
    systemctl enable "${SERVICE_NAME}"
    log_success "Service ${SERVICE_NAME} activé au démarrage"
}

# Désactiver le service
disable_service() {
    log "Désactivation du service ${SERVICE_NAME} au démarrage..."
    systemctl disable "${SERVICE_NAME}"
    log_success "Service ${SERVICE_NAME} désactivé au démarrage"
}

# Vérifier la santé de l'API
check_health() {
    log "Vérification de la santé de l'API..."
    
    # Vérifier si le service est actif
    if ! systemctl is-active --quiet "${SERVICE_NAME}"; then
        log_error "Le service ${SERVICE_NAME} n'est pas actif"
        return 1
    fi
    
    # Test de l'endpoint health
    local health_url="http://localhost:3002/api/health"
    local response=$(curl -s -w "%{http_code}" -o /dev/null "${health_url}" || echo "000")
    
    if [[ "$response" == "200" ]]; then
        log_success "API backend répond correctement (HTTP 200)"
        
        # Afficher les détails de la réponse
        local health_data=$(curl -s "${health_url}")
        echo "Détails de la santé:"
        echo "$health_data" | jq . 2>/dev/null || echo "$health_data"
    else
        log_error "API backend ne répond pas correctement (HTTP $response)"
        return 1
    fi
}

# Créer une sauvegarde
create_backup() {
    log "Création d'une sauvegarde des données..."
    
    local backup_dir="${PROJECT_ROOT}/backups"
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="${backup_dir}/dlpz_backup_${timestamp}.tar.gz"
    
    mkdir -p "${backup_dir}"
    
    # Créer la sauvegarde
    tar -czf "${backup_file}" \
        -C "${PROJECT_ROOT}" \
        --exclude="node_modules" \
        --exclude="logs" \
        --exclude="backups" \
        data/ \
        backend/uploads/ \
        backend/data/
    
    if [[ -f "${backup_file}" ]]; then
        log_success "Sauvegarde créée: ${backup_file}"
        
        # Nettoyer les anciennes sauvegardes (garder les 7 dernières)
        find "${backup_dir}" -name "dlpz_backup_*.tar.gz" -type f -mtime +7 -delete
        log "Nettoyage des anciennes sauvegardes terminé"
    else
        log_error "Échec de la création de la sauvegarde"
        return 1
    fi
}

# Restaurer une sauvegarde
restore_backup() {
    local backup_file="$1"
    
    if [[ -z "$backup_file" ]]; then
        log_error "Veuillez spécifier le fichier de sauvegarde à restaurer"
        echo "Usage: $0 restore /path/to/backup.tar.gz"
        return 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Fichier de sauvegarde non trouvé: $backup_file"
        return 1
    fi
    
    log "Restauration de la sauvegarde: $backup_file"
    
    # Arrêter le service
    systemctl stop "${SERVICE_NAME}"
    
    # Restaurer les fichiers
    tar -xzf "$backup_file" -C "${PROJECT_ROOT}"
    
    # Redémarrer le service
    systemctl start "${SERVICE_NAME}"
    
    log_success "Sauvegarde restaurée avec succès"
}

# Mettre à jour le service
update_service() {
    log "Mise à jour du service ${SERVICE_NAME}..."
    
    # Arrêter le service
    systemctl stop "${SERVICE_NAME}"
    
    # Mettre à jour les dépendances
    cd "${BACKEND_DIR}"
    npm ci --production=true
    
    # Redémarrer le service
    systemctl start "${SERVICE_NAME}"
    
    log_success "Service ${SERVICE_NAME} mis à jour avec succès"
}

# Fonction principale
main() {
    local command="$1"
    local arg="$2"
    
    case "$command" in
        "start")
            check_root
            start_service
            ;;
        "stop")
            check_root
            stop_service
            ;;
        "restart")
            check_root
            restart_service
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$arg"
            ;;
        "enable")
            check_root
            enable_service
            ;;
        "disable")
            check_root
            disable_service
            ;;
        "health")
            check_health
            ;;
        "backup")
            check_root
            create_backup
            ;;
        "restore")
            check_root
            restore_backup "$arg"
            ;;
        "update")
            check_root
            update_service
            ;;
        "help"|"-h"|"--help"|"")
            show_help
            ;;
        *)
            log_error "Commande inconnue: $command"
            show_help
            exit 1
            ;;
    esac
}

# Exécuter le script principal
main "$@"
