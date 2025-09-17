const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Afficher l\'aide et la liste des commandes disponibles'),

    async execute(interaction) {
        const embeds = [];

        // Embed principal
        const mainEmbed = new EmbedBuilder()
            .setTitle('🤖 Bot Science Squad - Aide')
            .setDescription('Bienvenue ! Je suis votre assistant scientifique pour la communauté Science Squad.')
            .setColor(0x0099FF)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

        embeds.push(mainEmbed);

        // Commandes pour tous les utilisateurs
        const userEmbed = new EmbedBuilder()
            .setTitle('👥 Commandes pour tous les utilisateurs')
            .addFields(
                {
                    name: '📄 `/resume <url> [privé]`',
                    value: 'Obtenir un résumé d\'un article scientifique depuis une source fiable.\n• `url` : Lien vers l\'article\n• `privé` : Réponse visible seulement par vous (optionnel)',
                    inline: false
                },
                {
                    name: '📚 `/sources`',
                    value: 'Afficher la charte des sources scientifiques fiables acceptées par le bot.',
                    inline: false
                },
                {
                    name: '🚀 `/fusees [nombre]`',
                    value: 'Voir les prochains lancements de fusées programmés.\n• `nombre` : Nombre de lancements à afficher (1-10, défaut: 5)',
                    inline: false
                },
                {
                    name: '❓ `/help`',
                    value: 'Afficher cette aide (commande actuelle).',
                    inline: false
                }
            )
            .setColor(0x00FF00);

        embeds.push(userEmbed);

        // Commandes pour les modérateurs
        const modEmbed = new EmbedBuilder()
            .setTitle('🛡️ Commandes pour les modérateurs')
            .addFields(
                {
                    name: '✅ `/qualifier <url> [publier]`',
                    value: 'Valider et publier un article scientifique.\n• `url` : Lien vers l\'article à valider\n• `publier` : Publication automatique si validé (optionnel)',
                    inline: false
                },
                {
                    name: '➕ `/addsource <domaine>`',
                    value: 'Ajouter une nouvelle source fiable à la charte.\n• `domaine` : Nom de domaine (ex: nature.com)',
                    inline: false
                },
                {
                    name: '➖ `/removesource <domaine>`',
                    value: 'Supprimer une source de la charte.\n• `domaine` : Nom de domaine à supprimer',
                    inline: false
                }
            )
            .setColor(0xFF6600);

        embeds.push(modEmbed);

        // Fonctionnalités automatiques
        const autoEmbed = new EmbedBuilder()
            .setTitle('🔄 Fonctionnalités automatiques')
            .addFields(
                {
                    name: '📅 Paper of the Week',
                    value: 'Chaque lundi à 9h, je publie automatiquement un "Paper of the Week" dans le canal #articles avec :\n• Recherche via IA\n• Vérification des sources\n• Résumé automatique\n• Formatage Discord',
                    inline: false
                },
                {
                    name: '📊 Monitoring',
                    value: 'Toutes les actions importantes sont journalisées :\n• Commandes exécutées\n• Erreurs rencontrées\n• Modifications de sources\n• Publications automatiques',
                    inline: false
                }
            )
            .setColor(0x9900FF);

        embeds.push(autoEmbed);

        // Informations techniques
        const techEmbed = new EmbedBuilder()
            .setTitle('⚙️ Informations techniques')
            .addFields(
                {
                    name: '🔧 APIs utilisées',
                    value: '• **Perplexity AI** - Recherche et validation d\'articles\n• **OpenAI** - Résumés intelligents\n• **The Space Devs** - Données de lancements de fusées',
                    inline: false
                },
                {
                    name: '🛡️ Sécurité et sources',
                    value: 'Le bot vérifie automatiquement que les sources sont fiables selon notre charte. Les modérateurs peuvent gérer dynamiquement cette liste.',
                    inline: false
                },
                {
                    name: '📞 Support',
                    value: 'En cas de problème, contactez les modérateurs du serveur.',
                    inline: false
                }
            )
            .setColor(0x666666)
            .setFooter({ 
                text: 'Bot Science Squad v1.0 • Auto-hébergeable sur Ubuntu Server' 
            });

        embeds.push(techEmbed);

        await interaction.reply({ embeds });
    },
};