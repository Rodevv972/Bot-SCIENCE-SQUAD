const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const OpenAIService = require('../services/openaiService');
const PerplexityService = require('../services/perplexityService');
const SourceManager = require('../utils/sourceManager');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Obtenir un résumé d\'un article scientifique')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL de l\'article à résumer')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('prive')
                .setDescription('Réponse privée (visible seulement par vous)')
                .setRequired(false)),

    async execute(interaction) {
        const url = interaction.options.getString('url');
        const isPrivate = interaction.options.getBoolean('prive') ?? false;

        await interaction.deferReply({ ephemeral: isPrivate });

        try {
            const sourceManager = new SourceManager();
            
            // Vérifier si la source est valide
            if (!sourceManager.isValidSource(url)) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Source non autorisée')
                    .setDescription(`Cette source n'est pas dans notre charte de sources fiables.\n\nUtilisez \`/sources\` pour voir les sources autorisées.`)
                    .setColor(0xFF0000)
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // Obtenir le résumé via OpenAI
            const openaiService = new OpenAIService();
            const summary = await openaiService.summarizeArticle(`Please summarize the article at: ${url}`, url);

            // Générer un titre
            const title = await openaiService.generateTitle(summary);

            // Créer l'embed de résumé
            const embed = new EmbedBuilder()
                .setTitle(`📄 ${title}`)
                .setDescription(summary)
                .setURL(url)
                .addFields(
                    { name: '🔗 Lien', value: `[Lire l'article complet](${url})` },
                    { name: '👤 Demandé par', value: interaction.user.toString(), inline: true },
                    { name: '🔒 Visibilité', value: isPrivate ? 'Privé' : 'Public', inline: true }
                )
                .setColor(0x0099FF)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

            logger.command('resume', interaction.user.id, interaction.guild.id, true, {
                url,
                private: isPrivate
            });

        } catch (error) {
            logger.error('Resume command error', { error: error.message, url });
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur de résumé')
                .setDescription(`Une erreur s'est produite lors de la génération du résumé :\n\`\`\`${error.message}\`\`\``)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};