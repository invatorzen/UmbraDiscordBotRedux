const { ApplicationCommandOptionType } = require('discord.js');

const data = {
    name: 'bot-status',
    description: 'Set the status and activity message of the bot.',
    options: [
        {
            name: 'status',
            description: 'The status to set.',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: 'Online', value: 'online' },
                { name: 'Idle', value: 'idle' },
                { name: 'Do Not Disturb', value: 'dnd' },
                { name: 'Invisible', value: 'invisible' },
            ],
        },
        {
            name: 'game',
            description: 'The game to "play.',
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],
};

async function run({ interaction, client }) {
    const status = interaction.options.getString('status');
    const message = interaction.options.getString('message');

    try {
        if (status) {
            await client.user.setStatus(status);
        }
        if (message) {
            await client.user.setActivity(message);
        }
        await interaction.reply('Bot status and activity message updated.');
    } catch (error) {
        console.error('Error setting bot status:', error);
        await interaction.reply('An error occurred while setting the bot status.');
    }
}

const options = {
    deleted: false,
};

module.exports = { data, options, run };