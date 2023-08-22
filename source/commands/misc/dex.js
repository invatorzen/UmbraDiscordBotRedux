const fs = require('fs');
const { AttachmentBuilder, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');


const data = {
    name: 'dex',
    description: 'Sends an embedded message showing off the stats and more of a Pokémon!',
    options: [
        {
            name: 'mon',
            description: 'The mon you\'d like to see the stats of!',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
};

const options = {
    devOnly: false,
};

async function run({ interaction, client }) {
    //I couldn't get a function working so I did it by capitalizing the first letter and re-stitching the word. Lots of variables :D
    const lower = interaction.options.getString('mon').toLowerCase()
    const first = lower.charAt(0).toUpperCase()
    const second = lower.slice(1)
    const newName = first + second

    const attachment = new AttachmentBuilder(`source/assets/monGraphics/${newName}.png`);

    const exampleEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Pokémon Umbra Wiki - ${newName}`)
    .setURL(`https://pokemon-umbra.fandom.com/wiki/${newName}`)
    .setDescription(`https://pokemon-umbra.fandom.com/wiki/${newName}`)
    .setThumbnail(`attachment://${newName}.png`)
    .addFields(
        { name: '\u200B', value: '\u200B' },
        { name: 'Biology', value: `[Physiology](https://pokemon-umbra.fandom.com/wiki/${newName}#Physiology)\n[Gender Difference](https://pokemon-umbra.fandom.com/wiki/${newName}#Gender_Differences)\n[Behavior](https://pokemon-umbra.fandom.com/wiki/${newName}#Behavior)\n[Habitat](https://pokemon-umbra.fandom.com/wiki/${newName}#Habitat)`, inline: true },
        { name: 'Game Data', value: `[Pokédex Entry](https://pokemon-umbra.fandom.com/wiki/${newName}#Pokédex_Entry)\n[Game Locations](https://pokemon-umbra.fandom.com/wiki/${newName}#Game_Locations)\n[Held Items](https://pokemon-umbra.fandom.com/wiki/${newName}#Held_Items)\n[Base Stats](https://pokemon-umbra.fandom.com/wiki/${newName}#Base_Stats)\n[Type Effectiveness](https://pokemon-umbra.fandom.com/wiki/${newName}#Type_Effectiveness)\n[Evolution](https://pokemon-umbra.fandom.com/wiki/${newName}#Evolution)`, inline: true },
        { name: 'Move Data', value: `[Learn by level up](https://pokemon-umbra.fandom.com/wiki/${newName}#By_leveling_up)\n[Learn by TM/HM](https://pokemon-umbra.fandom.com/wiki/${newName}#By_TM/HM)\n[Learn by Move Tutor](https://pokemon-umbra.fandom.com/wiki/${newName}#By_tutoring)\n[Learn by Breeding](https://pokemon-umbra.fandom.com/wiki/${newName}#By_Breeding)`, inline: true },
    )
    .setTimestamp()

    interaction.reply({ embeds: [exampleEmbed], files: [attachment] });
}

module.exports = { data, options, run };