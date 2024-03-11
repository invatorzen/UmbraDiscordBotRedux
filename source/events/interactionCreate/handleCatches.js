const { Client, MessageEmbed, Constants } = require('discord.js');
const { pokemon } = require('../../assets/statData');

// Function to handle the /catch command
async function handleCatchCommand(message) {
    const args = message.content.trim().split(/\s+/);
    if (args.length < 2) {
        // If no Pokémon name is provided
        await message.reply({
            content: 'Bzzt! You need to specify the name of the Pokémon you want to catch!',
            ephemeral: true
        });
        return;
    }

    const pokemonName = args.slice(1).join(' ').toLowerCase();
    const randomPokemon = getRandomPokemonFromMessage(message);

    if (!randomPokemon) {
        // If there's no Pokémon displayed in the message
        await message.reply({
            content: 'Bzzt! No Pokémon is currently displayed.',
            ephemeral: true
        });
        return;
    }

    if (pokemonName === randomPokemon.name.toLowerCase()) {
        // If the Pokémon name matches
        const caughtEmbed = new MessageEmbed()
            .setColor('#00FF00')
            .setTitle('Pokémon Caught!')
            .setDescription(`${randomPokemon.name} was caught by ${message.author}.\nTime: ${new Date().toLocaleString()}`);

        await message.editReply({ embeds: [caughtEmbed] });
    } else {
        // If the Pokémon name doesn't match
        await message.reply({
            content: 'Bzzt! Wrong. Guess again!',
            ephemeral: true
        });
    }
}

// Function to extract the displayed Pokémon from a message
function getRandomPokemonFromMessage(message) {
    const embeds = message.embeds;
    if (!embeds || embeds.length === 0) {
        return null;
    }

    const pokemonEmbed = embeds.find(embed => embed.title === 'Who\'s that Pokémon?');
    if (!pokemonEmbed) {
        return null;
    }

    // Extract the Pokémon name from the description
    const description = pokemonEmbed.description;
    const regex = /Type \`\/catch (.+)\` to catch this Pokémon!/i;
    const match = description.match(regex);
    if (!match || match.length < 2) {
        return null;
    }

    const pokemonName = match[1];
    return pokemon.find(p => p.name === pokemonName);
}

module.exports = {
    handleCatchCommand
};