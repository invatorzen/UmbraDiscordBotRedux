const { Client, Message } = require('discord.js');
const Level = require('../../models/Level');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const calculateMonLevelXp = require('../../utils/calculateMonLevelXp'); // Import the new module
const cooldowns = new Set();
const UserMons = require('../../models/UserMons'); // Import UserMons model

function getRandomXp(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is exclusive and the minimum is inclusive
}

module.exports = async (message, client) => {
    if (!message.guild || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXp(5, 15);

    const query = {
        userId: message.author.id,
        guildId: message.guild.id,
        guildName: message.guild.name,
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
            
            const userMons = await UserMons.findOne({ userId: message.author.id });
            console.log(`userMons: ${userMons}`);
    
            if (userMons.walkingPokemonIndex == null) {
                console.log(`userMons: ${userMons}`);
            } else {
                console.log(`Checking: userMons.walkingPokemonIndex: ${userMons.walkingPokemonIndex}`);
            }
            // Check if the user has a follower Pokémon
            if (userMons && userMons.walkingPokemonIndex !== null && userMons.pokemon.length > 0) {
                const followingPokemonIndex = userMons.walkingPokemonIndex;
                
                // Check if walkingPokemonIndex is a valid index
                if (followingPokemonIndex >= 0 && followingPokemonIndex < userMons.pokemon.length) {
                    const followingPokemon = userMons.pokemon[followingPokemonIndex];
                    
                    if (followingPokemon) {
                        const pokemonXpToGive = getRandomXp(5, 15);
                        const xpRequired = calculateMonLevelXp(followingPokemon.level, followingPokemon.xp_rate);
                        followingPokemon.xp += pokemonXpToGive;

                        console.log(`Following Pokémon (${followingPokemon.species}) gained ${pokemonXpToGive} XP. Current XP: ${followingPokemon.xp}/${xpRequired}`);

                        if (followingPokemon.xp >= xpRequired) {
                            followingPokemon.xp = 0;
                            followingPokemon.level += 1;
                            message.reply(`Your following Pokémon has leveled up to level ${followingPokemon.level}!`);
                        }

                        // Save the updated following Pokémon object
                        await userMons.save();
                    }
                }
            }

            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 60000);
        } else {
            // If (!level)
            // Create new level
            const newLevel = new Level({
                userName: message.author.username,
                userId: message.author.id,
                guildName: message.guild.name,
                guildId: message.guild.id,
                xp: xpToGive,
            });
            try {
                await newLevel.save();
                cooldowns.add(message.author.id);
                setTimeout(() => {
                    cooldowns.delete(message.author.id);
                }, 60000);
            } catch (error) {
                console.log(`Error saving new level: ${error}`);
                return;
            }
        }

    } catch (error) {
        console.log(`Error giving xp: ${error}`);
    }
}