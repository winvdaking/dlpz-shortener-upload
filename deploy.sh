#!/bin/bash

# Script de déploiement pour dlpz.fr
# Usage: ./deploy.sh [production|staging]

set -e  # Arrêter en cas d'erreur

# Configuration
DEPLOY_ENV=${1:-production}
PROJECT_NAME="dlpz"
DOMAIN="dlpz.fr"
BACKEND_PORT=3002
FRONTEND_PORT=5173

# Chemins
PROJECT_ROOT="/var/www/${PROJECT_NAME}"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
BACKEND_DIR="${PROJECT_ROOT}/backend"
NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"
SYSTEMD_SERVICE="/etc/systemd/system/${PROJECT_NAME}-backend.service"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
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

# Vérifier les prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier nginx
    if ! command -v nginx &> /dev/null; then
        log_error "nginx n'est pas installé"
        exit 1
    fi
    
    # Vérifier systemctl
    if ! command -v systemctl &> /dev/null; then
        log_error "systemctl n'est pas disponible"
        exit 1
    fi
    
    log_success "Tous les prérequis sont installés"
}

# Créer la structure de répertoires
create_directories() {
    log "Création de la structure de répertoires..."
    
    mkdir -p "${PROJECT_ROOT}"
    mkdir -p "${FRONTEND_DIR}"
    mkdir -p "${BACKEND_DIR}"
    mkdir -p "${PROJECT_ROOT}/logs"
    mkdir -p "${PROJECT_ROOT}/uploads"
    mkdir -p "${PROJECT_ROOT}/data"
    
    # Permissions
    chown -R www-data:www-data "${PROJECT_ROOT}"
    chmod -R 755 "${PROJECT_ROOT}"
    
    log_success "Structure de répertoires créée"
}

