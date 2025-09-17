const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const RocketService = require('../services/rocketService');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fusees')
        .setDescription('Afficher les prochains lancements de fusées')
        .addIntegerOption(option =>
            option.setName('nombre')
                .setDescription('Nombre de lancements à afficher (1-10)')
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false)),

    async execute(interaction) {
        const limit = interaction.options.getInteger('nombre') ?? 5;

        await interaction.deferReply();

        try {
            const rocketService = new RocketService();
            const launches = await rocketService.getUpcomingLaunches(limit);

            if (launches.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle('🚀 Aucun lancement prévu')
                    .setDescription('Aucun lancement de fusée n\'est actuellement programmé.')
                    .setColor(0xFFA500)
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            const embeds = [];

            // Embed principal avec la liste
            const mainEmbed = new EmbedBuilder()
                .setTitle(`🚀 Prochains Lancements de Fusées`)
                .setDescription(`Voici les ${launches.length} prochains lancements programmés :`)
                .setColor(0x0099FF)
                .setTimestamp();

            embeds.push(mainEmbed);

            // Créer un embed pour chaque lancement
            launches.forEach((launch, index) => {
                const launchDate = new Date(launch.date);
                const relativeTime = launchDate > new Date() ? 
                    `<t:${Math.floor(launchDate.getTime() / 1000)}:R>` : 
                    'Passé';

                const embed = new EmbedBuilder()
                    .setTitle(`${index + 1}. ${launch.name}`)
                    .addFields(
                        { name: '📅 Date', value: `<t:${Math.floor(launchDate.getTime() / 1000)}:F>\n${relativeTime}`, inline: true },
                        { name: '🏢 Agence', value: launch.agency, inline: true },
                        { name: '📍 Lieu', value: launch.location, inline: true },
                        { name: '📋 Mission', value: launch.mission.length > 200 ? launch.mission.substring(0, 200) + '...' : launch.mission, inline: false },
                        { name: '🎯 Statut', value: launch.status, inline: true }
                    )
                    .setColor(this.getStatusColor(launch.status));

                if (launch.image) {
                    embed.setThumbnail(launch.image);
                }

                if (launch.url) {
                    embed.addFields({ name: '🔗 Plus d\'infos', value: `[Voir les détails](${launch.url})`, inline: true });
                }

                embeds.push(embed);
            });

            // Embed d'information
            const infoEmbed = new EmbedBuilder()
                .setTitle('ℹ️ Informations')
                .setDescription('Les données proviennent de [The Space Devs API](https://thespacedevs.com/)\n\nLes heures sont données en UTC et peuvent changer.')
                .setColor(0x666666)
                .setFooter({ text: 'Données mises à jour en temps réel' });

            embeds.push(infoEmbed);

            await interaction.editReply({ embeds });

            logger.command('fusees', interaction.user.id, interaction.guild.id, true, {
                launchesCount: launches.length,
                limit
            });

        } catch (error) {
            logger.error('Fusees command error', { error: error.message });
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur de récupération')
                .setDescription(`Une erreur s'est produite lors de la récupération des lancements :\n\`\`\`${error.message}\`\`\``)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },

    getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case 'go':
            case 'confirmed':
                return 0x00FF00; // Vert
            case 'to be determined':
            case 'tbd':
                return 0xFFA500; // Orange
            case 'go for launch':
                return 0x00AAFF; // Bleu
            case 'to be confirmed':
            case 'tbc':
                return 0xFFAA00; // Jaune
            default:
                return 0x666666; // Gris
        }
    }
};