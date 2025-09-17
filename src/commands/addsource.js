const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const SourceManager = require('../utils/sourceManager');
const logger = require('../utils/logger');
const config = require('../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addsource')
        .setDescription('Ajouter une nouvelle source fiable à la charte (modérateurs uniquement)')
        .addStringOption(option =>
            option.setName('domaine')
                .setDescription('Domaine à ajouter (ex: nature.com)')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const domain = interaction.options.getString('domaine').toLowerCase().trim();

        // Vérifier les permissions
        if (!interaction.member.roles.cache.has(config.roles.moderator)) {
            return interaction.reply({
                content: '❌ Cette commande est réservée aux modérateurs.',
                ephemeral: true
            });
        }

        try {
            // Validation du format de domaine
            const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!domainRegex.test(domain)) {
                const embed = new EmbedBuilder()
                    .setTitle('❌ Format invalide')
                    .setDescription(`Le domaine \`${domain}\` n'est pas au bon format.\n\n**Exemples valides:**\n• nature.com\n• arxiv.org\n• pubmed.ncbi.nlm.nih.gov`)
                    .setColor(0xFF0000)
                    .setTimestamp();

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const sourceManager = new SourceManager();
            const added = sourceManager.addSource(domain, interaction.user.id);

            if (added) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ Source ajoutée')
                    .setDescription(`Le domaine \`${domain}\` a été ajouté à la charte des sources fiables.`)
                    .addFields(
                        { name: '🌐 Domaine', value: domain, inline: true },
                        { name: '👤 Ajouté par', value: interaction.user.toString(), inline: true },
                        { name: '📊 Total des sources', value: sourceManager.getSourcesInfo().count.toString(), inline: true }
                    )
                    .setColor(0x00FF00)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                logger.command('addsource', interaction.user.id, interaction.guild.id, true, {
                    domain,
                    totalSources: sourceManager.getSourcesInfo().count
                });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle('⚠️ Source déjà existante')
                    .setDescription(`Le domaine \`${domain}\` est déjà dans la charte des sources fiables.`)
                    .setColor(0xFFA500)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

        } catch (error) {
            logger.error('AddSource command error', { error: error.message, domain });
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur')
                .setDescription(`Une erreur s'est produite lors de l'ajout de la source :\n\`\`\`${error.message}\`\`\``)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};