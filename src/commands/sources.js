const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const SourceManager = require('../utils/sourceManager');
const logger = require('../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sources')
        .setDescription('Afficher la charte des sources scientifiques fiables'),

    async execute(interaction) {
        try {
            const sourceManager = new SourceManager();
            const sourcesInfo = sourceManager.getSourcesInfo();

            // Diviser les sources en chunks pour éviter la limite de caractères
            const domains = sourcesInfo.domains;
            const chunkedDomains = [];
            const chunkSize = 20; // 20 domaines par chunk

            for (let i = 0; i < domains.length; i += chunkSize) {
                chunkedDomains.push(domains.slice(i, i + chunkSize));
            }

            const embeds = [];

            // Premier embed avec les informations générales
            const mainEmbed = new EmbedBuilder()
                .setTitle('📚 Charte des Sources Scientifiques Fiables')
                .setDescription(`Notre bot accepte uniquement les articles provenant de sources vérifiées pour garantir la qualité scientifique.`)
                .addFields(
                    { name: '📊 Statistiques', value: `**${sourcesInfo.count}** sources autorisées`, inline: true },
                    { name: '🕒 Dernière mise à jour', value: new Date(sourcesInfo.lastUpdated).toLocaleDateString('fr-FR'), inline: true }
                )
                .setColor(0x0099FF)
                .setTimestamp();

            embeds.push(mainEmbed);

            // Embeds pour les domaines
            chunkedDomains.forEach((chunk, index) => {
                const embed = new EmbedBuilder()
                    .setTitle(`📝 Sources autorisées (${index + 1}/${chunkedDomains.length})`)
                    .setDescription('```\n' + chunk.map(domain => `• ${domain}`).join('\n') + '\n```')
                    .setColor(0x00FF00)
                    .setFooter({ 
                        text: `Page ${index + 1}/${chunkedDomains.length} • Les modérateurs peuvent ajouter/supprimer des sources` 
                    });

                embeds.push(embed);
            });

            // Embed d'aide
            const helpEmbed = new EmbedBuilder()
                .setTitle('💡 Comment utiliser les sources')
                .addFields(
                    { name: '✅ Pour les utilisateurs', value: '• Utilisez `/resume <url>` avec une source autorisée\n• Les URLs doivent provenir des domaines listés ci-dessus' },
                    { name: '🛠️ Pour les modérateurs', value: '• `/addsource <domaine>` - Ajouter une nouvelle source\n• `/removesource <domaine>` - Supprimer une source\n• `/qualifier <url>` - Valider manuellement un article' }
                )
                .setColor(0xFFAA00);

            embeds.push(helpEmbed);

            await interaction.reply({ embeds });

            logger.command('sources', interaction.user.id, interaction.guild.id, true, {
                sourcesCount: sourcesInfo.count
            });

        } catch (error) {
            logger.error('Sources command error', { error: error.message });
            
            const errorEmbed = new EmbedBuilder()
                .setTitle('❌ Erreur')
                .setDescription(`Une erreur s'est produite lors de l'affichage des sources :\n\`\`\`${error.message}\`\`\``)
                .setColor(0xFF0000)
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};