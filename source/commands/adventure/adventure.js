const { Client, Interaction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require("discord.js");
const UserMons = require('../../models/userMons');
const statData = require('../../assets/statData'); // Import statData

// Define the shiny odds as a constant
const SHINY_ODDS = 1/500;

const data = {
    name: 'adventure',
    description: 'Start your adventure!',
};

async function run({ interaction, client }) {
    try {
        // Check if the user already has a pokemon
        const existingPokemon = await UserMons.findOne({ userId: interaction.user.id });
        if (existingPokemon) {
            await interaction.reply({ content: "You already have a Pokemon. You don't need a starter.", ephemeral: true });
            return;
        }

        const createEmbeddedText = new EmbedBuilder()
            .setColor("Purple")
            .setTitle("Choose your Pokemon")
            .setDescription("Select one of the Pokémon below to begin your adventure.");

        const psypoleButton = new ButtonBuilder()
            .setCustomId("psypole")
            .setLabel("Psypole")
            .setStyle(ButtonStyle.Primary);

        const seijitsuButton = new ButtonBuilder()
            .setCustomId("seijitsu")
            .setLabel("Seijitsu")
            .setStyle(ButtonStyle.Primary);

        const boxerooButton = new ButtonBuilder()
            .setCustomId("boxeroo")
            .setLabel("Boxeroo")
            .setStyle(ButtonStyle.Primary);

        const actionRow = new ActionRowBuilder().addComponents(
            psypoleButton,
            seijitsuButton,
            boxerooButton
        );

        const reply = await interaction.reply({
            embeds: [createEmbeddedText],
            components: [actionRow],
            ephemeral: true,
        });

        const collector = reply.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 30000,
        });

        collector.on("collect", async (i) => {
            let choice;
            let shiny = false;
            let gender = 1;
        
            // Determine the choice and if it's shiny
            if (i.customId === "psypole") {
                choice = "Psypole";
            } else if (i.customId === "seijitsu") {
                choice = "Seijitsu";
            } else if (i.customId === "boxeroo") {
                choice = "Boxeroo";
            }
        
            // Determine gender
            if (choice === "Psypole") {
                // Psypole has a 50/50 chance of being male or female
                gender = Math.random() < 0.5 ? 1 : 2;
            } else {
                // Seijitsu and Boxeroo have a 87.5% chance of being male
                gender = Math.random() < 0.875 ? 1 : 2;
            }
        
            // Check if the pokemon is shiny based on the odds
			const isShiny = Math.random() < SHINY_ODDS;
            if (isShiny) {
                shiny = true;
            }
        
            // Fetch the xp_rate from statData based on the user's choice
            const pokemonInfo = statData.pokemon.find(p => p.name === choice);
            const xpRate = pokemonInfo ? pokemonInfo.xp_rate : 'medium_fast'; // Default to 1 if not found
            // Fetch the guild name
            const guild = interaction.guild;
            const guildName = guild ? guild.name : null;
            // Fetch the user's name
            const userName = interaction.user.username;
                
            // Add the chosen pokemon to the user's pokemon array
            await UserMons.findOneAndUpdate(
                { userId: interaction.user.id },
                { 
                    $push: { 
                        pokemon: { 
                            species: choice, 
                            shiny, 
                            gender, 
                            level: 5, 
                            xp_rate: xpRate,
                            guildName,
                            userName,
                        } 
                    },
                    $set: {
                        walkingPokemonIndex: 0
                    }
                },
                { upsert: true }
            );
            // Get the relevant image URL from statData
            let imageUrl;
            if (isShiny) {
                if (gender === 2 && pokemonInfo.shiny_female_image_url !== '') {
                    imageUrl = pokemonInfo.shiny_female_image_url;
                } else if (pokemonInfo.shiny_image_url !== '') {
                    imageUrl = pokemonInfo.shiny_image_url;
                } else {
                    imageUrl = pokemonInfo.image_url;
                }
            } else {
                if (gender === 2 && pokemonInfo.female_image_url !== '') {
                    imageUrl = pokemonInfo.female_image_url;
                } else {
                    imageUrl = pokemonInfo.image_url;
                }
            }
        
            // Send the chosen Pokémon message with the image URL
            const messageContent = `${interaction.user.toString()} chose ${isShiny ? `⭐ *${choice}* ⭐` : choice} as their starter!`;
            await i.reply({ content: messageContent, embeds: [new EmbedBuilder().setImage(imageUrl)] });
        
            // Disable the buttons
            actionRow.components.forEach(component => {
                component.setDisabled(true);
            });
            await reply.edit({ components: [actionRow] });
        });
    } catch (error) {
        console.log(`There was an error: ${error}`);
        await interaction.reply({
            content: "An error occurred while processing your request.",
            ephemeral: true,
        });
    }
}

const options = {
    devOnly: false,
    deleted: false,
};

module.exports = { data, options, run };