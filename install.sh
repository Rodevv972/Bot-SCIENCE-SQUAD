#!/bin/bash

# Script d'installation automatique pour Ubuntu Server
# Bot Science Squad Discord

echo "🚀 Installation du Bot Science Squad"
echo "===================================="

# Vérifier si on est sur Ubuntu
if [ ! -f /etc/ubuntu-release ] && [ ! -f /etc/lsb-release ]; then
    echo "❌ Ce script est conçu pour Ubuntu Server"
    exit 1
fi

# Mise à jour du système
echo "📦 Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installation de Node.js (via NodeSource)
echo "📦 Installation de Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification des versions
echo "✅ Versions installées:"
node --version
npm --version

# Installation de PM2 pour la gestion des processus
echo "📦 Installation de PM2..."
sudo npm install -g pm2

# Création de l'utilisateur bot (optionnel)
echo "👤 Création de l'utilisateur bot..."
sudo useradd -m -s /bin/bash sciencebot || echo "Utilisateur déjà existant"

# Clone du repository (si pas déjà fait)
if [ ! -d "/home/sciencebot/Bot-SCIENCE-SQUAD" ]; then
    echo "📥 Clonage du repository..."
    sudo -u sciencebot git clone https://github.com/Rodevv972/Bot-SCIENCE-SQUAD.git /home/sciencebot/Bot-SCIENCE-SQUAD
fi

# Installation des dépendances
echo "📦 Installation des dépendances..."
cd /home/sciencebot/Bot-SCIENCE-SQUAD
sudo -u sciencebot npm install

# Copie du fichier de configuration
if [ ! -f ".env" ]; then
    echo "⚙️ Création du fichier de configuration..."
    sudo -u sciencebot cp .env.example .env
    echo "⚠️ IMPORTANT: Éditez le fichier .env avec vos tokens et clés API"
    echo "   sudo nano /home/sciencebot/Bot-SCIENCE-SQUAD/.env"
fi

# Création du service systemd
echo "🔧 Création du service systemd..."
sudo tee /etc/systemd/system/sciencebot.service > /dev/null << EOF
[Unit]
Description=Science Squad Discord Bot
After=network.target

[Service]
Type=simple
User=sciencebot
WorkingDirectory=/home/sciencebot/Bot-SCIENCE-SQUAD
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Rechargement des services systemd
sudo systemctl daemon-reload

# Configuration du firewall (optionnel)
echo "🔒 Configuration du firewall..."
sudo ufw allow ssh
sudo ufw --force enable

# Permissions des fichiers
echo "🔐 Configuration des permissions..."
sudo chown -R sciencebot:sciencebot /home/sciencebot/Bot-SCIENCE-SQUAD
sudo chmod +x /home/sciencebot/Bot-SCIENCE-SQUAD/install.sh

echo ""
echo "✅ Installation terminée!"
echo ""
echo "🔧 Prochaines étapes:"
echo "1. Éditez le fichier de configuration:"
echo "   sudo nano /home/sciencebot/Bot-SCIENCE-SQUAD/.env"
echo ""
echo "2. Déployez les commandes Discord:"
echo "   cd /home/sciencebot/Bot-SCIENCE-SQUAD && sudo -u sciencebot npm run deploy-commands"
echo ""
echo "3. Démarrez le service:"
echo "   sudo systemctl enable sciencebot"
echo "   sudo systemctl start sciencebot"
echo ""
echo "4. Vérifiez le statut:"
echo "   sudo systemctl status sciencebot"
echo ""
echo "5. Consultez les logs:"
echo "   sudo journalctl -u sciencebot -f"
echo ""
echo "📚 Documentation complète: README.md"