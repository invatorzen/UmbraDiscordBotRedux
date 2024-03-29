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
    // Remove users from the database if they can't be found in the server
    const allLevels = await Level.find({ guildId: interaction.guild.id });
    const filteredLevels = await Promise.all(
      allLevels.map(async (entry) => {
        try {
          await interaction.guild.members.fetch(entry.userId);
          return entry;
        } catch (error) {
          console.error(
            `Error fetching member with ID ${entry.userId}:`,
            error
          );
          await Level.deleteOne({ _id: entry._id }); // Remove the entry from the database
          return null;
        }
      })
    );
    const levelsToRemove = filteredLevels.filter((entry) => entry === null);
    await Promise.all(levelsToRemove.map((entry) => Level.deleteOne({ _id: entry._id })));

    // Filter out users with 15 XP or less and level 0
    const usersToRemove = filteredLevels.filter(
      (entry) => entry.xp <= 15 && entry.level === 0
    );
    const updatedLevels = filteredLevels.filter(
      (entry) => !usersToRemove.includes(entry)
    );

    updatedLevels.sort((a, b) => b.level - a.level || b.xp - a.xp);
    let currentPage = 0;
    const totalPageCount = Math.ceil(updatedLevels.length / PAGE_SIZE);
    const createLeaderboardEmbed = async (page) => {
      const startIndex = page * PAGE_SIZE;
      const leaderboardPage = updatedLevels.slice(
        startIndex,
        startIndex + PAGE_SIZE
      );
      const fetchMemberPromises = leaderboardPage.map(async (entry, index) => {
        try {
          const user = await interaction.guild.members.fetch(entry.userId);
          return `**${startIndex + index + 1}.** ${user.toString()} **(${
            user.user.username
          })**\nLevel: ${entry.level} | XP: ${entry.xp}`;
        } catch (error) {
          console.error(`Error fetching member with ID ${entry.userId}:`, error);
          return `**${startIndex + index + 1}.** User not found (ID: ${entry.userId})\nLevel: ${entry.level} | XP: ${entry.xp}`;
        }
      });
      const leaderboardTextArray = await Promise.all(fetchMemberPromises);
      const leaderboardText = leaderboardTextArray.join("\n\n");
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
    const leaderboardEmbed = await createLeaderboardEmbed(currentPage);
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
      const updatedEmbed = await createLeaderboardEmbed(currentPage);
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