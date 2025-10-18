# Guide de Déploiement - DLPZ Shortener

Guide complet pour déployer DLPZ Shortener sur un VPS OVH avec Nginx et PHP-FPM.

## 🚀 Déploiement Automatique

### Prérequis

- VPS OVH avec Ubuntu 20.04+ ou Debian 11+
- Accès root ou sudo
- Domaine configuré (ex: dlpz.fr)
- DNS pointant vers votre serveur

### Déploiement en une commande

```bash
# Cloner le projet
git clone https://github.com/winvdaking/dlpz-shortener.git
cd dlpz-shortener

# Rendre le script exécutable
chmod +x deploy.sh

# Déployer en production
sudo ./deploy.sh production
```

## 🛠️ Déploiement Manuel

### 1. Préparation du Serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer les dépendances système
sudo apt install -y software-properties-common curl wget git unzip

# Installer PHP 8.1+
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.1-fpm php8.1-cli php8.1-common php8.1-mbstring \
    php8.1-xml php8.1-curl php8.1-zip php8.1-intl php8.1-bcmath

# Installer Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer

# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer Nginx
sudo apt install -y nginx

# Installer Certbot pour SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Configuration du Projet

```bash
# Créer le répertoire du projet
sudo mkdir -p /var/www/dlpz.fr
sudo chown -R $USER:www-data /var/www/dlpz.fr

# Cloner le projet
cd /var/www/dlpz.fr
git clone https://github.com/winvdaking/dlpz-shortener.git .

# Configuration backend
cd backend
composer install --no-dev --optimize-autoloader
cp env.example .env

# Configuration frontend
cd ..
npm install
npm run build
```

### 3. Configuration des Variables d'Environnement

#### Backend (.env)

```env
APP_ENV=prod
APP_SECRET=your-super-secret-key-here-change-this
BASE_URL=https://dlpz.fr
SHORT_CODE_LENGTH=6
SERVER_PORT=3002
```

#### Frontend (.env.production)

```env
VITE_API_URL=https://dlpz.fr
```

### 4. Configuration Nginx

```bash
# Copier la configuration
sudo cp nginx/dlpz.fr.conf /etc/nginx/sites-available/dlpz.fr

# Activer le site
sudo ln -s /etc/nginx/sites-available/dlpz.fr /etc/nginx/sites-enabled/

# Désactiver le site par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 5. Configuration SSL avec Let's Encrypt

```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d dlpz.fr -d www.dlpz.fr

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

### 6. Configuration des Permissions

```bash
# Propriétaire
sudo chown -R www-data:www-data /var/www/dlpz.fr

# Permissions
sudo find /var/www/dlpz.fr -type d -exec chmod 755 {} \;
sudo find /var/www/dlpz.fr -type f -exec chmod 644 {} \;

# Permissions spéciales
sudo chmod 755 /var/www/dlpz.fr/backend/bin/console
sudo chmod -R 777 /var/www/dlpz.fr/backend/var
sudo chmod -R 777 /var/www/dlpz.fr/backend/data
```

### 7. Démarrage des Services

```bash
# Redémarrer PHP-FPM
sudo systemctl restart php8.1-fpm

# Redémarrer Nginx
sudo systemctl restart nginx

# Activer les services au démarrage
sudo systemctl enable php8.1-fpm
sudo systemctl enable nginx
```

## 🔧 Configuration Avancée

### Optimisation PHP-FPM

Éditer `/etc/php/8.1/fpm/pool.d/www.conf` :

```ini
; Pool de processus
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 1000

; Limites
request_terminate_timeout = 30s
max_execution_time = 30
memory_limit = 256M
upload_max_filesize = 10M
post_max_size = 10M
```

### Optimisation Nginx

Ajouter dans `/etc/nginx/nginx.conf` :

```nginx
# Optimisations globales
worker_processes auto;
worker_connections 1024;

# Cache
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;

# Gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### Monitoring et Logs

#### Configuration des logs

```bash
# Créer les répertoires de logs
sudo mkdir -p /var/log/dlpz.fr
sudo chown www-data:www-data /var/log/dlpz.fr

