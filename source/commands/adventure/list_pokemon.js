const { Client, Interaction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const UserMons = require('../../models/UserMons');

const MAX_ROWS = 25; // Maximum number of rows to display in total

const data = {
    name: 'list_pokemon',
    description: 'List your Pokémon so you can see their index for other commands.',
    options: [
        {
            name: 'rows',
            description: 'Number of rows per page (default is 10)',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
    ],
};

async function run({ interaction, client }) {
    try {
        const rowsPerPage = interaction.options.getInteger('rows') || 10;
        // Fetch user's Pokémon collection from the database
        const userMons = await UserMons.findOne({ userId: interaction.user.id });
        
        // If no collection found, return a message indicating so
        if (!userMons || userMons.pokemon.length === 0) {
            await interaction.reply({
                content: 'You have no Pokémon in your collection.',
                ephemeral: true
            });
            return;
        }
        // Pagination logic
        let page = 0;
        const maxPages = Math.ceil(userMons.pokemon.length / rowsPerPage);

        // Display Pokémon list for the current page
        const start = page * rowsPerPage;
        const end = Math.min(start + rowsPerPage, userMons.pokemon.length);
        const pokemonList = userMons.pokemon.slice(start, end);
        
        // Generate embed to display Pokémon list
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Your Pokémon Collection')
            .setDescription(`Showing Pokémon ${start + 1} - ${end} of ${userMons.pokemon.length}`)
            .addFields(
                pokemonList.map((pokemon, index) => ({
                    name: `#${start + index + 1} - ${pokemon.species}`,
                    value: `Gender: ${pokemon.gender === 0 ? 'N/A' : pokemon.gender === 1 ? 'M' : 'F'} | Level: ${pokemon.level}`,
                }))
            );

        const previousButton = new ButtonBuilder()
            .setCustomId("previous_page")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0);
        const nextButton = new ButtonBuilder()
            .setCustomId("next_page")
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === maxPages - 1);
        const actionRow = new ActionRowBuilder().addComponents(
            previousButton,
            nextButton
        );

        // Send the initial message with embed and action row
        const reply = await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });

        // Create collector for pagination buttons
        const filter = i => i.customId === 'previous_page' || i.customId === 'next_page';
        const collector = reply.createMessageComponentCollector({ filter, time: 60000 });

        // Handle button interactions
        collector.on('collect', async i => {
            if (i.customId === 'previous_page') {
                if (page > 0) {
                    page--;
                }
            } else if (i.customId === 'next_page') {
                if (page < maxPages - 1) {
                    page++;
                }
            }
            
            // Update the embed with new page of Pokémon list
            const newStart = page * rowsPerPage;
            const newEnd = Math.min(newStart + rowsPerPage, userMons.pokemon.length);
            const newPokemonList = userMons.pokemon.slice(newStart, newEnd);
            const newEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Your Pokémon Collection')
                .setDescription(`Showing Pokémon ${newStart + 1} - ${newEnd} of ${userMons.pokemon.length}`)
                .addFields(
                    newPokemonList.map((pokemon, index) => ({
                        name: `#${newStart + index + 1} - ${pokemon.species}`,
                        value: `Gender: ${pokemon.gender === 0 ? 'N/A' : pokemon.gender === 1 ? 'M' : 'F'} | Level: ${pokemon.level}`,
                    }))
                );

            // Update the message with the new embed and update button states
            previousButton.setDisabled(page === 0);
            nextButton.setDisabled(page === maxPages - 1);
            
            await i.update({ embeds: [newEmbed], components: [actionRow] });
        });

        // Handle end of collector event
        collector.on('end', () => {
            reply.edit({ components: [] }); // Remove the action row when collector ends
        });
    } catch (error) {
        console.error('Error viewing Pokémon collection:', error);
        await interaction.reply({ content: 'An error occurred while viewing your Pokémon collection.', ephemeral: true });
    }
}

const options = {
    devOnly: true,
    deleted: false,
};

module.exports = { data, options, run };