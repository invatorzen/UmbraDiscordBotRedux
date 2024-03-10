const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const statData = require('../../assets/statData');
const image = require('../../assets/images'); 

const data = {
    name: 'dex',
    description: 'Sends an embedded message showing off the stats and more of a Pokémon!',
    options: [
        {
            name: 'mon',
            description: 'The mon you\'d like to see the stats of!',
            type: ApplicationCommandOptionType.String,
            required: false,
        }
    ],
};

async function run({ interaction, client }) {
    try {
        const pokemonName = interaction.options.getString('mon');
        
        // Used to randomly select the image
        const randomIndex = Math.floor(Math.random() * image.photo.length);
        const thumbnailURL = image.photo[randomIndex].link;
        
        if (!pokemonName) {
            // Show pretty embedded message with buttons for home and dex links
            const homeButton = new ButtonBuilder()
                .setLabel('Home')
                .setStyle(ButtonStyle.Link)
                .setURL('https://pokemon-umbra.fandom.com/wiki/Pokémon_Umbra_Wiki');

            const dexButton = new ButtonBuilder()
                .setLabel('Dex')
                .setStyle(ButtonStyle.Link)
                .setURL('https://pokemon-umbra.fandom.com/wiki/Pokédex');

            const actionRow = new ActionRowBuilder()
                .addComponents(homeButton, dexButton);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Pokémon Umbra Wiki')
                .setThumbnail(thumbnailURL) // Set thumbnail using the randomly selected photo URL
                .setURL(`https://pokemon-umbra.fandom.com/wiki/Pokémon_Umbra_Wiki`)
                .setDescription('Welcome to the Pokémon Umbra Wiki!\n\nClick the buttons below to explore further.');

            await interaction.reply({ embeds: [embed], components: [actionRow] });
            return;
        }

        // Regular embedded message for showing Pokémon stats
        const capitalizedPokemonName = pokemonName.toLowerCase().charAt(0).toUpperCase() + pokemonName.slice(1);

        // Check if the provided Pokémon name exists in the statData
        if (!statData.pokemon.some(p => p.name === capitalizedPokemonName)) {
            await interaction.reply({ content: "This Pokémon doesn't seem to exist. Use `/dex` to get a link to our Pokédex!", ephemeral: true });
            return;
        }

        const attachment = new AttachmentBuilder(`source/assets/monGraphics/${capitalizedPokemonName}.png`);

        const exampleEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Pokémon Umbra Wiki - ${capitalizedPokemonName}`)
            .setURL(`https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}`)
            .setDescription(`https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}`)
            .setThumbnail(`attachment://${capitalizedPokemonName}.png`)
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: 'Biology', value: `[Physiology](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Physiology)\n[Gender Difference](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Gender_Differences)\n[Behavior](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Behavior)\n[Habitat](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Habitat)`, inline: true },
                { name: 'Game Data', value: `[Pokédex Entry](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Pokédex_Entry)\n[Game Locations](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Game_Locations)\n[Held Items](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Held_Items)\n[Base Stats](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Base_Stats)\n[Type Effectiveness](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Type_Effectiveness)\n[Evolution](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#Evolution)`, inline: true },
                { name: 'Move Data', value: `[Learn by level up](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#By_leveling_up)\n[Learn by TM/HM](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#By_TM/HM)\n[Learn by Move Tutor](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#By_tutoring)\n[Learn by Breeding](https://pokemon-umbra.fandom.com/wiki/${capitalizedPokemonName}#By_Breeding)`, inline: true },
            )
            .setTimestamp()

        interaction.reply({ embeds: [exampleEmbed], files: [attachment] });
    } catch (error) {
        console.error('Error:', error);
        await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
}

const options = {
    deleted: false,
    devOnly: true,
};

module.exports = { data, options, run };