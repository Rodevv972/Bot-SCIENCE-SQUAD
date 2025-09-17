require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');
const logger = require('./utils/logger');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        logger.info(`Loaded command: ${command.data.name}`);
    } else {
        logger.warn(`Command at ${filePath} is missing required "data" or "execute" property`);
    }
}

const rest = new REST().setToken(config.discord.token);

(async () => {
    try {
        logger.info(`Started refreshing ${commands.length} application (/) commands`);

        let data;
        if (config.discord.guildId) {
            // Deploy to specific guild (faster for development)
            data = await rest.put(
                Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
                { body: commands },
            );
            logger.info(`Successfully reloaded ${data.length} guild application (/) commands`);
        } else {
            // Deploy globally (takes up to 1 hour to propagate)
            data = await rest.put(
                Routes.applicationCommands(config.discord.clientId),
                { body: commands },
            );
            logger.info(`Successfully reloaded ${data.length} global application (/) commands`);
        }

    } catch (error) {
        logger.error('Error deploying commands', { error: error.message });
        console.error(error);
    }
})();