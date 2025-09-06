# Guide de déploiement pour dlpz.fr

Ce guide explique comment déployer l'application dlpz.fr (raccourcisseur d'URL et upload de fichiers) sur un serveur de production.

## 📋 Prérequis

### Serveur

- **OS** : Ubuntu 20.04+ ou Debian 11+
- **RAM** : Minimum 2GB (recommandé 4GB+)
- **Stockage** : Minimum 20GB (recommandé 50GB+)
- **CPU** : 2 cœurs minimum

### Logiciels requis

- **Node.js** 18+ avec npm
- **Nginx** 1.18+
- **Certificats SSL** (Let's Encrypt)
- **Git** pour le déploiement
- **Systemd** pour la gestion des services

## 🚀 Installation initiale

### 1. Préparation du serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation des dépendances
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Installation de Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Vérification des versions
node --version  # Doit être 18+
npm --version
nginx -v
```

### 2. Configuration du domaine

```bash
# Vérifier que le domaine pointe vers le serveur
nslookup dlpz.fr
ping dlpz.fr

# Obtenir les certificats SSL
sudo certbot --nginx -d dlpz.fr -d www.dlpz.fr
```

### 3. Configuration de base

```bash
# Créer l'utilisateur pour l'application
sudo useradd -r -s /bin/false dlpz

# Créer la structure de répertoires
sudo mkdir -p /var/www/dlpz/{frontend,backend,logs,backups,uploads,data}
sudo chown -R dlpz:dlpz /var/www/dlpz
sudo chmod -R 755 /var/www/dlpz
```

## 📦 Déploiement

### Option 1 : Déploiement automatique (Recommandé)

```bash
# Cloner le projet
git clone https://github.com/votre-repo/dlpz.git /tmp/dlpz
cd /tmp/dlpz

# Rendre le script exécutable
chmod +x deploy.sh

# Exécuter le déploiement
sudo ./deploy.sh production
```

### Option 2 : Déploiement manuel

#### 1. Déployer le frontend

```bash
# Aller dans le répertoire frontend
cd /var/www/dlpz/frontend

# Copier les fichiers du projet
cp -r /tmp/dlpz/* .

# Installer les dépendances
npm ci

# Build de production
npm run build

# Copier les fichiers buildés
sudo cp -r dist/* /var/www/dlpz/frontend/app/dist/
sudo chown -R www-data:www-data /var/www/dlpz/frontend
```

#### 2. Déployer le backend

```bash
# Aller dans le répertoire backend
cd /var/www/dlpz/backend

# Copier les fichiers du projet
cp -r /tmp/dlpz/backend/* .

# Installer les dépendances
npm ci --production

# Créer les répertoires nécessaires
mkdir -p uploads data logs

# Permissions
sudo chown -R www-data:www-data /var/www/dlpz/backend
sudo chmod -R 755 /var/www/dlpz/backend
```

#### 3. Configuration nginx

```bash
# Copier la configuration nginx
sudo cp /tmp/dlpz/nginx/dlpz.fr.conf /etc/nginx/sites-available/dlpz.fr

# Activer le site
sudo ln -sf /etc/nginx/sites-available/dlpz.fr /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger nginx
sudo systemctl reload nginx
```

#### 4. Service systemd

```bash
# Le service systemd est créé automatiquement par le script deploy.sh
# Vérifier qu'il est actif
sudo systemctl status dlpz-backend
sudo systemctl enable dlpz-backend
sudo systemctl start dlpz-backend
```

## 🔧 Configuration

### Variables d'environnement

#### Backend (`/var/www/dlpz/backend/env.production`)

```bash
NODE_ENV=production
PORT=3002
FRONTEND_URL=https://dlpz.fr
API_URL=https://dlpz.fr/api
UPLOAD_DIR=/var/www/dlpz/backend/uploads
DATA_DIR=/var/www/dlpz/backend/data
LOG_DIR=/var/www/dlpz/logs
CORS_ORIGIN=https://dlpz.fr
TRUST_PROXY=true
```

#### Frontend (`/var/www/dlpz/frontend/env.production`)

```bash
VITE_API_URL=https://dlpz.fr
VITE_NODE_ENV=production
VITE_BASE_URL=https://dlpz.fr
```

### Configuration nginx

La configuration nginx est optimisée pour :

- **SSL/TLS** : Configuration moderne et sécurisée
- **Compression** : Gzip activé pour tous les assets
- **Cache** : Cache intelligent pour les fichiers statiques
- **Sécurité** : Headers de sécurité et protection contre les attaques
- **Rate limiting** : Limitation de débit pour l'API et les uploads

## 🛠️ Gestion des services

### Script de gestion

```bash
# Rendre le script exécutable
chmod +x scripts/manage-service.sh

# Commandes disponibles
sudo ./scripts/manage-service.sh start      # Démarrer le service
sudo ./scripts/manage-service.sh stop       # Arrêter le service
sudo ./scripts/manage-service.sh restart    # Redémarrer le service
sudo ./scripts/manage-service.sh status     # Statut du service
sudo ./scripts/manage-service.sh logs       # Voir les logs
sudo ./scripts/manage-service.sh logs -f    # Suivre les logs en temps réel
sudo ./scripts/manage-service.sh health     # Vérifier la santé de l'API
sudo ./scripts/manage-service.sh backup     # Créer une sauvegarde
sudo ./scripts/manage-service.sh update     # Mettre à jour le service
```

### Commandes systemd directes

```bash
# Gestion du service
sudo systemctl start dlpz-backend
sudo systemctl stop dlpz-backend
sudo systemctl restart dlpz-backend
sudo systemctl status dlpz-backend

# Logs
sudo journalctl -u dlpz-backend -f
sudo journalctl -u dlpz-backend --since "1 hour ago"

# Activation/désactivation au démarrage
sudo systemctl enable dlpz-backend
sudo systemctl disable dlpz-backend
```

## 💾 Sauvegardes

### Sauvegarde automatique

```bash
# Rendre le script exécutable
chmod +x scripts/backup.sh

# Types de sauvegarde
sudo ./scripts/backup.sh daily      # Sauvegarde des données (quotidienne)
sudo ./scripts/backup.sh weekly     # Sauvegarde complète (hebdomadaire)
sudo ./scripts/backup.sh monthly    # Sauvegarde complète + config (mensuelle)

# Gestion des sauvegardes
sudo ./scripts/backup.sh stats      # Statistiques des sauvegardes
sudo ./scripts/backup.sh verify     # Vérifier l'intégrité
sudo ./scripts/backup.sh cleanup    # Nettoyer les anciennes sauvegardes
```

### Cron pour les sauvegardes automatiques

```bash
# Éditer le crontab
sudo crontab -e

# Ajouter ces lignes :
# Sauvegarde quotidienne à 2h du matin
0 2 * * * /var/www/dlpz/scripts/backup.sh daily >> /var/www/dlpz/logs/backup.log 2>&1

# Sauvegarde hebdomadaire le dimanche à 3h
0 3 * * 0 /var/www/dlpz/scripts/backup.sh weekly >> /var/www/dlpz/logs/backup.log 2>&1

# Sauvegarde mensuelle le 1er à 4h
0 4 1 * * /var/www/dlpz/scripts/backup.sh monthly >> /var/www/dlpz/logs/backup.log 2>&1
```

## 🔍 Monitoring et logs

### Logs de l'application

```bash
# Logs du backend
sudo journalctl -u dlpz-backend -f

# Logs nginx
sudo tail -f /var/log/nginx/dlpz.fr.access.log
sudo tail -f /var/log/nginx/dlpz.fr.error.log

# Logs de sauvegarde
sudo tail -f /var/www/dlpz/logs/backup.log
```

### Vérification de la santé

```bash
# Test de l'API
curl -f https://dlpz.fr/api/health

# Test du frontend
curl -f https://dlpz.fr/

# Vérification SSL
openssl s_client -connect dlpz.fr:443 -servername dlpz.fr
```

### Monitoring des ressources

```bash
# Utilisation CPU et mémoire
htop

# Espace disque
df -h

# Utilisation des ports
sudo netstat -tlnp | grep :3002
sudo netstat -tlnp | grep :443
```

## 🔒 Sécurité

### Configuration de sécurité

L'application est configurée avec :

- **HTTPS** obligatoire avec certificats SSL
- **Headers de sécurité** (HSTS, CSP, X-Frame-Options, etc.)
- **Rate limiting** pour l'API et les uploads
- **Validation des fichiers** uploadés
- **Sanitisation des entrées** utilisateur
- **Protection contre les attaques** courantes

### Mise à jour de sécurité

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Mise à jour des certificats SSL
sudo certbot renew --dry-run

# Mise à jour de l'application
cd /var/www/dlpz
git pull origin main
sudo ./scripts/manage-service.sh update
```

## 🚨 Dépannage

### Problèmes courants

#### 1. Service backend ne démarre pas

```bash
# Vérifier les logs
sudo journalctl -u dlpz-backend -n 50

# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/dlpz/backend

# Vérifier la configuration
sudo ./scripts/manage-service.sh health
```

#### 2. Erreurs nginx

```bash
# Tester la configuration
sudo nginx -t

# Vérifier les logs
sudo tail -f /var/log/nginx/error.log

# Recharger la configuration
sudo systemctl reload nginx
```

#### 3. Problèmes de certificats SSL

```bash
# Renouveler les certificats
sudo certbot renew

# Vérifier les certificats
sudo certbot certificates
```

#### 4. Problèmes de permissions

```bash
# Corriger les permissions
sudo chown -R www-data:www-data /var/www/dlpz
sudo chmod -R 755 /var/www/dlpz
sudo chmod -R 644 /var/www/dlpz/backend/uploads
```

### Logs utiles

```bash
# Logs système
sudo journalctl -xe

# Logs nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs de l'application
sudo tail -f /var/www/dlpz/logs/backend.log
sudo tail -f /var/www/dlpz/logs/backend-error.log
```

## 📈 Optimisation

### Performance

- **Cache nginx** : Configuration optimisée pour les assets statiques
- **Compression gzip** : Activée pour tous les contenus textuels
- **Rate limiting** : Protection contre les abus
- **Headers de cache** : Optimisation du cache navigateur

### Monitoring

- **Logs structurés** : Format JSON pour l'analyse
- **Métriques de santé** : Endpoint `/api/health`
- **Sauvegardes automatiques** : Protection des données
- **Alertes système** : Monitoring des ressources

## 🔄 Mise à jour

### Processus de mise à jour

```bash
# 1. Sauvegarde
sudo ./scripts/backup.sh daily

# 2. Mise à jour du code
cd /var/www/dlpz
git pull origin main

# 3. Mise à jour des dépendances
cd frontend && npm ci
cd ../backend && npm ci --production

# 4. Rebuild du frontend
cd ../frontend && npm run build
sudo cp -r dist/* /var/www/dlpz/frontend/app/dist/

# 5. Redémarrage des services
sudo ./scripts/manage-service.sh restart
sudo systemctl reload nginx

# 6. Vérification
sudo ./scripts/manage-service.sh health
```

## 📞 Support

En cas de problème :

1. **Vérifier les logs** : `sudo ./scripts/manage-service.sh logs`
2. **Vérifier la santé** : `sudo ./scripts/manage-service.sh health`
3. **Vérifier nginx** : `sudo nginx -t`
4. **Consulter la documentation** : Ce fichier et les README
5. **Créer une issue** : Sur le repository GitHub

---

**Note** : Ce guide est conçu pour un déploiement de production. Adaptez les configurations selon vos besoins spécifiques.
