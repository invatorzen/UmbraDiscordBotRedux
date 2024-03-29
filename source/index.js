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
const minInterval = 15 * 60 * 1000; // 15 minutes in milliseconds
const maxInterval = 35 * 60 * 1000; // 35 minutes in milliseconds

function getRandomInterval() {
    const intervalRange = maxInterval - minInterval;
    return Math.floor(Math.random() * intervalRange) + minInterval;
}

async function spawnPokemonForGuild(guildConfig) {
    try {
        await getRandomPokemonMessage(client, guildConfig.guildId);
    } catch (error) {
        console.error(`Error spawning Pokémon for guild ${guildConfig.guildId}:`, error);
    }
}

async function spawnPokemonForAllGuilds() {
    try {
        const guilds = await GuildConfiguration.find({});
        const promises = guilds.map(spawnPokemonForGuild);
        await Promise.all(promises);
    } catch (error) {
        console.error('Error spawning Pokémon for all guilds:', error);
    }
}

function spawnPokemonWithRandomInterval() {
    const interval = getRandomInterval();
    console.log(`A Pokémon will spawn in: ${interval / 60 / 1000} minutes`);
    setTimeout(async () => {
        await spawnPokemonForAllGuilds();
        spawnPokemonWithRandomInterval();
    }, interval);
}

// Initial spawn
spawnPokemonWithRandomInterval();