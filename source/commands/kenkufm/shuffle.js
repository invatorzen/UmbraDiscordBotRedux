const { ApplicationCommandOptionType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const data = {
    name: 'shuffle',
    description: 'Shuffle the playlist in the Player App.',
    options: [
        {
            name: 'shuffle',
            description: 'Whether to shuffle the playlist.',
            type: ApplicationCommandOptionType.Boolean,
            required: true,
        }
    ],
};

async function run({ interaction, client }) {
    const shuffle = interaction.options.getBoolean('shuffle');

    try {
        const response = await axios.put(`http://${process.env.KENKU_FM_ADDY}:${process.env.KENU_PORT}/v1/playlist/playback/shuffle`, { shuffle }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Response:', response.data);
        const action = shuffle ? 'Shuffled' : 'Unshuffled';
        await interaction.reply(`${action} the playlist successfully!`);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await interaction.reply('An error occurred while trying to shuffle the playlist.');
    }
}

module.exports = { data, run };