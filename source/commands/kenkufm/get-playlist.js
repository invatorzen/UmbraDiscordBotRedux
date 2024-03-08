const { ApplicationCommandOptionType } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const data = {
    name: 'show-playlist',
    description: 'Get all playlists and tracks.',
};

async function run({ interaction, client }) {
    try {
        const response = await axios.get(`http://${process.env.KENKU_FM_ADDY}:${process.env.KENU_PORT}/v1/playlist`);
        
        console.log('Response:', response.data);
        
        // Format the response data to send as a Discord message
        const playlists = response.data.playlists.map(playlist => {
            const trackObjects = playlist.tracks.map(trackId => response.data.tracks.find(track => track.id === trackId));
            const tracks = trackObjects.map(track => `  - ${track.title}`);
            return `**Playlist Title:** ${playlist.title}\n**Tracks:**\n${tracks.join('\n')}`;
        });
        
        await interaction.reply(playlists.join('\n\n'));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await interaction.reply('An error occurred while trying to fetch playlists and tracks.');
    }
}

module.exports = { data, run };