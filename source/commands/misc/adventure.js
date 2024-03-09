const { Client, Interaction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require("discord.js");
const UserMons = require('../../models/UserMons');
const fs = require('fs');

// Define the shiny odds as a constant
const SHINY_ODDS = 1;

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
            let gender = 1

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
            const isShiny = Math.floor(Math.random() * SHINY_ODDS) === 0;
            if (isShiny) {
                shiny = true;
            }

            // Add the chosen pokemon to the user's pokemon array
            await UserMons.findOneAndUpdate(
                { userId: interaction.user.id },
                { $push: { pokemon: { species: choice, shiny, gender } } },
                { upsert: true }
            );

            // Attach the image of the chosen pokemon
            let imagePath = `source/assets/monGraphics/${choice.charAt(0).toUpperCase() + choice.slice(1)}.png`;
            if (isShiny) {
                imagePath = `source/assets/monGraphics/shiny/${choice.charAt(0).toUpperCase() + choice.slice(1)}.png`;
            }
            if (fs.existsSync(imagePath)) {
                const attachment = new AttachmentBuilder(imagePath);
                if (isShiny) {
                    await i.reply({ content: `@${interaction.user.username} chose ⭐ *${choice}* ⭐ as their starter!`, files: [attachment] });
                } else {
                    await i.reply({ content: `@${interaction.user.username} chose ${choice} as their starter!`, files: [attachment] });
                }
            }

            // Disable the buttons
            actionRow.components.forEach(component => {
                component.setDisabled(true);
            });
            await reply.edit({ components: [actionRow] });

            // You can update the embed here if needed
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
    devOnly: true,
    deleted: false,
};

module.exports = { data, options, run };