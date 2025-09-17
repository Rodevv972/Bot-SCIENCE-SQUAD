const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const PerplexityService = require('../services/perplexityService');
const OpenAIService = require('../services/openaiService');
const SourceManager = require('../utils/sourceManager');
const logger = require('../utils/logger');
const config = require('../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qualifier')
        .setDescription('Valider et publier un article scientifique (modérateurs uniquement)')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL de l\'article à valider')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('publier')
                .setDescription('Publier automatiquement si validé')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const url = interaction.options.getString('url');
        const autoPublish = interaction.options.getBoolean('publier') ?? false;

        // Vérifier les permissions
        if (!interaction.member.roles.cache.has(config.roles.moderator)) {
            return interaction.reply({
                content: '❌ Cette commande est réservée aux modérateurs.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            const sourceManager = new SourceManager();
            const perplexityService = new PerplexityService();
            const openaiService = new OpenAIService();

            // Vérifier si la source est dans la charte
            const isValidSource = sourceManager.isValidSource(url);
            
            let validationResult;
            let summary;

            if (isValidSource) {
                // Source validée, faire le résumé directement
                validationResult = "✅ Source validée par la charte";
                summary = await openaiService.summarizeArticle(`Please summarize the article at: ${url}`);
            } else {
                // Source inconnue, valider via Perplexity
                validationResult = await perplexityService.validateAndSummarizeArticle(url);
                
                // Demander à l'utilisateur s'il veut ajouter la source
                const embed = new EmbedBuilder()
                    .setTitle('📋 Validation d\'article')
                    .setDescription(`**URL:** ${url}\n\n**Résultat de validation:**\n${validationResult}`)
                    .setColor(0xFFA500)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
                return;
            }

            // Créer l'embed de résumé
            const title = await openaiService.generateTitle(summary);
            const embed = new EmbedBuilder()
                .setTitle(`📄 ${title}`)
                .setDescription(summary)
                .setURL(url)
                .addFields(
                    { name: '🔗 Source', value: `[Lire l'article](${url})`, inline: true },
                    { name: '✅ Statut', value: validationResult, inline: true },
                    { name: '👤 Validé par', value: interaction.user.toString(), inline: true }
                )
                .setColor(0x00FF00)
                .setTimestamp();

            if (autoPublish) {
                // Publier dans le canal articles
                const articlesChannel = interaction.guild.channels.cache.get(config.channels.articles);
                if (articlesChannel) {
                    await articlesChannel.send({ embeds: [embed] });
                    embed.addFields({ name: '📢 Publication', value: 'Article publié dans #articles', inline: false });
                }
            }

            await interaction.editReply({ embeds: [embed] });

            logger.command('qualifier', interaction.user.id, interaction.guild.id, true, {
                url,
                autoPublish,
                validSource: isValidSource
            });

        } catch (error) {
            logger.error('Qualifier command error', { error: error.message, url });
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur de validation')
                .setDescription(`Une erreur s'est produite lors de la validation :\n\`\`\`${error.message}\`\`\``)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};