const { SlashCommandBuilder, ChannelType } = require('discord.js');
const GuildConfiguration = require('../../models/GuildConfiguration');

module.exports = {
    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({ interaction }) => {
        let guildConfiguration = await GuildConfiguration.findOne({ guildId: interaction.guildId });

        if (!guildConfiguration) {
            guildConfiguration = new GuildConfiguration({ guildId: interaction.guildId });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const channel = interaction.options.getChannel('channel');

            // Check if the channel already exists in pokemonWildAreaIds
            if (guildConfiguration.pokemonWildAreaIds.includes(channel.id)) {
                await interaction.reply('This channel is already configured for wild Pokémon messages.');
                return;
            }

            guildConfiguration.pokemonWildAreaIds.push(channel.id);
            await guildConfiguration.save();

            await interaction.reply(`Added ${channel} as a wild Pokémon area channel!`);
            return;
        }

        if (subcommand === 'remove') {
            const channel = interaction.options.getChannel('channel');

            // Check if the channel exists in pokemonWildAreaIds
            if (!guildConfiguration.pokemonWildAreaIds.includes(channel.id)) {
                await interaction.reply('This channel is not configured for wild Pokémon messages.');
                return;
            }

            // Remove the channel id from the array
            guildConfiguration.pokemonWildAreaIds = guildConfiguration.pokemonWildAreaIds.filter((channelId) => channelId !== channel.id);

            await guildConfiguration.save();
            await interaction.reply(`Removed ${channel} as a wild Pokémon area channel!`);
            return;
        }
    },
    options: {
        userPermissions: ['Administrator'],
    },
    data: new SlashCommandBuilder()
        .setName('config-wildarea')
        .setDescription('Configure wild Pokémon area channels for this server.')
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Add a wild Pokémon area channel')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('The channel you want to add')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Remove a wild Pokémon area channel')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('The channel you want to remove')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        ),
};