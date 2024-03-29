const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const statData = require('../../assets/statData');
const image = require('../../assets/images'); 

const data = {
    name: 'wiki',
    description: 'Sends an embedded message with buttons to click to access the wiki!',
};

async function run({ interaction, client }) {
    try {
        // Used to randomly select the image
        const randomIndex = Math.floor(Math.random() * image.photo.length);
        const thumbnailURL = image.photo[randomIndex].link;

        // Show pretty embedded message with buttons for home and dex links
        const homeButton = new ButtonBuilder()
            .setLabel('Home')
            .setStyle(ButtonStyle.Link)
            .setURL('https://pokemon-umbra.fandom.com/wiki/Pokémon_Umbra_Wiki');

        const dexButton = new ButtonBuilder()
            .setLabel('Dex')
            .setStyle(ButtonStyle.Link)
            .setURL('https://pokemon-umbra.fandom.com/wiki/Pokédex');

        const actionRow = new ActionRowBuilder()
            .addComponents(homeButton, dexButton);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Pokémon Umbra Wiki')
            .setThumbnail(thumbnailURL) // Set thumbnail using the randomly selected photo URL
            .setURL(`https://pokemon-umbra.fandom.com/wiki/Pokémon_Umbra_Wiki`)
            .setDescription('Welcome to the Pokémon Umbra Wiki!\n\nClick the buttons below to explore further.');

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    } catch (error) {
        console.error('Error:', error);
        await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
}

const options = {
    deleted: false,
    devOnly: false,
};

module.exports = { data, options, run };