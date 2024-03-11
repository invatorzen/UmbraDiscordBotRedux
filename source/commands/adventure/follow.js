const { Client, Interaction, EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const UserMons = require('../../models/UserMons');

const data = {
    name: 'follow',
    description: 'Set a Pokémon as your follower.',
    options: [
        {
            name: 'index',
            description: 'The index of the Pokémon in your collection to set as your follower.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],
};

async function run({ interaction, client }) {
    try {
        // Retrieve the index of the Pokémon from the options
        let index = interaction.options.getInteger('index') - 1;

        // Fetch the user's Pokémon collection
        const userMons = await UserMons.findOne({ userId: interaction.user.id });

        // Validate the index
        if (!userMons || index < 0 || index >= userMons.pokemon.length) {
            await interaction.reply({ content: `Invalid index provided. Please provide a valid index, ranging from 1-${userMons.pokemon.length}.`, ephemeral: true });
            return;
        }

        // Fetch guild name and username
        const guildName = interaction.guild.name;
        const username = interaction.user.username;

        // Update the walking companion index in the database
        await UserMons.findOneAndUpdate(
            { userId: interaction.user.id },
            { walkingPokemonIndex: index, guildName, username },
            { new: true, upsert: true }
        );

        // Respond to the user indicating that their walking companion has been updated
        await interaction.reply({ content: `You've set your follower to Pokémon at index ${index + 1}.`, ephemeral: true });
    } catch (error) {
        console.error('Error setting walking companion:', error);
        await interaction.reply({ content: 'An error occurred while setting your follower.', ephemeral: true });
    }
}

const options = {
    devOnly: true,
    deleted: false,
};

module.exports = { data, options, run };