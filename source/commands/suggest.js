const { ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const GuildConfiguration = require('../models/GuildConfiguration');
const Suggestion = require('../models/Suggestion');
const formatResults = require('../utils/formatResults');

module.exports = {
    data: {
        name: 'suggest',
        description: 'Suggest something for the game!',
        dm_permission: false,
    },

    /**
     * @param {Object} param0
     * @param {ChatInputCommandInteraction} param0.interaction
     */
    run: async ({interaction }) => {
      try {
        const guildConfiguration = await GuildConfiguration.findOne({guildId: interaction.guildId});


      // Show this message if we aren't accepting suggestions
      if (!guildConfiguration?.suggestionsChannelId.length) {
        await interaction.reply('The game isn\'t currently taking any suggestions!');
        return;
      }

      // Show this if user is suggesting in wrong channel
      if (!guildConfiguration?.suggestionsChannelId.includes(interaction.channelId)) {
        await interaction.reply(`This channel is not a suggestion channel!\nPlease use this channel instead: ${guildConfiguration.suggestionsChannelId.map((channelId) => `<#${channelId}>`).join(', ')}`);
        return;
      }

      const modal = new ModalBuilder()
        .setTitle('Create a suggestion')
        .setCustomId(`suggestions-${interaction.user.id}`);

      const TextInput = new TextInputBuilder()
        .setCustomId('suggestion-input')
        .setLabel('What would you like to suggest?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000);

      const actionRow = new ActionRowBuilder().addComponents(TextInput);

      modal.addComponents(actionRow);

      await interaction.showModal(modal);

      // Shown after the user submits their modal
      const filter = (i) => i.customId === `suggestions-${interaction.user.id}`;

      const modalInteraction = await interaction.awaitModalSubmit({
        filter,
        time: 1000 * 60 * 3 // 3 minutes
      }).catch((error) => console.log(error));

      await modalInteraction.deferReply({epehmeral: true});

      let suggestionMessage;

      try {
        suggestionMessage = await interaction.channel.send('Creating suggestion, please wait...');
      } catch (error) {
        modalInteraction.editReply('Failed to create suggestion, I may not have enough permissions.');
        return;
      }

      const suggestionText = modalInteraction.fields.getTextInputValue('suggestion-input');

      // Push suggestion
      const newSuggestion = new Suggestion({
        authorId: interaction.user.id,
        guildId: interaction.guildId,
        messageId: suggestionMessage.id,
        content: suggestionText,
      });
    
      await newSuggestion.save();

      // Message shown when suggestion created
      modalInteraction.editReply('Suggestion created!');

      // Suggestion emebed
      const suggestionEmebed = new EmbedBuilder()
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({size: 256}),
        })
        .addFields([
            {name: 'Question', value: suggestionText},
            {name: 'Status', value: 'Pending'},
            {name: 'Votes', value: formatResults()},
        ])
        .setColor('Yellow');

        // Buttons
        const upvoteButton = new ButtonBuilder()
          .setEmoji('1️⃣')
          .setLabel('Option 1')
          .setStyle(ButtonStyle.Primary) // Blue
          .setCustomId(`suggestion.${newSuggestion.suggestionId}.upvote`);

        const downvoteButton = new ButtonBuilder()
          .setEmoji('2️⃣')
          .setLabel('Option 2')
          .setStyle(ButtonStyle.Primary) // Red
          .setCustomId(`suggestion.${newSuggestion.suggestionId}.downvote`);

        const approveButton = new ButtonBuilder()
          .setEmoji('✅')
          .setLabel('Approve')
          .setStyle(ButtonStyle.Success) // Green
            .setCustomId(`suggestion.${newSuggestion.suggestionId}.approve`);

        const rejectButton = new ButtonBuilder()
          .setEmoji('🗑️')
          .setLabel('Reject')
          .setStyle(ButtonStyle.Danger) // Red
          .setCustomId(`suggestion.${newSuggestion.suggestionId}.reject`);

        // Rows
        const firstRow = new ActionRowBuilder().addComponents(upvoteButton, downvoteButton);
        const secondRow = new ActionRowBuilder().addComponents(approveButton, rejectButton);

        // Edit suggestion message
        suggestionMessage.edit({
            content: ``, //content: `${interaction.user} Suggestion created!`,
            embeds: [suggestionEmebed],
            components: [firstRow, secondRow],
        });
        
      } catch (error) {
        console.log(`Error in /suggest: ${error}`);
      }
    },
}