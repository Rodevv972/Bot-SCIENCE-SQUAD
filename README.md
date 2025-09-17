# Bot Science Squad

Bot Discord complet pour la communauté Science Squad, auto-hébergeable sur Ubuntu Server et développé avec Node.js et discord.js.

## 🚀 Fonctionnalités

### Pour tous les utilisateurs
- **`/resume <url>`** - Obtenir un résumé d'un article scientifique depuis une source fiable
- **`/sources`** - Afficher la charte des sources scientifiques autorisées
- **`/fusees [nombre]`** - Voir les prochains lancements de fusées programmés
- **`/help`** - Afficher l'aide complète

### Pour les modérateurs
- **`/qualifier <url>`** - Valider et publier un article scientifique
- **`/addsource <domaine>`** - Ajouter une nouvelle source à la charte
- **`/removesource <domaine>`** - Supprimer une source de la charte
- **`/learnsource <url>`** - Apprentissage automatique d'une nouvelle source

### Fonctionnalités automatiques
- **Paper of the Week** - Publication automatique chaque lundi à 9h dans #articles
- **Monitoring complet** - Journalisation de toutes les actions importantes
- **Validation automatique** - Vérification des sources selon la charte

## 📋 Prérequis

- Node.js 18+ 
- Ubuntu Server (recommandé)
- Compte Discord Developer avec bot créé
- Clés API (Perplexity, OpenAI)

## 🛠️ Installation

### 1. Cloner le repository
```bash
git clone https://github.com/Rodevv972/Bot-SCIENCE-SQUAD.git
cd Bot-SCIENCE-SQUAD
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration
Copiez le fichier d'exemple et configurez vos variables :
```bash
cp .env.example .env
nano .env
```

Configurez les variables suivantes dans `.env` :
```env
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_GUILD_ID=your_discord_guild_id_here

# Channel IDs
ARTICLES_CHANNEL_ID=your_articles_channel_id_here

# API Keys
PERPLEXITY_API_KEY=your_perplexity_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Role IDs
MODERATOR_ROLE_ID=your_moderator_role_id_here

# Bot Configuration
TIMEZONE=Europe/Paris
PAPER_POST_TIME=9

# Optional: n8n Webhook
N8N_WEBHOOK_URL=your_n8n_webhook_url_here
```

### 4. Déployer les commandes Discord
```bash
npm run deploy-commands
```

### 5. Démarrer le bot
```bash
npm start
```

Pour le développement avec rechargement automatique :
```bash
npm run dev
```

## 🔧 Configuration Discord

### 1. Créer le bot Discord
1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Dans la section "Bot", créez un bot et copiez le token
4. Dans "OAuth2 > URL Generator", sélectionnez :
   - Scopes: `bot`, `applications.commands`
   - Permissions: `Send Messages`, `Use Slash Commands`, `Embed Links`, `Read Message History`, `Manage Messages`

### 2. Obtenir les IDs Discord
- **Guild ID** : Activez le mode développeur Discord, clic droit sur votre serveur > "Copier l'ID"
- **Channel ID** : Clic droit sur le canal #articles > "Copier l'ID"
- **Role ID** : Clic droit sur le rôle modérateur > "Copier l'ID"

### 3. APIs externes

#### Perplexity AI
1. Inscription sur [Perplexity AI](https://www.perplexity.ai/)
2. Obtenez votre clé API dans les paramètres

#### OpenAI
1. Inscription sur [OpenAI](https://platform.openai.com/)
2. Créez une clé API dans votre dashboard
3. Assurez-vous d'avoir des crédits disponibles

## 📁 Structure du projet

```
Bot-SCIENCE-SQUAD/
├── src/
│   ├── commands/           # Commandes slash Discord
│   │   ├── help.js
│   │   ├── resume.js
│   │   ├── sources.js
│   │   ├── qualifier.js
│   │   ├── addsource.js
│   │   ├── removesource.js
│   │   ├── learnsource.js
│   │   └── fusees.js
│   ├── services/           # Services API
│   │   ├── perplexityService.js
│   │   ├── openaiService.js
│   │   ├── rocketService.js
│   │   └── paperOfTheWeekService.js
│   ├── utils/              # Utilitaires
│   │   ├── sourceManager.js
│   │   └── logger.js
│   ├── config/             # Configuration
│   │   └── config.js
│   ├── index.js            # Point d'entrée principal
│   └── deploy-commands.js  # Déploiement des commandes
├── data/                   # Données persistantes
│   └── sources.json        # Charte des sources
├── logs/                   # Fichiers de logs
├── .env.example            # Exemple de configuration
├── .env                    # Configuration (à créer)
├── .gitignore
├── package.json
└── README.md
```

## 🔄 Fonctionnement

### Paper of the Week
Chaque lundi à 9h (timezone configurée), le bot :
1. Génère une requête de recherche scientifique aléatoire
2. Utilise Perplexity AI pour trouver des articles récents
3. Valide les sources selon la charte
4. Génère un résumé via OpenAI
5. Publie automatiquement dans le canal #articles
6. Notifie n8n via webhook (optionnel)

### Validation des sources
Le bot maintient une charte dynamique de sources fiables :
- Sources par défaut : Nature, Science, PubMed, ArXiv, etc.
- Ajout/suppression par les modérateurs
- Apprentissage automatique de nouvelles sources
- Validation en temps réel des URLs

### Gestion des permissions
- Utilisateurs : résumés d'articles, consultation des sources, lancements de fusées
- Modérateurs : validation manuelle, gestion des sources, publication

## 📊 Monitoring et logs

Le bot journalise automatiquement :
- Toutes les commandes exécutées
- Erreurs et avertissements
- Publications automatiques
- Modifications de la charte des sources

Les logs sont stockés dans `logs/` avec rotation quotidienne.

## 🔌 Intégration n8n

Le bot peut notifier n8n via webhook pour :
- Publications du Paper of the Week
- Nouvelles sources ajoutées
- Erreurs critiques
- Statistiques d'usage

## 🐛 Dépannage

### Le bot ne répond pas
1. Vérifiez que le token Discord est correct
2. Assurez-vous que les permissions sont accordées
3. Consultez les logs dans `logs/`

### Erreurs API
1. Vérifiez les clés API (Perplexity, OpenAI)
2. Contrôlez les crédits disponibles
3. Vérifiez la connectivité internet

### Commandes non trouvées
1. Exécutez `npm run deploy-commands`
2. Attendez quelques minutes pour la propagation
3. Redémarrez le bot

## 🔧 Maintenance

### Mise à jour des dépendances
```bash
npm update
```

### Sauvegarde des données
Sauvegardez régulièrement :
- `data/sources.json` - Charte des sources
- `logs/` - Historique des actions
- `.env` - Configuration (sans la commiter)

### Monitoring système
Surveillez :
- Utilisation mémoire/CPU
- Espace disque pour les logs
- Statut des APIs externes
- Connectivité Discord

## 📈 Extensibilité

Le bot est conçu pour être facilement extensible :
- Ajout de nouvelles commandes dans `src/commands/`
- Nouveaux services API dans `src/services/`
- Intégrations supplémentaires via webhooks
- Base de données SQLite pour des besoins avancés

## 📄 Licence

ISC License - voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Merci de :
1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 💬 Support

Pour obtenir de l'aide :
- Ouvrez une issue sur GitHub
- Contactez les modérateurs du serveur Discord
- Consultez les logs pour plus de détails sur les erreurs
