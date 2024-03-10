const { SlashCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandOptionType } = require('discord-api-types/v9');
const UserMons = require('../../models/UserMons');
const statData = require('../../assets/statData');
const { randomInt } = require('crypto');

const data = {
    name: 'add_pokemon',
    description: 'Give a Pokémon to a specified user.',
    options: [
        {
            name: 'user',
            description: 'The user to give the Pokémon to.',
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: 'pokemon',
            description: 'The name of the Pokémon.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'level',
            description: 'The level of the Pokémon.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
        {
            name: 'gender',
            description: 'The gender of the Pokémon.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            choices: [
                { name: 'Genderless', value: 0 },
                { name: 'Male', value: 1 },
                { name: 'Female', value: 2 }
            ],
        },
        {
            name: 'shiny',
            description: 'Whether the Pokémon is shiny.',
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        },
        {
            name: 'hp_iv',
            description: 'The HP individual value of the Pokémon (0-31).',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: 'atk_iv',
            description: 'The Attack individual value of the Pokémon (0-31).',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: 'def_iv',
            description: 'The Defense individual value of the Pokémon (0-31).',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: 'spa_iv',
            description: 'The Special Attack individual value of the Pokémon (0-31).',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: 'spd_iv',
            description: 'The Special Defense individual value of the Pokémon (0-31).',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        },
        {
            name: 'spe_iv',
            description: 'The Speed individual value of the Pokémon (0-31).',
            type: ApplicationCommandOptionType.Integer,
            required: false,
        }
    ]
};

async function run({ interaction, client }) {
    try {
        const userId = interaction.options.getUser('user').id;
        const pokemonName = interaction.options.getString('pokemon');
        const capitalizedPokemonName = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
        const gender = interaction.options.getInteger('gender');
        let shiny = interaction.options.getBoolean('shiny');
        let level = interaction.options.getInteger('level');
        
        // If shiny option is not provided, generate a random boolean with 1/4096 chance of being true
        if (shiny === null || shiny === undefined) {
            shiny = Math.random() < 1 / 4096;
        }

        const hp_iv = interaction.options.getInteger('hp_iv');
        const atk_iv = interaction.options.getInteger('atk_iv');
        const def_iv = interaction.options.getInteger('def_iv');
        const spa_iv = interaction.options.getInteger('spa_iv');
        const spd_iv = interaction.options.getInteger('spd_iv');
        const spe_iv = interaction.options.getInteger('spe_iv');

        // Check if the capitalized Pokemon name exists in the statData
        if (!statData.pokemon.some(p => p.name === capitalizedPokemonName)) {
            await interaction.reply({ content: "Invalid Pokémon name.", ephemeral: true });
            return;
        }
        if (level < 1 || level > 100) {
            await interaction.reply({ content: 'Invalid level. Must be between 1 and 100', ephemeral: true });
            return;
        }
        // HP Validation
        if (hp_iv !== null && (hp_iv < 0 || hp_iv > 31)) {
            await interaction.reply({ content: 'Invalid HP IV. Must be between 0 and 31.', ephemeral: true });
            return;
        }
        // Atk Validation
        if (atk_iv !== null && (atk_iv < 0 || atk_iv > 31)) {
            await interaction.reply({ content: 'Invalid Attack IV. Must be between 0 and 31.', ephemeral: true });
            return;
        }
        // Def Validation
        if (def_iv !== null && (def_iv < 0 || def_iv > 31)) {
            await interaction.reply({ content: 'Invalid Defense IV. Must be between 0 and 31.', ephemeral: true });
            return;
        }
        // SpA Validation
        if (spa_iv !== null && (spa_iv < 0 || spa_iv > 31)) {
            await interaction.reply({ content: 'Invalid Sp. Atk IV. Must be between 0 and 31.', ephemeral: true });
            return;
        }
        // SpD Validation
        if (spd_iv !== null && (spd_iv < 0 || spd_iv > 31)) {
            await interaction.reply({ content: 'Invalid Sp. Def IV. Must be between 0 and 31.', ephemeral: true });
            return;
        }
        // Spe Validation
        if (spe_iv !== null && (spe_iv < 0 || spe_iv > 31)) {
            await interaction.reply({ content: 'Invalid Speed IV. Must be between 0 and 31.', ephemeral: true });
            return;
        }

        // Fetch XP rate from statData based on the provided Pokémon name
        const pokemonInfo = statData.pokemon.find(p => p.name === capitalizedPokemonName);
        const xpRate = pokemonInfo ? pokemonInfo.xp_rate : 'medium_fast'; // Default to 1 if not found

        // Save the Pokémon to the database
        const userMons = await UserMons.findOneAndUpdate(
            { userId },
            {
                $push: {
                    pokemon: {
                        species: capitalizedPokemonName,
                        gender,
                        shiny,
                        level, // Added level to the pokemon object
                        xp_rate: xpRate, // Added xp_rate to the pokemon object
                        evs: {
                            hp: 0,
                            atk: 0,
                            def: 0,
                            spAtk: 0,
                            spDef: 0,
                            speed: 0,
                        },
                        ivs: {
                            hp: hp_iv ?? randomInt(0, 32),
                            // Add other IV options here
                        },
                    },
                },
            },
            { new: true, upsert: true }
        );

        console.log('UserMons:', userMons); // Log the updated userMons document

        await interaction.reply({ content: 'Pokémon added successfully!', ephemeral: true });
    } catch (error) {
        console.error('Error:', error);
        await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
}

const options = {
    devOnly: true,
    deleted: false,
};

module.exports = { data, options, run };