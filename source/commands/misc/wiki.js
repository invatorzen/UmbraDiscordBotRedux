const data = {
    name: 'wiki',
    description: 'Sends a link to the Pokémon Umbra wiki!',
};

function run({ interaction, client }) {
    interaction.reply(`https://pokemon-umbra.fandom.com/wiki/Pokémon_Umbra_Wiki`);
}

module.exports = { data, run };
