require('dotenv').config();

module.exports = {
    discord: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.DISCORD_CLIENT_ID,
        guildId: process.env.DISCORD_GUILD_ID,
    },
    channels: {
        articles: process.env.ARTICLES_CHANNEL_ID,
    },
    apis: {
        perplexity: process.env.PERPLEXITY_API_KEY,
        openai: process.env.OPENAI_API_KEY,
    },
    roles: {
        moderator: process.env.MODERATOR_ROLE_ID,
    },
    bot: {
        prefix: process.env.BOT_PREFIX || '!',
        timezone: process.env.TIMEZONE || 'Europe/Paris',
        paperPostTime: parseInt(process.env.PAPER_POST_TIME) || 9,
    },
    webhooks: {
        n8n: process.env.N8N_WEBHOOK_URL,
    },
    environment: process.env.NODE_ENV || 'development',
};