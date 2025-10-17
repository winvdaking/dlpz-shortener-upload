# API de Raccourcissement d'URL - Symfony

Un service de raccourcissement d'URL développé avec Symfony, utilisant le stockage de données en fichiers JSON.

## 🚀 Fonctionnalités

- **Raccourcissement d'URL** : Création de codes courts uniques pour les URLs longues
- **Redirection automatique** : Redirection 301 vers l'URL originale
- **Gestion des statistiques** : Comptage des clics pour chaque URL raccourcie
- **API REST** : Interface JSON complète pour toutes les opérations
- **Stockage sans base de données** : Utilisation de fichiers JSON pour la persistance
- **Tests automatisés** : Suite de tests unitaires et fonctionnels complète

## 📋 Prérequis

- PHP 8.1 ou supérieur
- Composer
- Symfony CLI (optionnel, pour le serveur de développement)

## 🛠️ Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Installer les dépendances**
   ```bash
   composer install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```
   
   Éditez le fichier `.env.local` :
   ```env
   BASE_URL=https://votre-domaine.com
   SHORT_CODE_LENGTH=6
   APP_SECRET=votre-cle-secrete-securisee
   ```

4. **Créer le dossier de données**
   ```bash
   mkdir -p data
   chmod 755 data
   ```

## 🚀 Démarrage

### Mode développement
```bash
# Avec Symfony CLI
symfony serve

# Ou avec le serveur PHP intégré
php -S localhost:8000 -t public
```

### Mode production
```bash
# Compiler les assets
composer dump-env prod

# Configurer le serveur web (Nginx/Apache) pour pointer vers le dossier public/
```

## 📚 API Endpoints

### 1. Raccourcir une URL
```http
POST /api/shorten
Content-Type: application/json

{
  "url": "https://exemple.com/url-tres-longue"
}
```

**Réponse :**
```json
{
  "shortCode": "abc123",
  "shortUrl": "https://votre-domaine.com/abc123",
  "original": "https://exemple.com/url-tres-longue",
  "createdAt": "2024-01-01 12:00:00",
  "clicks": 0
}
```

### 2. Redirection
```http
GET /{shortCode}
```

**Réponse :** Redirection 301 vers l'URL originale

### 3. Lister toutes les URLs
```http
GET /api/urls
```

**Réponse :**
```json
[
  {
    "original": "https://exemple.com/url-tres-longue",
    "short": "abc123",
    "createdAt": "2024-01-01 12:00:00",
    "clicks": 5
  }
]
```

### 4. Supprimer une URL
```http
DELETE /api/urls/{shortCode}
```

**Réponse :**
```json
{
  "deleted": true,
  "message": "URL supprimée avec succès"
}
```

### 5. Statistiques d'une URL
```http
GET /api/urls/{shortCode}/stats
```

**Réponse :**
```json
{
  "original": "https://exemple.com/url-tres-longue",
  "short": "abc123",
  "createdAt": "2024-01-01 12:00:00",
  "clicks": 15
}
```

### 6. Vérification de santé
```http
GET /api/health
```

**Réponse :**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01 12:00:00",
  "service": "URL Shortener API"
}
```

## 🧪 Tests

### Exécuter tous les tests
```bash
php bin/phpunit
```

### Tests avec couverture
```bash
php bin/phpunit --coverage-html coverage/
```

### Tests spécifiques
```bash
# Tests unitaires
php bin/phpunit tests/Service/
php bin/phpunit tests/Repository/

# Tests fonctionnels
php bin/phpunit tests/Controller/
```

## 📁 Structure du projet

```
backend/
├── config/                 # Configuration Symfony
├── data/                   # Stockage des données JSON
│   └── urls.json          # Fichier de données des URLs
├── public/                 # Point d'entrée web
├── src/
│   ├── Controller/        # Contrôleurs API
│   ├── Entity/           # Entités métier
│   ├── Repository/       # Gestion des données
│   └── Service/          # Logique métier
├── tests/                # Tests automatisés
└── var/                  # Cache et logs Symfony
```

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `BASE_URL` | URL de base pour les raccourcis | `https://dlpz.fr` |
| `SHORT_CODE_LENGTH` | Longueur des codes courts | `6` |
| `APP_SECRET` | Clé secrète Symfony | Requis |

### Configuration du serveur web

#### Nginx
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    root /path/to/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

#### Apache
```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    DocumentRoot /path/to/backend/public
    
    <Directory /path/to/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

## 🔒 Sécurité

- Validation stricte des URLs d'entrée
- Protection contre les injections
- Gestion des erreurs sécurisée
- Limitation de la longueur des codes courts
- Vérification des protocoles (HTTP/HTTPS uniquement)

## 📊 Monitoring

### Logs
Les logs sont stockés dans `var/log/` et peuvent être configurés via `config/packages/monolog.yaml`.

### Métriques
- Nombre total d'URLs raccourcies
- Nombre de clics par URL
- Temps de réponse de l'API

## 🚀 Déploiement

### VPS OVH

1. **Préparer le serveur**
   ```bash
   sudo apt update
   sudo apt install nginx php8.3-fpm composer
   ```

2. **Déployer l'application**
   ```bash
   git clone <repository-url> /var/www/url-shortener
   cd /var/www/url-shortener/backend
   composer install --no-dev --optimize-autoloader
   ```

3. **Configurer Nginx** (voir section Configuration)

4. **Configurer PHP-FPM**
   ```bash
   sudo systemctl enable nginx php8.3-fpm
   sudo systemctl start nginx php8.3-fpm
   ```

5. **Permissions**
   ```bash
   sudo chown -R www-data:www-data /var/www/url-shortener
   sudo chmod -R 755 /var/www/url-shortener
   sudo chmod -R 777 /var/www/url-shortener/backend/data
   sudo chmod -R 777 /var/www/url-shortener/backend/var
   ```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Consulter la documentation Symfony : https://symfony.com/doc
- Vérifier les logs dans `var/log/`

## 🔄 Changelog

### v1.0.0
- API de raccourcissement d'URL complète
- Stockage en fichiers JSON
- Tests automatisés
- Documentation complète
- Support des statistiques
- Gestion des erreurs robuste
