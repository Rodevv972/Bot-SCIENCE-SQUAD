# Guide de Déploiement - Bot Science Squad

## 🚀 Déploiement rapide

### Option 1: Script automatique (Ubuntu Server)
```bash
wget https://raw.githubusercontent.com/Rodevv972/Bot-SCIENCE-SQUAD/main/install.sh
chmod +x install.sh
sudo ./install.sh
```

### Option 2: Installation manuelle

#### 1. Prérequis
```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installation de PM2
sudo npm install -g pm2
```

#### 2. Installation du bot
```bash
# Clonage
git clone https://github.com/Rodevv972/Bot-SCIENCE-SQUAD.git
cd Bot-SCIENCE-SQUAD

# Installation des dépendances
npm install

# Configuration
cp .env.example .env
nano .env  # Configurez vos tokens
```

#### 3. Configuration Discord

##### Création du bot Discord
1. Allez sur https://discord.com/developers/applications
2. Créez une nouvelle application
3. Dans "Bot", créez un bot et copiez le token
4. Dans "OAuth2 > URL Generator" :
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`, `Read Message History`

##### Obtention des IDs
```javascript
// Mode développeur Discord requis
Guild ID: Clic droit serveur > "Copier l'ID"
Channel ID: Clic droit #articles > "Copier l'ID"  
Role ID: Clic droit rôle modérateur > "Copier l'ID"
```

#### 4. Configuration des APIs

##### Perplexity AI
1. Inscription sur https://www.perplexity.ai/
2. Récupération de la clé API dans les paramètres

##### OpenAI
1. Inscription sur https://platform.openai.com/
2. Création d'une clé API
3. Vérification des crédits disponibles

#### 5. Fichier .env complet
```env
# Discord
DISCORD_TOKEN=NzU4MTM2NjAwNzg4MzY4NDE0.GBGp_8.example
DISCORD_CLIENT_ID=758136600788368414
DISCORD_GUILD_ID=758136600788368415

# Channels
ARTICLES_CHANNEL_ID=758136600788368416

# APIs
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Roles
MODERATOR_ROLE_ID=758136600788368417

# Configuration
TIMEZONE=Europe/Paris
PAPER_POST_TIME=9

# Optionnel
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/science-bot
NODE_ENV=production
```

#### 6. Déploiement et démarrage
```bash
# Déployer les commandes
npm run deploy-commands

# Test local
npm start

# Ou avec PM2 (production)
pm2 start src/index.js --name science-bot
pm2 save
pm2 startup
```

## 🔧 Service systemd (Production)

### Création du service
```bash
sudo tee /etc/systemd/system/sciencebot.service > /dev/null << EOF
[Unit]
Description=Science Squad Discord Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Bot-SCIENCE-SQUAD
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF
```

### Gestion du service
```bash
# Activer et démarrer
sudo systemctl daemon-reload
sudo systemctl enable sciencebot
sudo systemctl start sciencebot

# Vérifier le statut
sudo systemctl status sciencebot

# Voir les logs
sudo journalctl -u sciencebot -f

# Redémarrer
sudo systemctl restart sciencebot
```

## 📊 Monitoring

### Logs du bot
```bash
# Logs en temps réel
tail -f logs/$(date +%Y-%m-%d).log

# Recherche d'erreurs
grep "ERROR" logs/*.log

# Statistiques des commandes
grep "COMMAND" logs/*.log | wc -l
```

### Monitoring système
```bash
# Utilisation ressources
htop
iostat 1

# Espace disque
df -h
du -sh logs/

# Processus du bot
ps aux | grep node
```

## 🔄 Maintenance

### Mise à jour du bot
```bash
cd Bot-SCIENCE-SQUAD
git pull origin main
npm install
npm run deploy-commands
sudo systemctl restart sciencebot
```

### Sauvegarde
```bash
# Script de sauvegarde
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "backup_sciencebot_$DATE.tar.gz" \
    data/ logs/ .env

# Crontab pour sauvegarde automatique
0 2 * * * /path/to/backup_script.sh
```

### Rotation des logs
```bash
# Configuration logrotate
sudo tee /etc/logrotate.d/sciencebot << EOF
/home/ubuntu/Bot-SCIENCE-SQUAD/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF
```

## 🐛 Dépannage

### Problèmes courants

#### Bot ne démarre pas
```bash
# Vérifier la configuration
node -e "console.log(require('./src/config/config.js'))"

# Tester la connexion Discord
node -e "
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.login('VOTRE_TOKEN').then(() => console.log('✅ Token valide'));
"
```

#### Commandes non reconnues
```bash
# Redéployer les commandes
npm run deploy-commands

# Vérifier les permissions bot
# Bot doit avoir permission "Use Slash Commands"
```

#### Erreurs API
```bash
# Tester Perplexity
curl -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
     https://api.perplexity.ai/chat/completions

# Tester OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

#### Problèmes de permissions
```bash
# Vérifier les rôles Discord
# Le bot doit avoir les permissions nécessaires
# Les modérateurs doivent avoir le rôle configuré
```

### Logs d'erreur typiques

#### Token invalide
```
Error: Used disallowed intents
```
**Solution**: Vérifier le token et les intents dans le Developer Portal

#### Permissions insuffisantes
```
DiscordAPIError: Missing Permissions
```
**Solution**: Vérifier les permissions du bot sur le serveur

#### API Rate Limit
```
Too Many Requests
```
**Solution**: Attendre et éventuellement réduire la fréquence des appels

## 🔒 Sécurité

### Bonnes pratiques
```bash
# Permissions fichiers
chmod 600 .env
chmod 755 install.sh

# Firewall
sudo ufw allow ssh
sudo ufw enable

# Mise à jour régulière
sudo apt update && sudo apt upgrade
npm audit fix
```

### Surveillance
```bash
# Fail2ban pour SSH
sudo apt install fail2ban

# Monitoring des logs d'erreur
grep -i "error\|warn" logs/*.log | tail -20
```

## 📈 Optimisation

### Performance
```bash
# Optimisation Node.js
export NODE_OPTIONS="--max-old-space-size=1024"

# Cache DNS
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf
```

### Scaling
```bash
# Plusieurs instances avec PM2
pm2 start ecosystem.config.js

# Load balancer (nginx)
sudo apt install nginx
# Configuration nginx pour webhook n8n
```

## 📞 Support

### Informations utiles pour le support
```bash
# Version Node.js
node --version

# Version bot
grep version package.json

# Logs récents
tail -50 logs/$(date +%Y-%m-%d).log

# Configuration (sans tokens)
grep -v "TOKEN\|KEY" .env
```

### Contacts
- GitHub Issues: https://github.com/Rodevv972/Bot-SCIENCE-SQUAD/issues
- Documentation: README.md
- Logs: `logs/` directory