const { Client, Interaction, EmbedBuilder } = require("discord.js");
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const GuildConfiguration = require('./../../models/GuildConfiguration.js'); // Adjust the path as needed
const { getRandomPokemonMessage, spawnCustomPokemon} = require('../../events/messageCreate/wildPokemonEvent.js');

// Schedule getRandomPokemonMessage
const minInterval = 60 * 60 * 1000; // 1 hour in milliseconds
const maxInterval = 120 * 60 * 1000; // 2 hours in milliseconds

const data = {
    name: 'force_spawn',
    description: 'Force a Pokémon spawn.',
    options: [
        {
            name: 'minutes',
            description: 'How many minutes until the first Pokémon spawns.',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: 'species',
            description: 'The Pokémon species to spawn.',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
        {
            name: 'gender',
            description: 'The gender of the Pokémon (0 for male, 1 for female, 2 for genderless).',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: 'shiny',
            description: 'Whether the Pokémon should be shiny (true or false).',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        }
    ],
};


async function spawnPokemonForGuild(client, guildConfig, species, gender, shiny) {
    try {
        if (species || gender || shiny) {
            await spawnCustomPokemon(client, guildConfig.guildId, species, gender, shiny);
        } else {
            await getRandomPokemonMessage(client, guildConfig.guildId);
        }
    } catch (error) {
        console.error(`Error spawning Pokémon for guild ${guildConfig.guildId}:`, error);
    }
}

async function spawnPokemonForAllGuilds(client, species, gender, shiny) {
    try {
        const guilds = await GuildConfiguration.find({});
        const promises = guilds.map(guildConfig => spawnPokemonForGuild(client, guildConfig, species, gender, shiny));
        await Promise.all(promises);
    } catch (error) {
        console.error('Error spawning Pokémon for all guilds:', error);
    }
}

async function run({ interaction, client }) {
    try {
        // Parse the command options
        const minutes = interaction.options.getInteger('minutes');
        const species = interaction.options.getString('species');
        const gender = interaction.options.getInteger('gender');
        const shiny = interaction.options.getBoolean('shiny');

        // Calculate the delay for the initial spawn
        let initialDelay = minInterval; // Default to minInterval
        if (minutes !== null && minutes >= 0) {
            initialDelay = minutes === 0 ? 0 : Math.min(maxInterval, minutes * 60 * 1000); // Convert minutes to milliseconds
        } else {
            initialDelay += Math.floor(Math.random() * (maxInterval - minInterval)); // Randomize delay between minInterval and maxInterval
        }

        // Schedule the initial spawn
        setTimeout(async () => {
            await spawnPokemonForAllGuilds(client, species, gender, shiny);
        }, initialDelay);

        // Respond to the interaction indicating that the spawn has been scheduled
        if (initialDelay === 0) {
            await interaction.reply({ content: "A Pokémon spawn has been scheduled immediately.", ephemeral: true });
        } else {
            await interaction.reply({ content: `A Pokémon spawn has been scheduled in ${initialDelay / (60 * 1000)} minutes.`, ephemeral: true });
        }
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