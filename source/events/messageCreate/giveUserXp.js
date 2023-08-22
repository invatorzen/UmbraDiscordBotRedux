const { Client, Message } = require('discord.js');
const Level = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const cooldowns = new Set();

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is exclusive and the minimum is inclusive
}

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 */

module.exports = async (message, client) => {
    if (!message.guild || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXp(5, 15);

    const query = {
        userId: message.author.id,
        guildId: message.guild.id,
    };

    try {
        const level = await Level.findOne(query);

        if (level) {
            level.xp += xpToGive;

            if (level.xp > calculateLevelXp(level.level)) {
              level.xp = 0;
              level.level += 1;
              message.reply(`Congrats ${message.member}, you've leveled up to level ${level.level}!`);
            }

            await level.save().catch((e) => {
                console.log(`Error saving updated level ${e}`);
                return;
            });

            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 60000);
        }

        // If (!level)
        else {
          // Create new level
            const newLevel = new Level({
                userId: message.author.id,
                guildId: message.guild.id,
                xp: xpToGive,
            });

            await newLevel.save();
            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 60000);

            await newLevel.save().catch((error) => {
                console.log(`Error saving new level: ${error}`);
                return;
            });
        }

    } catch (error) {
        console.log(`Error giving xp: ${error}`);
    }
}