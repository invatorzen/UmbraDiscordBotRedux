const data = {
    name: 'invite',
    description: 'Get an invite link to the server!',
};

function run({ interaction, client }) {
    interaction.reply('https://www.discord.gg/dGQ6cst');
}

module.exports = { data, run };
