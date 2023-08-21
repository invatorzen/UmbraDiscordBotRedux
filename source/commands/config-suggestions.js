const {SlashCommandBuilder, ChannelType, ChatInputCommandInteraction} = require('discord.js');
const GuildConfiguration = require('../models/GuildConfiguration');

module.exports = {
    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({interaction}) => {
        let guildConfiguration = await GuildConfiguration.findOne({guildId: interaction.guildId});

        if (!guildConfiguration) {
            guildConfiguration = new GuildConfiguration({guildId: interaction.guildId});
        };

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'add') {
            const channel = interaction.options.getChannel('channel');

            // Check if the suggestion channel already exists
            if (guildConfiguration.suggestionsChannelId.includes(channel.id)) {
                await interaction.reply('This channel is already a suggestions channel');
                return;
            }

            guildConfiguration.suggestionsChannelId.push(channel.id);
            await guildConfiguration.save();

            await interaction.reply(`Added ${channel} as a suggestions channel!`);
            return;
        }

        if (subcommand === 'remove') {
            const channel = interaction.options.getChannel('channel');

            // Check if the suggestion channel doesn't exist
            if (!guildConfiguration.suggestionsChannelId.includes(channel.id)) {
                await interaction.reply('This channel is not a suggestions channel');
                return;
            }

            // Filters out the channel id from the array
            guildConfiguration.suggestionsChannelId = guildConfiguration.suggestionsChannelId.filter((channelId) => channelId !== channel.id);

            await guildConfiguration.save();
            await interaction.reply(`Removed ${channel} as a suggestions channel!`);
            return;
        }
    },
    options: {
        userPermissions: ['Administrator'],
    },
    data: new SlashCommandBuilder()
      .setName('config-suggestions')
      .setDescription('Configure the suggestions channel for this server.')
      .setDMPermission(false)
      .addSubcommand((subcommand) => 
        subcommand
          .setName('add')
          .setDescription('Add a suggestions channel')
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
          .setDescription('Remove a suggestions channel')
          .addChannelOption((option) =>
           option
             .setName('channel')
             .setDescription('The channel you want to remove')
             .addChannelTypes(ChannelType.GuildText)
             .setRequired(true)
          )
      ),
};