# Rotation des logs
sudo tee /etc/logrotate.d/dlpz.fr << EOF
/var/log/dlpz.fr/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF
```

#### Monitoring avec htop

```bash
# Installer htop
sudo apt install htop

# Surveiller les ressources
htop
```

## 🧪 Tests de Déploiement

### Tests Automatiques

```bash
# Tests unitaires
cd /var/www/dlpz.fr/backend
php bin/phpunit

# Test de santé de l'API
curl -f https://dlpz.fr/api/health

# Test de raccourcissement
curl -X POST https://dlpz.fr/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Tests de Performance

```bash
# Test de charge avec Apache Bench
sudo apt install apache2-utils

# Test de 100 requêtes avec 10 connexions simultanées
ab -n 100 -c 10 https://dlpz.fr/api/health
```

## 🔄 Mise à Jour

### Mise à jour automatique

```bash
# Utiliser le script de déploiement
sudo ./deploy.sh production
```

### Mise à jour manuelle

```bash
# Sauvegarder
sudo cp -r /var/www/dlpz.fr /var/backups/dlpz.fr-$(date +%Y%m%d)

# Mettre à jour le code
cd /var/www/dlpz.fr
git pull origin main

# Mettre à jour les dépendances
cd backend
composer install --no-dev --optimize-autoloader

cd ..
npm ci
npm run build

# Redémarrer les services
sudo systemctl restart php8.1-fpm
sudo systemctl reload nginx
```

## 🛡️ Sécurité

### Firewall

```bash
# Installer UFW
sudo apt install ufw

# Configuration de base
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Activer le firewall
sudo ufw enable
```

### Fail2Ban

```bash
# Installer Fail2Ban
sudo apt install fail2ban

# Configuration pour Nginx
sudo tee /etc/fail2ban/jail.local << EOF
[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

# Redémarrer Fail2Ban
sudo systemctl restart fail2ban
```

### Mise à jour automatique

```bash
# Installer unattended-upgrades
sudo apt install unattended-upgrades

# Configuration
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 📊 Monitoring

### Logs à surveiller

```bash
# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs PHP-FPM
sudo tail -f /var/log/php8.1-fpm.log

# Logs de l'application
sudo tail -f /var/www/dlpz.fr/backend/var/log/prod.log
```

### Métriques système

```bash
# Utilisation disque
df -h

# Utilisation mémoire
free -h

# Processus
ps aux | grep -E "(nginx|php-fpm)"

# Connexions réseau
netstat -tulpn | grep -E "(80|443|9000)"
```

## 🚨 Dépannage

### Problèmes courants

#### 502 Bad Gateway

```bash
# Vérifier PHP-FPM
sudo systemctl status php8.1-fpm

# Vérifier les logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/php8.1-fpm.log
```

#### Erreurs de permissions

```bash
# Corriger les permissions
sudo chown -R www-data:www-data /var/www/dlpz.fr
sudo chmod -R 755 /var/www/dlpz.fr
sudo chmod -R 777 /var/www/dlpz.fr/backend/var
```

#### Problèmes SSL

```bash
# Vérifier le certificat
sudo certbot certificates

# Renouveler le certificat
sudo certbot renew --force-renewal
```

### Commandes utiles

```bash
# Redémarrer tous les services
sudo systemctl restart nginx php8.1-fpm

# Vider le cache Symfony
cd /var/www/dlpz.fr/backend
php bin/console cache:clear --env=prod

# Vérifier la configuration Nginx
sudo nginx -t

# Tester la configuration PHP
php -m | grep -E "(mbstring|xml|curl|zip)"
```

## 📞 Support

En cas de problème :

1. Vérifier les logs d'erreur
2. Consulter la documentation
3. Créer une issue sur GitHub
4. Contacter le support

---

**Note** : Ce guide est conçu pour un déploiement sur VPS OVH. Adaptez les configurations selon votre environnement.