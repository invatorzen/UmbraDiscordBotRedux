const { ApplicationCommandOptionType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const data = {
    name: 'pause',
    description: 'Pauses the currently playing track in the KenkuFM App.',
};

async function run({ interaction, client }) {
    try {
        const response = await axios.put(`http://${process.env.KENKU_FM_ADDY}:${process.env.KENU_PORT}/v1/playlist/playback/pause`, null, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Response:', response.data);
        await interaction.reply('Playback paused successfully!');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await interaction.reply('An error occurred while trying to pause.');
    }
}

module.exports = { data, run };