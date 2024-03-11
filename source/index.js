const { Client } = require('discord.js');
const { CommandKit } = require('commandkit');
const mongoose = require('mongoose');
require('dotenv/config');
const { getRandomPokemonMessage } = require('./events/messageCreate/wildPokemonEvent.js');
const GuildConfiguration = require('./models/GuildConfiguration.js'); // Adjust the path as needed



const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'GuildPresences', 'MessageContent'],
});

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    devGuildIds: [process.env.DEV_GUILD_ID],
    devUserIds: [process.env.DEV_USER_ID],
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
    client.login(process.env.TOKEN);
});

// Schedule getRandomPokemonMessage
const minInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
const maxInterval = 15 * 60 * 1000; // 15 minutes in milliseconds
const interval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
setInterval(async () => {
    try {
        const guilds = await GuildConfiguration.find({});
        for (const guildConfig of guilds) {
            await getRandomPokemonMessage(client, guildConfig.guildId);
        }
    } catch (error) {
        console.error('Error triggering getRandomPokemonMessage:', error);
    }
}, interval);