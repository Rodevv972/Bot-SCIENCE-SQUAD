const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const PerplexityService = require('../services/perplexityService');
const SourceManager = require('../utils/sourceManager');
const logger = require('../utils/logger');
const config = require('../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('learnsource')
        .setDescription('Apprentissage automatique d\'une nouvelle source approuvée (modérateurs uniquement)')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL de l\'article pour apprendre la source')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const url = interaction.options.getString('url');

        // Vérifier les permissions
        if (!interaction.member.roles.cache.has(config.roles.moderator)) {
            return interaction.reply({
                content: '❌ Cette commande est réservée aux modérateurs.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            // Extraire le domaine de l'URL
            const urlObj = new URL(url);
            const domain = urlObj.hostname.toLowerCase();

            const sourceManager = new SourceManager();
            
            // Vérifier si la source existe déjà
            if (sourceManager.isValidSource(url)) {
                const embed = new EmbedBuilder()
                    .setTitle('ℹ️ Source déjà connue')
                    .setDescription(`Le domaine \`${domain}\` est déjà dans notre charte des sources fiables.`)
                    .setColor(0x0099FF)
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            // Valider la source via Perplexity
            const perplexityService = new PerplexityService();
            const validationResult = await perplexityService.validateAndSummarizeArticle(url);

            // Analyser la réponse pour déterminer si la source est fiable
            const isReliable = this.analyzeReliability(validationResult, domain);

            if (isReliable) {
                // Ajouter automatiquement la source
                const added = sourceManager.addSource(domain, interaction.user.id);

                if (added) {
                    const embed = new EmbedBuilder()
                        .setTitle('✅ Source apprise et ajoutée')
                        .setDescription(`Le domaine \`${domain}\` a été automatiquement validé et ajouté à la charte.`)
                        .addFields(
                            { name: '🌐 Nouveau domaine', value: domain, inline: true },
                            { name: '👤 Ajouté par', value: interaction.user.toString(), inline: true },
                            { name: '📊 Total des sources', value: sourceManager.getSourcesInfo().count.toString(), inline: true },
                            { name: '🤖 Validation IA', value: validationResult.length > 1000 ? validationResult.substring(0, 1000) + '...' : validationResult, inline: false }
                        )
                        .setColor(0x00FF00)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });

                    logger.command('learnsource', interaction.user.id, interaction.guild.id, true, {
                        url,
                        domain,
                        autoAdded: true,
                        totalSources: sourceManager.getSourcesInfo().count
                    });
                }
            } else {
                // Source non fiable
                const embed = new EmbedBuilder()
                    .setTitle('❌ Source non fiable détectée')
                    .setDescription(`Le domaine \`${domain}\` n'a pas passé les critères de validation automatique.`)
                    .addFields(
                        { name: '🔍 Analyse de l\'IA', value: validationResult.length > 1000 ? validationResult.substring(0, 1000) + '...' : validationResult, inline: false },
                        { name: '💡 Action recommandée', value: 'Vérifiez manuellement avec `/qualifier` si vous pensez que cette source devrait être acceptée.', inline: false }
                    )
                    .setColor(0xFF6600)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });

                logger.command('learnsource', interaction.user.id, interaction.guild.id, false, {
                    url,
                    domain,
                    reason: 'Source deemed unreliable by AI'
                });
            }

        } catch (error) {
            logger.error('LearnSource command error', { error: error.message, url });
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur d\'apprentissage')
                .setDescription(`Une erreur s'est produite lors de l'apprentissage de la source :\n\`\`\`${error.message}\`\`\``)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },

    analyzeReliability(validationText, domain) {
        const text = validationText.toLowerCase();
        
        // Mots-clés positifs
        const positiveKeywords = [
            'peer-reviewed', 'peer reviewed', 'scientific journal', 'academic',
            'university', 'research institution', 'scholarly', 'credible',
            'reputable', 'established', 'legitimate', 'reliable'
        ];
        
        // Mots-clés négatifs
        const negativeKeywords = [
            'blog', 'unreliable', 'questionable', 'not credible',
            'opinion', 'biased', 'unverified', 'pseudoscience'
        ];

        // Domaines académiques connus
        const academicDomains = [
            '.edu', '.ac.', 'university', 'institute', 'research'
        ];

        let score = 0;

        // Analyser les mots-clés positifs
        positiveKeywords.forEach(keyword => {
            if (text.includes(keyword)) score += 2;
        });

        // Analyser les mots-clés négatifs
        negativeKeywords.forEach(keyword => {
            if (text.includes(keyword)) score -= 3;
        });

        // Bonus pour les domaines académiques
        academicDomains.forEach(acadDomain => {
            if (domain.includes(acadDomain)) score += 3;
        });

        // Seuil de fiabilité
        return score >= 2;
    }
};