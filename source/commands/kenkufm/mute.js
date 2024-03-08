const { ApplicationCommandOptionType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const data = {
    name: 'toggle-mute',
    description: 'Mute or unmute playback in the Player App.',
    options: [
        {
            name: 'mute',
            description: 'Whether the playback should be muted.',
            type: ApplicationCommandOptionType.Boolean,
            required: true,
        }
    ],
};

async function run({ interaction, client }) {
    const mute = interaction.options.getBoolean('mute');

    try {
        const response = await axios.put(`http://${process.env.KENKU_FM_ADDY}:${process.env.KENU_PORT}/v1/playlist/playback/mute`, { mute }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Response:', response.data);
        
        const action = mute ? 'muted' : 'unmuted';
        await interaction.reply(`Playback ${action} successfully!`);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await interaction.reply('An error occurred while trying to mute/unmute playback.');
    }
}

module.exports = { data, run };