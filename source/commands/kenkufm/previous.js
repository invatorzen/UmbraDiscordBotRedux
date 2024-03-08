const { ApplicationCommandOptionType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const data = {
    name: 'previous',
    description: 'Plays the previous song in KenkuFM App.',
};

async function run({ interaction, client }) {
    try {
        const response = await axios.post(`http://${process.env.KENKU_FM_ADDY}:${process.env.KENU_PORT}/v1/playlist/playback/previous`, null, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Response:', response.data);
        await interaction.reply('Previous song played successfully!');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await interaction.reply('An error occurred while trying to play the previous song.');
    }
}

module.exports = { data, run };