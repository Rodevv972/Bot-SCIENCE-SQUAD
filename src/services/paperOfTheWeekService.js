const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const PerplexityService = require('./perplexityService');
const OpenAIService = require('./openaiService');
const SourceManager = require('../utils/sourceManager');
const logger = require('../utils/logger');
const config = require('../config/config');
const axios = require('axios');

class PaperOfTheWeekService {
    constructor(client) {
        this.client = client;
        this.perplexityService = new PerplexityService();
        this.openaiService = new OpenAIService();
        this.sourceManager = new SourceManager();
    }

    start() {
        // Programmer pour chaque lundi à 9h (timezone configurée)
        // Format cron: minute hour day-of-month month day-of-week
        // day-of-week: 1 = lundi
        const cronExpression = `0 ${config.bot.paperPostTime} * * 1`;
        
        logger.info('Starting Paper of the Week service', { 
            cronExpression, 
            timezone: config.bot.timezone,
            time: `${config.bot.paperPostTime}:00`
        });

        cron.schedule(cronExpression, async () => {
            await this.publishWeeklyPaper();
        }, {
            scheduled: true,
            timezone: config.bot.timezone
        });

        // Pour le test, on peut aussi déclencher manuellement
        if (config.environment === 'development') {
            logger.info('Development mode: Weekly paper can be triggered manually');
        }
    }

    async publishWeeklyPaper() {
        try {
            logger.info('Starting weekly paper publication');

            const channel = this.client.channels.cache.get(config.channels.articles);
            if (!channel) {
                logger.error('Articles channel not found', { channelId: config.channels.articles });
                return;
            }

            // Générer des sujets d'actualité scientifique
            const searchQueries = this.generateSearchQueries();
            const selectedQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];

            logger.info('Searching for weekly paper', { query: selectedQuery });

            // Rechercher des articles via Perplexity
            const searchResults = await this.perplexityService.searchArticles(selectedQuery);
            
            // Extraire les URLs et valider les sources
            const validArticles = await this.extractAndValidateArticles(searchResults);

            if (validArticles.length === 0) {
                logger.warn('No valid articles found for weekly paper');
                await this.postNoArticleMessage(channel);
                return;
            }

            // Sélectionner le meilleur article
            const selectedArticle = validArticles[0];

            // Générer le résumé
            const summary = await this.openaiService.summarizeArticle(
                `Article from ${selectedArticle.url}: ${selectedArticle.description}`,
                selectedArticle.url
            );

            const title = await this.openaiService.generateTitle(summary);

            // Créer l'embed
            const embed = new EmbedBuilder()
                .setTitle(`📄 Paper of the Week - ${title}`)
                .setDescription(summary)
                .setURL(selectedArticle.url)
                .addFields(
                    { name: '🔗 Source', value: `[Lire l'article complet](${selectedArticle.url})`, inline: true },
                    { name: '📅 Publié le', value: new Date().toLocaleDateString('fr-FR'), inline: true },
                    { name: '🤖 Sélectionné par', value: 'IA Science Squad', inline: true },
                    { name: '📊 Sujet', value: selectedQuery, inline: false }
                )
                .setColor(0x00AA55)
                .setTimestamp()
                .setFooter({ text: 'Paper of the Week • Publié automatiquement chaque lundi' });

            if (selectedArticle.thumbnail) {
                embed.setThumbnail(selectedArticle.thumbnail);
            }

            // Publier dans le canal
            await channel.send({ 
                content: '🌟 **Paper of the Week** 🌟\n*Voici l\'article scientifique de la semaine sélectionné pour vous !*',
                embeds: [embed] 
            });

            // Notifier via webhook n8n si configuré
            if (config.webhooks.n8n) {
                await this.notifyN8N({
                    type: 'weekly_paper_published',
                    title,
                    url: selectedArticle.url,
                    summary: summary.substring(0, 500),
                    timestamp: new Date().toISOString()
                });
            }

            logger.info('Weekly paper published successfully', {
                title,
                url: selectedArticle.url,
                channelId: config.channels.articles
            });

        } catch (error) {
            logger.error('Error publishing weekly paper', { error: error.message });
            
            // Essayer de poster un message d'erreur
            try {
                const channel = this.client.channels.cache.get(config.channels.articles);
                if (channel) {
                    const errorEmbed = new EmbedBuilder()
                        .setTitle('❌ Erreur Paper of the Week')
                        .setDescription('Une erreur s\'est produite lors de la publication automatique. Les modérateurs ont été notifiés.')
                        .setColor(0xFF0000)
                        .setTimestamp();

                    await channel.send({ embeds: [errorEmbed] });
                }
            } catch (postError) {
                logger.error('Failed to post error message', { error: postError.message });
            }
        }
    }

    generateSearchQueries() {
        return [
            'latest breakthrough scientific research 2024',
            'recent peer-reviewed scientific discoveries',
            'new medical research findings',
            'climate science recent studies',
            'artificial intelligence research papers',
            'space exploration recent discoveries',
            'quantum physics breakthrough research',
            'biotechnology recent developments',
            'renewable energy scientific advances',
            'neuroscience recent studies',
            'materials science innovations',
            'cancer research breakthroughs'
        ];
    }

    async extractAndValidateArticles(searchResults) {
        // Parser simple pour extraire les URLs du texte de Perplexity
        const urlRegex = /https?:\/\/[^\s\)]+/g;
        const urls = searchResults.match(urlRegex) || [];
        
        const validArticles = [];

        for (const url of urls.slice(0, 5)) { // Limiter à 5 URLs
            try {
                if (this.sourceManager.isValidSource(url)) {
                    validArticles.push({
                        url: url.replace(/[)\].,]$/, ''), // Nettoyer les caractères de fin
                        description: this.extractDescriptionFromSearch(searchResults, url),
                        thumbnail: null
                    });
                }
            } catch (error) {
                logger.warn('Failed to validate article URL', { url, error: error.message });
            }
        }

        return validArticles;
    }

    extractDescriptionFromSearch(searchText, url) {
        // Extraire le contexte autour de l'URL pour la description
        const lines = searchText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(url)) {
                // Retourner cette ligne et la précédente si disponible
                const description = i > 0 ? lines[i-1] + ' ' + lines[i] : lines[i];
                return description.replace(url, '').trim();
            }
        }
        return 'Article scientifique récent';
    }

    async postNoArticleMessage(channel) {
        const embed = new EmbedBuilder()
            .setTitle('📄 Paper of the Week')
            .setDescription('Aucun article scientifique valide n\'a pu être trouvé cette semaine avec nos sources fiables. Nous essaierons à nouveau la semaine prochaine !')
            .addFields(
                { name: '💡 Suggestion', value: 'Les modérateurs peuvent utiliser `/qualifier` pour ajouter manuellement un article intéressant.' }
            )
            .setColor(0xFFA500)
            .setTimestamp()
            .setFooter({ text: 'Paper of the Week • Prochaine tentative lundi prochain' });

        await channel.send({ embeds: [embed] });
    }

    async notifyN8N(data) {
        try {
            await axios.post(config.webhooks.n8n, data, {
                headers: { 'Content-Type': 'application/json' }
            });
            logger.info('N8N webhook notification sent', { type: data.type });
        } catch (error) {
            logger.warn('Failed to notify N8N', { error: error.message });
        }
    }

    // Méthode pour test manuel
    async triggerManual() {
        if (config.environment === 'development') {
            logger.info('Manual trigger of weekly paper publication');
            await this.publishWeeklyPaper();
        }
    }
}

module.exports = PaperOfTheWeekService;