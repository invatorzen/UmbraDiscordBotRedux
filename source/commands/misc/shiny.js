const fs = require('fs');
const { AttachmentBuilder, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');


const data = {
    name: 'shiny',
    description: 'Check the shiny of any of our Pokémon!',
    options: [
        {
            name: 'mon',
            description: 'The mon you\'d like to see the shiny of!',
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

  const attachment = new AttachmentBuilder(`source/assets/monGraphics/shiny/${newName}.png`);

  const exampleEmbed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`Pokémon Umbra Wiki - ${newName}`)
    .setURL(`https://pokemon-umbra.fandom.com/wiki/${newName}`)
    .setDescription(`https://pokemon-umbra.fandom.com/wiki/${newName}`)
    .setImage(`attachment://${newName}.png`)
    .setTimestamp()

  interaction.reply({ embeds: [exampleEmbed], files: [attachment] });
}

module.exports = { data, options, run };