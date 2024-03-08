const { ApplicationCommandOptionType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const data = {
    name: 'select-playlist',
    description: 'Play a track or playlist by its ID from Kenku FM.',
    options: [
        {
            name: 'id',
            description: 'The ID of the track or playlist to play.',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Test', value: 'e7aac127-abfb-4920-b3c6-6ac6001dcccf' },
                { name: 'Page 2 (26-50)', value: 'page2' },
                { name: 'Page 3 (51-75)', value: 'page3' },
            ],
        }
    ],
};

async function run({ interaction, client }) {
    try {
        const id = interaction.options.getString('id');
        
        const response = await axios.put(`http://${process.env.KENKU_FM_ADDY}:${process.env.KENU_PORT}/v1/playlist/play`, {
            id
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Response:', response.data);
        
        await interaction.reply('Track or playlist selected and is now playing!');
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await interaction.reply('An error occurred while trying to select and play the track or playlist.');
    }
}
const options = {
    deleted: false,
};

module.exports = { data, options, run };