const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const canvacord = require('canvacord');
const calculateLevelXp = require('../../utils/calculateLevelXp'); // Required to calculate the required xp for the next level
const Level = require('../../models/Level'); // Required to get level from database

const data = {
  name: 'level',
  description: 'Shows your current level',
  options: [
      {
        name: 'target-user',
        description: 'The user to show the level of.',
        type: ApplicationCommandOptionType.User,
      },
  ],
};

async function run({ interaction, client }) {
  if (!interaction.guild) {
    interaction.reply('You can only use this command in a server!');
    return;
  }

  await interaction.deferReply();

  const mentionedUserId = interaction.options.get('target-user')?.value;
  const targerUserId = mentionedUserId || interaction.user.id; // If mentionedUserId is undefined, use interaction.user.id
  const targetUserObj = await interaction.guild.members.fetch(targerUserId);

  // Get level from database
  const fetchedLevel = await Level.findOne({
    userId: targerUserId,
    guildId: interaction.guildId,
  });

  // Checking if the level exists
  if (!fetchedLevel) {
    interaction.editReply(mentionedUserId ? `${targetUserObj} doesn't have a level!` : `You don't have a level yet!`);
    return;
  }

  let allLevels = await Level.find({ guildId: interaction.guild.id }).select('-_id userId level xp');
  allLevels.sort((a, b) => {
      if (a.level === b.level) {
          return b.xp - a.xp;
      } else {
          return b.level - a.level;
      }
  });

  let currentRank = allLevels.findIndex((level) => level.userId === targerUserId) + 1;
  
  const status = targetUserObj.presence ? targetUserObj.presence.status : 'offline';

  const rank = new canvacord.Rank()
    .setAvatar(targetUserObj.user.displayAvatarURL({size:256}))
    .setRank(currentRank)
    .setLevel(fetchedLevel.level)
    .setCurrentXP(fetchedLevel.xp)
    .setRequiredXP(calculateLevelXp(fetchedLevel.level))
    .setStatus(status)
    .setProgressBar('#FFC300', 'COLOR')
    .setUsername(targetUserObj.user.username)
    .setDiscriminator(targetUserObj.user.discriminator);

    const data = await rank.build();
    const attachment = new AttachmentBuilder(data);
    interaction.editReply({files: [attachment]});
}

module.exports = { data, run };