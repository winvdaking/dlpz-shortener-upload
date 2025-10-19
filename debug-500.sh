#!/bin/bash

# Script de diagnostic pour l'erreur 500
# Usage: sudo ./debug-500.sh

echo "🔍 Diagnostic de l'erreur 500..."

# Vérifier les services
echo "📋 Vérification des services..."
echo "Nginx status:"
systemctl is-active nginx
echo "PHP-FPM status:"
systemctl is-active php8.3-fpm

# Vérifier les logs Nginx
echo ""
echo "📋 Logs d'erreur Nginx (dernières 10 lignes):"
tail -10 /var/log/nginx/dlpz.fr.error.log 2>/dev/null || echo "Pas de logs d'erreur Nginx"

# Vérifier les logs PHP-FPM
echo ""
echo "📋 Logs PHP-FPM (dernières 10 lignes):"
tail -10 /var/log/php8.3-fpm.log 2>/dev/null || echo "Pas de logs PHP-FPM"

# Vérifier les logs Symfony
echo ""
echo "📋 Logs Symfony (dernières 10 lignes):"
tail -10 /var/www/dlpz.fr/backend/var/log/prod.log 2>/dev/null || echo "Pas de logs Symfony"

# Vérifier la configuration .env
echo ""
echo "📋 Configuration .env backend:"
if [ -f "/var/www/dlpz.fr/backend/.env" ]; then
    echo "APP_ENV: $(grep APP_ENV /var/www/dlpz.fr/backend/.env)"
    echo "APP_DEBUG: $(grep APP_DEBUG /var/www/dlpz.fr/backend/.env)"
    echo "APP_SECRET: $(grep APP_SECRET /var/www/dlpz.fr/backend/.env | cut -c1-20)..."
else
    echo "Fichier .env backend non trouvé"
fi

# Vérifier les permissions
echo ""
echo "📋 Permissions des fichiers critiques:"
ls -la /var/www/dlpz.fr/backend/public/index.php 2>/dev/null || echo "index.php non trouvé"
ls -la /var/www/dlpz.fr/backend/.env 2>/dev/null || echo ".env non trouvé"
ls -la /var/www/dlpz.fr/dist/index.html 2>/dev/null || echo "index.html frontend non trouvé"

# Tester l'API directement
echo ""
echo "📋 Test de l'API directement:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/api/health || echo "API non accessible"

# Vérifier la configuration Nginx
echo ""
echo "📋 Configuration Nginx active:"
grep -n "fastcgi_pass" /etc/nginx/sites-available/dlpz.fr

echo ""
echo "✅ Diagnostic terminé"
