const { Client, Interaction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const UserMons = require('../../models/UserMons');
const { pokemon } = require('../../assets/statData');

const data = {
    name: 'view_pokemon',
    description: 'View your Pokémon collection.',
};

async function run({ interaction, client }) {
    try {
        // Retrieve the Pokémon collection of the user from the database
        const userMons = await UserMons.findOne({ userId: interaction.user.id });
        if (!userMons || !userMons.pokemon || userMons.pokemon.length === 0) {
            await interaction.reply({ content: "You don't have any Pokémon in your collection. Try ``/adventure`` to get your starter!", ephemeral: true });
            return;
        }

        // Prepare the data to display in the embedded message
        const totalPokemon = userMons.pokemon.length;
        let currentIndex = 0; // Assuming the user starts from the first Pokémon

        const currentPokemon = userMons.pokemon[currentIndex];
        const pokemonInfo = pokemon.find(p => p.name === currentPokemon.species);
        const pokemonName = currentPokemon.shiny ? `⭐ ${currentPokemon.species} ⭐` : currentPokemon.species; // Determines if shiny

        if (!pokemonInfo) {
            await interaction.reply({ content: "Pokemon data not found.", ephemeral: true });
            return;
        }

        let imageUrl;
        if (currentPokemon.shiny && currentPokemon.female && pokemonInfo.shiny_female_image_url && pokemonInfo.shiny_female_image_url !== '') {
            imageUrl = pokemonInfo.shiny_female_image_url;
        } else if (currentPokemon.shiny && pokemonInfo.shiny_image_url && pokemonInfo.shiny_image_url !== '') {
            imageUrl = pokemonInfo.shiny_image_url;
        } else if (currentPokemon.female && !currentPokemon.female_image_url) {
            imageUrl = pokemonInfo.image_url;
        } else {
            imageUrl = currentPokemon.image_url;
        }

        // Create an embedded message with the Pokémon information and navigation buttons
        const embed = new EmbedBuilder()
            .setTitle("Your Pokémon Collection")
            .setDescription(`**${pokemonName}**`)
            .setImage(imageUrl)
            .setFooter({ text: `Current Pokémon: ${currentIndex + 1}/${totalPokemon}` });

        const previousButton = new ButtonBuilder()
            .setCustomId("previous_pokemon")
            .setLabel("Previous")
            .setStyle(ButtonStyle.Secondary);

        const nextButton = new ButtonBuilder()
            .setCustomId("next_pokemon")
            .setLabel("Next")
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder().addComponents(previousButton, nextButton);

        // Send the embedded message with navigation buttons
        const reply = await interaction.reply({
            embeds: [embed],
            components: [actionRow],
        });

        // Register interaction listeners for the navigation buttons
        const collector = reply.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 30000,
        });

        collector.on("collect", async (i) => {
            if (i.customId === "previous_pokemon") {
                currentIndex = (currentIndex - 1 + totalPokemon) % totalPokemon;
            } else if (i.customId === "next_pokemon") {
                currentIndex = (currentIndex + 1) % totalPokemon;
            }
        
            if (currentIndex < 0 || currentIndex >= totalPokemon) {
                await i.update({ content: "You have no other Pokémon to view.", ephemeral: true });
                return;
            }
        
            const currentPokemon = userMons.pokemon[currentIndex];
            const pokemonInfo = pokemon.find(p => p.name === currentPokemon.species);
        
            if (!pokemonInfo) {
                await interaction.reply({ content: "Pokemon data not found.", ephemeral: true });
                return;
            }
        
            let imageUrl;
            if (currentPokemon.shiny && currentPokemon.female && pokemonInfo.shiny_female_image_url && pokemonInfo.shiny_female_image_url !== '') {
                imageUrl = pokemonInfo.shiny_female_image_url;
            } else if (currentPokemon.shiny && pokemonInfo.shiny_image_url && pokemonInfo.shiny_image_url !== '') {
                imageUrl = pokemonInfo.shiny_image_url;
            } else if (currentPokemon.female && !currentPokemon.female_image_url) {
                imageUrl = pokemonInfo.image_url;
            } else {
                imageUrl = currentPokemon.image_url;
            }
        
            // Update the embedded message with the next or previous Pokémon information
            const updatedEmbed = new EmbedBuilder()
    .setTitle("Your Pokémon Collection")
    .setDescription(`**${currentPokemon.shiny ? `⭐ ${currentPokemon.species} ⭐` : currentPokemon.species}**`)
    .setImage(currentPokemon.shiny ? currentPokemon.shiny_image_url || pokemonInfo.shiny_image_url || pokemonInfo.image_url : currentPokemon.image_url || pokemonInfo.image_url)
    .setFooter({ text: `Current Pokémon: ${currentIndex + 1}/${totalPokemon}` });

await i.update({ embeds: [updatedEmbed] });
      });
    } catch (error) {
        console.error('Error:', error);
        await interaction.reply({
            content: "An error occurred while processing your request.",
            ephemeral: true,
        });
    }
}

const options = {
    devOnly: true,
    deleted: false,
};

module.exports = { data, options, run };