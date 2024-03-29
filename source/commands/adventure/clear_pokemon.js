const { Client, Interaction } = require('discord.js');
const UserMons = require('../../models/userMons');

const data = {
    name: 'clear_pokemon',
    description: 'Clear a user\'s Pokemon data.',
    options: [
        {
            name: 'user',
            type: 6, //user
            description: 'The user whose Pokemon data you want to clear.',
            required: true,
        },
    ],
};

async function run({ interaction, client }) {
    try {
        const userId = interaction.options.getUser('user').id;

        // Find and delete the user's data
        await UserMons.deleteOne({ userId });

        await interaction.reply({
            content: `Successfully cleared Pokemon data for <@${userId}>.`,
            ephemeral: true,
        });
    } catch (error) {
        console.error(`Error clearing Pokemon data: ${error}`);
        await interaction.reply({
            content: 'An error occurred while clearing Pokemon data.',
            ephemeral: true,
        });
    }
}

const options = {
    devOnly: true,
    deleted: false,
};

module.exports = { data, run };