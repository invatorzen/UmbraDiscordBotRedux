const { Client } = require('discord.js');
const { CommandKit } = require('commandkit');
const mongoose = require('mongoose');
require('dotenv/config');

const client = new Client({
    intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'GuildPresences', 'MessageContent'],
});

new CommandKit({
    client,
    commandsPath: `${__dirname}/commands`,
    eventsPath: `${__dirname}/events`,
    //devGuildIds: [process.env.DEV_GUILD_ID],
    devUserIds: [process.env.DEV_USER_ID],
});

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
    client.login(process.env.TOKEN);
});