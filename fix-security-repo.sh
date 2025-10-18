#!/bin/bash

# Correction spécifique du dépôt security oracular
# Usage: sudo ./fix-security-repo.sh

set -e

echo "🔧 Correction du dépôt security oracular..."

# Nettoyer les caches
echo "📦 Nettoyage des caches apt..."
sudo apt clean
sudo apt autoclean
sudo rm -rf /var/lib/apt/lists/*

# Vérifier et corriger sources.list
echo "🔍 Vérification de sources.list..."
if grep -q "oracular" /etc/apt/sources.list; then
    echo "⚠️  Références oracular trouvées dans sources.list"
    sudo sed -i 's/oracular/noble/g' /etc/apt/sources.list
    echo "✅ sources.list corrigé"
else
    echo "✅ sources.list est correct"
fi

# Vérifier et supprimer les fichiers dans sources.list.d
echo "🔍 Vérification des fichiers dans sources.list.d..."
for file in /etc/apt/sources.list.d/*; do
    if [ -f "$file" ]; then
        if grep -q "oracular" "$file"; then
            echo "⚠️  Fichier problématique trouvé: $file"
            echo "Contenu:"
            cat "$file"
            echo ""
            echo "🗑️  Suppression du fichier..."
            sudo rm -f "$file"
        fi
    fi
done

# Vérifier les fichiers cachés aussi
echo "🔍 Vérification des fichiers cachés..."
for file in /etc/apt/sources.list.d/.*; do
    if [ -f "$file" ]; then
        if grep -q "oracular" "$file"; then
            echo "⚠️  Fichier caché problématique trouvé: $file"
            echo "Contenu:"
            cat "$file"
            echo ""
            echo "🗑️  Suppression du fichier..."
            sudo rm -f "$file"
        fi
    fi
done

# Lister tous les fichiers restants
echo "📋 Fichiers restants dans sources.list.d:"
ls -la /etc/apt/sources.list.d/

# Mettre à jour les listes
echo "🔄 Mise à jour des listes de paquets..."
sudo apt update

echo "✅ Correction terminée !"
echo "📋 Vous pouvez maintenant exécuter:"
echo "   sudo ./deploy.sh production"
