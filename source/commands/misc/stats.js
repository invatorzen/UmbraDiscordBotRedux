const {mon} = require('../../assets/statData');
const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');

const data = {
    name: 'stats',
    description: "Sends stat info of specific mon in an embedded message.",
    options: [
        {
          name: 'page',
          description: 'The page of mons you\'d like to see suggested. 25 at a time!',
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: 'Page 1 (1-25)', value: 'page1' },
            { name: 'Page 2 (26-50)', value: 'page2' },
            { name: 'Page 3 (51-75)', value: 'page3' },
          ],
        },
        {
          name: 'mon',
          description: 'The mon you\'d like to see the stats of!',
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            {name: 'Psypole', value: 'Psypole',},
            {name: 'Telefrog', value: 'Psypole',},
            {name: 'Tarotoad', value: 'Psypole',},
            {name: 'Boxeroo', value: 'Psypole',},
            {name: 'Marsupunch', value: 'Psypole',},
            {name: 'Kankombat', value: 'Psypole',},
            {name: 'Seijitsu', value: 'Psypole',},
            {name: 'Kousetsu', value: 'Psypole',},
            {name: 'Mangetsu', value: 'Psypole',},
            {name: 'Rockroach', value: 'Psypole',},
            {name: 'Boulderoach', value: 'Psypole',},
            {name: 'Axolil', value: 'Psypole',},
            {name: 'Visimander', value: 'Psypole',},
            {name: 'Webbat', value: 'Psypole',},
            {name: 'Vamprachne', value: 'Psypole',},
            {name: 'Cutesnoot', value: 'Psypole',},
            {name: 'Coatisnotti', value: 'Psypole',},
            {name: 'Ospuny', value: 'Psypole',},
            {name: 'Osprowl', value: 'Psypole',},
            {name: 'Ospredator', value: 'Psypole',},
            {name: 'Pakrat', value: 'Psypole',},
            {name: 'Bakpakrat', value: 'Psypole',},
            {name: 'Royalarva', value: 'Psypole',},
            {name: 'Superbpa', value: 'Psypole',},
            {name: 'Regalocera', value: 'Psypole',},
          ],
        },
    ],
};

const options = {
    deleted: false,
};

async function run({ interaction, client }) {
  
}

module.exports = { data, options, run };