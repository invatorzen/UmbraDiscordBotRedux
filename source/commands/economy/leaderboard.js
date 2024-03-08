const {
  Client,
  Interaction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const Level = require("../../models/Level");
const PAGE_SIZE = 10; // Number of entries per page

const data = {
    name: "leaderboard",
    description: "View the top chatters on the server! (10 at a time)",
};

async function run({ interaction, client }) {
  try {
    const allLevels = await Level.find({ guildId: interaction.guild.id });
    allLevels.sort((a, b) => b.level - a.level || b.xp - a.xp);
    let currentPage = 0;
    const totalPageCount = Math.ceil(allLevels.length / PAGE_SIZE);
    const createLeaderboardEmbed = (page) => {
      const startIndex = page * PAGE_SIZE;
      const leaderboardPage = allLevels.slice(
        startIndex,
        startIndex + PAGE_SIZE
      );
      const leaderboardText = leaderboardPage
        .map((entry, index) => {
          const user = interaction.guild.members.cache.get(entry.userId);
          return `**${startIndex + index + 1}.** ${user.toString()} **(${
            user.user.username
          })**\nLevel: ${entry.level} | XP: ${entry.xp}`;
        })
        .join("\n\n");
      return new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Leaderboard")
        .setDescription(leaderboardText);
    };
    const previousButton = new ButtonBuilder()
      .setCustomId("previous_page")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Primary);
    const nextButton = new ButtonBuilder()
      .setCustomId("next_page")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary);
    const actionRow = new ActionRowBuilder().addComponents(
      previousButton,
      nextButton
    );
    const leaderboardEmbed = createLeaderboardEmbed(currentPage);
    const reply = await interaction.reply({
      embeds: [leaderboardEmbed],
      components: [actionRow],
    });
    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 30000,
    });
    collector.on("collect", async (i) => {
      if (i.customId === "previous_page") {
        currentPage = Math.max(currentPage - 1, 0);
      } else if (i.customId === "next_page") {
        currentPage = Math.min(currentPage + 1, totalPageCount - 1);
      }
      const updatedEmbed = createLeaderboardEmbed(currentPage);
      i.update({ embeds: [updatedEmbed] });
    });
  } catch (error) {
    console.log(`There was an error: ${error}`);
    interaction.reply({
      content: "An error occurred while fetching the leaderboard.",
      ephemeral: true,
    });
      }
}

module.exports = { data, run };
