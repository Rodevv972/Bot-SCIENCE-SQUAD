const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const SourceManager = require('../utils/sourceManager');
const logger = require('../utils/logger');
const config = require('../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removesource')
        .setDescription('Supprimer une source de la charte (modérateurs uniquement)')
        .addStringOption(option =>
            option.setName('domaine')
                .setDescription('Domaine à supprimer (ex: nature.com)')
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
            const sourceManager = new SourceManager();
            const removed = sourceManager.removeSource(domain);

            if (removed) {
                const embed = new EmbedBuilder()
                    .setTitle('✅ Source supprimée')
                    .setDescription(`Le domaine \`${domain}\` a été supprimé de la charte des sources fiables.`)
                    .addFields(
                        { name: '🌐 Domaine supprimé', value: domain, inline: true },
                        { name: '👤 Supprimé par', value: interaction.user.toString(), inline: true },
                        { name: '📊 Total des sources', value: sourceManager.getSourcesInfo().count.toString(), inline: true }
                    )
                    .setColor(0xFF6600)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                logger.command('removesource', interaction.user.id, interaction.guild.id, true, {
                    domain,
                    totalSources: sourceManager.getSourcesInfo().count
                });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle('⚠️ Source introuvable')
                    .setDescription(`Le domaine \`${domain}\` n'existe pas dans la charte des sources fiables.\n\nUtilisez \`/sources\` pour voir la liste complète.`)
                    .setColor(0xFFA500)
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
            }

        } catch (error) {
            logger.error('RemoveSource command error', { error: error.message, domain });
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur')
                .setDescription(`Une erreur s'est produite lors de la suppression de la source :\n\`\`\`${error.message}\`\`\``)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};