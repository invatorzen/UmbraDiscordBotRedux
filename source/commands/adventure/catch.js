const { ApplicationCommandOptionType } = require("discord.js");
const GuildConfiguration = require('../../models/GuildConfiguration');
const { pokemon } = require('../../assets/statData');
const UserMons = require('../../models/userMons');

const data = {
    name: 'catch',
    description: 'Guess the name of a Wild Pokémon to catch it.',
    options: [
        {
            name: 'mon',
            description: 'The name of the Pokémon you are guessing.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ],
};

async function getCurrentWildPokemon(guildId) {
    try {
        const guildConfig = await GuildConfiguration.findOne({ guildId });
        if (!guildConfig || guildConfig.pokemonInWild.length === 0) {
            return null;
        }
        return guildConfig.pokemonInWild[0];
    } catch (error) {
        console.error('Error fetching current wild Pokémon:', error);
        return null;
    }
}

async function run({ interaction, client }) {
    // Get the user's guess from the interaction
    const guess = interaction.options.getString('mon');

    // Check if the user has any Pokémon
    const user = await UserMons.findOne({ userId: interaction.user.id });
    if (!user || !user.pokemon || user.pokemon.length === 0) {
        await interaction.reply({ content: "You can't catch any Pokémon until you get a starter. Try using `/adventure`!", ephemeral: true });
        return;
    }

    // Retrieve the current wild Pokémon's name and area ID
    const wildPokemon = await getCurrentWildPokemon(interaction.guildId);

    // Check if there is a wild Pokémon currently in the area
    if (!wildPokemon || !wildPokemon.pokemonName) {
        await interaction.reply({ content: 'There are no wild Pokémon around! Try again later.', ephemeral: true });
        return;
    }

    const { areaId, pokemonName, level, isShiny, xp_rate } = wildPokemon;

    // Check if the user is using the catch command in the correct channel
    if (areaId !== interaction.channelId) {
        await interaction.reply({ content: 'You can only catch Pokémon in the designated wild area.', ephemeral: true });
        return;
    }

    // Check if the user's guess matches the current wild Pokémon's name
    if (guess.toLowerCase() === pokemonName.toLowerCase()) {
        // User's guess is correct
        const caughtMessage = `**${pokemonName}** was caught by ${interaction.user.tag}`;

        // Find the Pokémon object in statData that matches the name
        const pokemonData = pokemon.find(p => p.name.toLowerCase() === pokemonName.toLowerCase());
        if (!pokemonData) {
            console.error(`Pokémon data not found for ${pokemonName}.`);
            await interaction.reply({ content: 'An error occurred while trying to catch the Pokémon.', ephemeral: true });
            return;
        }

        // Add the caught Pokémon to the user's collection
        const user = await UserMons.findOne({ userId: interaction.user.id });
        if (user) {
            user.pokemon.push({
                userName: interaction.user.username,
                guildId: interaction.guild.id,
                userId: interaction.user.id,
                level: level,
                species: pokemonData.name,
                gender: Math.random() < 0.5 ? 1 : 2, // 50/50 chance of being male or female
                xp: 0,
                xp_rate: xp_rate, // Use the xp_rate from statData
                shiny: isShiny
            });
            await user.save();
        } else {
            console.error('User not found.');
        }

        // Remove the caught Pokémon from the pokemonInWild array
        const guildConfig = await GuildConfiguration.findOneAndUpdate(
            { guildId: interaction.guildId },
            { $pull: { pokemonInWild: { pokemonName: pokemonName } } },
            { new: true }
        );

        await interaction.reply({ content: `Congratulations, ${interaction.user.toString()}! You caught the Pokémon!`, ephemeral: false });
    } else {
        // User's guess is incorrect
        console.log(`pokemonName: ${pokemonName} guess: ${guess}`)
        await interaction.reply({ content: 'Bzzt! Wrong. Guess again!', ephemeral: true });
    }
}

const options = {
    devOnly: false,
    deleted: false,
};

module.exports = { data, options, run };