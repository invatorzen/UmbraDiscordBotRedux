const { ApplicationCommandOptionType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const data = {
    name: 'set-volume',
    description: 'Set the volume in the Player App.',
    options: [
        {
            name: 'volume',
            description: 'A value between 0-100 representing the desired volume in percentage.',
            type: ApplicationCommandOptionType.Number,
            required: true,
        }
    ],
};

async function run({ interaction, client }) {
    const volume = interaction.options.getNumber('volume');

    try {
        if (volume < 0 || volume > 100) {
            return await interaction.reply('Volume must be a value between 0 and 100.');
        }

        const response = await axios.put(`http://${process.env.KENKU_FM_ADDY}:${process.env.KENU_PORT}/v1/playlist/playback/volume`, { volume: volume / 100 }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Response:', response.data);
        await interaction.reply(`Volume set to: ${volume}%`);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await interaction.reply('An error occurred while trying to set the volume.');
    }
}

const options = {
    deleted: false,
};
module.exports = { data, options, run };