# Déployer le frontend
deploy_frontend() {
    log "Déploiement du frontend..."
    
    # Aller dans le répertoire frontend
    cd "${FRONTEND_DIR}"
    
    # Installer les dépendances
    log "Installation des dépendances frontend..."
    if [ -f "package-lock.json" ]; then
        npm ci --production=false
    else
        npm install --production=false
    fi
    
    # Build de production
    log "Build de production du frontend..."
    npm run build
    
    # Vérifier que le build a réussi
    if [ ! -d "dist" ]; then
        log_error "Le build du frontend a échoué"
        exit 1
    fi
    
    # Copier les fichiers vers le répertoire de déploiement
    cp -r dist/* "${PROJECT_ROOT}/frontend/app/dist/"
    
    # Permissions
    chown -R www-data:www-data "${PROJECT_ROOT}/frontend"
    chmod -R 755 "${PROJECT_ROOT}/frontend"
    
    log_success "Frontend déployé avec succès"
}

# Déployer le backend
deploy_backend() {
    log "Déploiement du backend..."
    
    # Aller dans le répertoire backend
    cd "${BACKEND_DIR}"
    
    # Installer les dépendances
    log "Installation des dépendances backend..."
    if [ -f "package-lock.json" ]; then
        npm ci --production=true
    else
        npm install --production=true
    fi
    
    # Créer les répertoires nécessaires
    mkdir -p uploads
    mkdir -p data
    mkdir -p logs
    
    # Permissions
    chown -R www-data:www-data "${BACKEND_DIR}"
    chmod -R 755 "${BACKEND_DIR}"
    
    log_success "Backend déployé avec succès"
}

# Créer le service systemd
create_systemd_service() {
    log "Création du service systemd..."
    
    cat > "${SYSTEMD_SERVICE}" << EOF
[Unit]
Description=dlpz.fr Backend Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=${BACKEND_DIR}
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=${BACKEND_PORT}
Environment=FRONTEND_URL=https://${DOMAIN}
Environment=UPLOAD_DIR=${BACKEND_DIR}/uploads
Environment=DATA_DIR=${BACKEND_DIR}/data

# Logs
StandardOutput=append:${PROJECT_ROOT}/logs/backend.log
StandardError=append:${PROJECT_ROOT}/logs/backend-error.log

# Sécurité
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=${BACKEND_DIR}

[Install]
WantedBy=multi-user.target
EOF

    # Recharger systemd et activer le service
    systemctl daemon-reload
    systemctl enable "${PROJECT_NAME}-backend"
    
    log_success "Service systemd créé et activé"
}

# Configurer nginx
configure_nginx() {
    log "Configuration de nginx..."
    
    # Créer la configuration nginx
    cat > "${NGINX_CONFIG}" << EOF
# dlpz.fr
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    limit_req zone=general burst=10 nodelay;
    client_max_body_size 15M;

    # Frontend
    location / {
        root ${PROJECT_ROOT}/frontend/app/dist;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
        
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # API Backend
    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Fichiers uploadés
    location /uploads/ {
        alias ${BACKEND_DIR}/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "UPLOAD";
        
        # Sécurité pour les uploads
        location ~* \.(php|phtml|php3|php4|php5|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # Types MIME pour les fichiers modernes
    location ~* \.jsx$ {
        root ${PROJECT_ROOT}/frontend/app/dist;
        add_header Content-Type "application/javascript";
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location ~* \.tsx$ {
        root ${PROJECT_ROOT}/frontend/app/dist;
        add_header Content-Type "application/javascript";
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location ~* \.ts$ {
        root ${PROJECT_ROOT}/frontend/app/dist;
        add_header Content-Type "application/javascript";
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root ${PROJECT_ROOT}/frontend/app/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "STATIC";
    }

    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

    # Activer le site
    ln -sf "${NGINX_CONFIG}" "/etc/nginx/sites-enabled/${DOMAIN}"
    
    # Tester la configuration nginx
    nginx -t
    
    log_success "Configuration nginx créée et testée"
}

# Démarrer les services
start_services() {
    log "Démarrage des services..."
    
    # Démarrer le backend
    systemctl start "${PROJECT_NAME}-backend"
    systemctl status "${PROJECT_NAME}-backend" --no-pager
    
    # Recharger nginx
    systemctl reload nginx
    
    log_success "Services démarrés avec succès"
}

# Vérifier le déploiement
verify_deployment() {
    log "Vérification du déploiement..."
    
    # Vérifier le backend
    if systemctl is-active --quiet "${PROJECT_NAME}-backend"; then
        log_success "Backend est actif"
    else
        log_error "Backend n'est pas actif"
        return 1
    fi
    
    # Vérifier nginx
    if systemctl is-active --quiet nginx; then
        log_success "Nginx est actif"
    else
        log_error "Nginx n'est pas actif"
        return 1
    fi
    
    # Test de l'API
    sleep 5
    if curl -f -s "http://localhost:${BACKEND_PORT}/api/health" > /dev/null; then
        log_success "API backend répond correctement"
    else
        log_warning "API backend ne répond pas (peut être normal si pas encore démarré)"
    fi
    
    log_success "Vérification du déploiement terminée"
}

# Fonction principale
main() {
    log "🚀 Début du déploiement de ${PROJECT_NAME} en mode ${DEPLOY_ENV}"
    
    check_root
    check_prerequisites
    create_directories
    deploy_frontend
    deploy_backend
    create_systemd_service
    configure_nginx
    start_services
    verify_deployment
    
    log_success "🎉 Déploiement terminé avec succès !"
    log "📱 Frontend: https://${DOMAIN}"
    log "🔧 Backend: https://${DOMAIN}/api"
    log "🔍 Health Check: https://${DOMAIN}/api/health"
    log ""
    log "📋 Commandes utiles:"
    log "  - Voir les logs backend: journalctl -u ${PROJECT_NAME}-backend -f"
    log "  - Redémarrer backend: systemctl restart ${PROJECT_NAME}-backend"
    log "  - Voir les logs nginx: tail -f /var/log/nginx/error.log"
    log "  - Tester nginx: nginx -t"
}

# Gestion des erreurs
trap 'log_error "Erreur lors du déploiement. Vérifiez les logs."; exit 1' ERR

# Exécuter le script principal
main "$@"
