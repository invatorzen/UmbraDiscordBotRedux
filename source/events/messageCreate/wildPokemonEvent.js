const GuildConfiguration = require('../../models/GuildConfiguration');
const { Client, EmbedBuilder } = require('discord.js');
const { pokemon } = require('../../assets/statData');

// Function to get a random element from an array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Function to generate a random level for the Pokémon
function generateRandomLevel() {
    // Randomly determine the base level
    let baseLevel = Math.floor(Math.random() * 100) + 1;
    console.log(`first baseLevel: ${baseLevel}`)
    
    // Adjust the level probability distribution
    if (baseLevel > 30) {
        // Make Pokémon above level 30 rarer
        baseLevel = Math.floor(Math.random() * 70);
        console.log(`second baseLevel: ${baseLevel}`)
    }
    
    return baseLevel;
}

// Function to determine if the Pokémon is shiny based on a 1/4096 chance
function isShiny() {
    return Math.random() < 1 / 500;
    //return Math.random() < 1 / 4096;
}

async function spawnCustomPokemon(client, guildId, species, gender, shiny) {
    try {
        // Fetch guild configuration
        const guildConfig = await GuildConfiguration.findOne({ guildId });
        if (!guildConfig || !guildConfig.pokemonWildAreaIds || guildConfig.pokemonWildAreaIds.length === 0) {
            console.log(`Guild ${guildId} does not have pokemonWildAreaIds configured.`);
            return;
        }

        // Iterate over each channel ID in pokemonWildAreaIds
        for (const channelId of guildConfig.pokemonWildAreaIds) {
            // Fetch the channel using the ID
            const channel = client.channels.cache.get(channelId);
            if (!channel) {
                console.error(`Channel with ID ${channelId} not found.`);
                continue;
            }

            let selectedPokemon;

            // Check if a specific species is provided
            if (species) {
                // Find the matching species in the pokemon data
                selectedPokemon = pokemon.find(p => p.name.toLowerCase() === species.toLowerCase());
                if (!selectedPokemon) {
                    console.error(`Species '${species}' not found in the Pokémon data.`);
                    continue;
                }
            } else {
                // If no specific species is provided, select a random one
                selectedPokemon = getRandomElement(pokemon);
            }

            // Determine if the Pokémon is shiny
            const isShinyPokemon = shiny !== undefined ? shiny : Math.random() < 1 / 500;

            // Determine the gender of the Pokémon (50/50 chance)
            const pokemonGender = gender !== undefined ? gender : Math.random() < 0.5 ? 0 : 1;

            // Determine the image URL based on whether the Pokémon is shiny and gender
            let imageUrl;
            if (isShinyPokemon && pokemonGender === 1 && selectedPokemon.female_shiny_image_url) {
                imageUrl = selectedPokemon.female_shiny_image_url;
            } else if (isShinyPokemon && selectedPokemon.shiny_image_url) {
                imageUrl = selectedPokemon.shiny_image_url;
            } else if (pokemonGender === 1 && selectedPokemon.female_image_url) {
                imageUrl = selectedPokemon.female_image_url;
            } else {
                imageUrl = selectedPokemon.image_url;
            }

            // Generate a random level for the Pokémon
            const level = generateRandomLevel();

            // Get the XP rate from the matching Pokémon data in statData
            const matchingPokemon = pokemon.find(p => p.name.toLowerCase() === selectedPokemon.name.toLowerCase());
            const xpRate = matchingPokemon ? matchingPokemon.xp_rate : 1; // Default to 1 if no matching Pokémon found

            // Update the pokemonInWild field in the GuildConfiguration model
            const pokemonData = {
                areaId: channelId,
                pokemonName: selectedPokemon.name,
                level,
                isShiny: isShinyPokemon,
                gender: pokemonGender,
                xp_rate: xpRate
            };
            await GuildConfiguration.findOneAndUpdate(
                { guildId },
                { $push: { pokemonInWild: pokemonData } },
                { upsert: true }
            );

            // Create the embedded message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Who\'s that Pokémon?')
                .setImage(imageUrl)
                .setDescription(`Type \`/catch\` and the name of the Pokémon to catch it!`)
                .setFooter({ text: `Level: ${level}` });

            // Send the embedded message
            await channel.send({ embeds: [embed] });
            console.log(`Sent a custom Pokémon message to channel ${channelId}.`);
        }
    } catch (error) {
        console.error('Error spawning custom Pokémon:', error);
    }
}

async function getRandomPokemonMessage(client, guildId) {
    try {
        // Fetch guild configuration
        const guildConfig = await GuildConfiguration.findOne({ guildId });
        if (!guildConfig || !guildConfig.pokemonWildAreaIds || guildConfig.pokemonWildAreaIds.length === 0) {
            console.log(`Guild ${guildId} does not have pokemonWildAreaIds configured.`);
            return;
        }

        // Select a random channel ID from the list
        const randomChannelId = getRandomElement(guildConfig.pokemonWildAreaIds);

        // Fetch the channel using the ID
        const channel = client.channels.cache.get(randomChannelId);
        if (!channel) {
            console.error(`Channel with ID ${randomChannelId} not found.`);
            return;
        }

        // Get a random Pokémon
        const randomPokemon = getRandomElement(pokemon);

        // Generate a random level for the Pokémon
        const level = generateRandomLevel();

        // Check if the Pokémon is shiny
        const isShinyPokemon = isShiny();

        // Determine the image URL based on whether the Pokémon is shiny
        const imageUrl = isShinyPokemon ? randomPokemon.shiny_image_url : randomPokemon.image_url;

        // Get the XP rate from the matching Pokémon data in statData
        const matchingPokemon = pokemon.find(p => p.name.toLowerCase() === randomPokemon.name.toLowerCase());
        const xpRate = matchingPokemon.xp_rate;

        // Update the pokemonInWild field in the GuildConfiguration model
        await GuildConfiguration.findOneAndUpdate(
            { guildId },
            { $set: { 'pokemonInWild': [{ areaId: randomChannelId, pokemonName: randomPokemon.name, level, isShiny: isShinyPokemon, xp_rate: xpRate }] } },
            { upsert: true }
        );

        // Create the embedded message
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Who\'s that Pokémon?')
            .setImage(imageUrl)
            .setDescription(`Type \`/catch\` and the name of the Pokémon to catch it!`)
            .setFooter({ text: `Level: ${level}` });

        // Send the embedded message
        const message = await channel.send({ embeds: [embed] });
        console.log(`Sent a random Pokémon message to channel ${randomChannelId}.`);

        // Return the message object for further processing
        return message;
    } catch (error) {
        console.error('Error sending random Pokémon message:', error);
    }
}

module.exports = { getRandomPokemonMessage, spawnCustomPokemon};