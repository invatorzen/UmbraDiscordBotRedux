const { ApplicationCommandOptionType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const data = {
    name: 'loop',
    description: 'Set the repeat mode for the playlist in the Player App.',
    options: [
        {
            name: 'mode',
            description: 'The repeat mode (track, playlist, or off).',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Track',
                    value: 'track'
                },
                {
                    name: 'Playlist',
                    value: 'playlist'
                },
                {
                    name: 'Off',
                    value: 'off'
                }
            ]
        }
    ],
};

async function run({ interaction, client }) {
    const mode = interaction.options.getString('mode');

    try {
        const response = await axios.put(`http://${process.env.KENKU_FM_ADDY}:${process.env.KENU_PORT}/v1/playlist/playback/repeat`, { repeat: mode }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Response:', response.data);
        await interaction.reply(`Repeat mode set to: ${mode}`);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await interaction.reply('An error occurred while trying to set the repeat mode.');
    }
}

module.exports = { data, run };