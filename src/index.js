require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');
const logger = require('./utils/logger');
const PaperOfTheWeekService = require('./services/paperOfTheWeekService');

// Vérifier la configuration
if (!config.discord.token) {
    logger.error('Discord token not found. Please check your .env file.');
    process.exit(1);
}

// Créer le client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Collection pour stocker les commandes
client.commands = new Collection();

// Charger les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        logger.info(`Loaded command: ${command.data.name}`);
    } else {
        logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
    }
}

// Événement: Bot prêt
client.once(Events.ClientReady, readyClient => {
    logger.info(`Bot ready! Logged in as ${readyClient.user.tag}`);
    
    // Définir le statut du bot
    client.user.setActivity('la science avec Science Squad', { type: ActivityType.Watching });
    
    // Démarrer le service Paper of the Week
    const paperService = new PaperOfTheWeekService(client);
    paperService.start();
    
    // Stocker le service pour un accès global si nécessaire
    client.paperService = paperService;
    
    logger.info('All services started successfully');
});

// Événement: Interaction (commandes slash)
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        logger.warn(`Unknown command: ${interaction.commandName}`);
        return;
    }

    try {
        logger.command(interaction.commandName, interaction.user.id, interaction.guild?.id || 'DM');
        await command.execute(interaction);
    } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}`, {
            error: error.message,
            user: interaction.user.id,
            guild: interaction.guild?.id
        });

        const errorMessage = {
            content: '❌ Une erreur s\'est produite lors de l\'exécution de cette commande.',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Événement: Erreur
client.on(Events.Error, error => {
    logger.error('Discord client error', { error: error.message });
});

// Événement: Avertissement
client.on(Events.Warn, warning => {
    logger.warn('Discord client warning', { warning });
});

// Événement: Debug (seulement en mode développement)
if (config.environment === 'development') {
    client.on(Events.Debug, info => {
        logger.debug('Discord client debug', { info });
    });
}

// Événement: Connexion du bot
client.on(Events.GuildCreate, guild => {
    logger.info(`Bot added to new guild: ${guild.name} (${guild.id})`);
});

// Événement: Déconnexion du bot
client.on(Events.GuildDelete, guild => {
    logger.info(`Bot removed from guild: ${guild.name} (${guild.id})`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', error => {
    logger.error('Unhandled promise rejection', { error: error.message });
});

process.on('uncaughtException', error => {
    logger.error('Uncaught exception', { error: error.message });
    process.exit(1);
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully');
    client.destroy();
    process.exit(0);
});

// Connexion du bot
client.login(config.discord.token).catch(error => {
    logger.error('Failed to login to Discord', { error: error.message });
    process.exit(1);
});

// Export pour les tests ou l'usage externe
module.exports = client;