const { EmbedBuilder } = require('discord.js');
const data = {
    name: 'devs',
    description: 'Get a list of the dev\'s socials!',
};

function run({ interaction, client }) {
    const exampleEmbed = new EmbedBuilder()
	.setColor(0x0099FF)
    .setTitle('Dev Socials')
	.setURL('https://pokemon-umbra.fandom.com/wiki/Pokémon_Umbra_Wiki')
	//.setAuthor({ name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
	.setDescription('Click any of the links below to check out the social!')
	.setThumbnail('https://i.imgur.com/Y4BLr3X.png')
	.addFields(
        { name: '\u200B', value: '\u200B' },
        { name: 'Invatorzen', value: '[Twitter](https://www.twitter.com/Invatorzen) 💬\n[Reddit](https://www.reddit.com/u/buttjuiceYT) 👽\n[YouTube](https://www.youtube.com/channel/UCQkyk0opsfbaUYR_bXl_RxQ) 🎮', inline: true },
        { name: 'PickyPixelArtst', value: '[Twitter](https://www.twitter.com/PickyPixelArtst) 💬\n[DeviantArt](https://www.deviantart.com/thepickypixelartist) 🖌\n[Instagram](https://www.instagram.com/thepickypixelartist) 📷', inline: true },
        { name: 'Francesco', value: '[Twitter](https://twitter.com/fraqfos) 💬\n[Spotify](https://open.spotify.com/artist/7KI2H6tycLRIXllrxrbLDp?si=8gDIshmtSeKFnG03jQvl7Q&nd=1) 🎶\n[YouTube](https://www.youtube.com/channel/UCJL0jcJa2cYNaePSdsS0rQA) 🎮', inline: true},
        { name: 'Sapphire', value: '[Twitter](https://www.twitter.com/sapphire_birdie) 💬\n[DeviantArt](https://www.deviantart.com/princess-phoenix) 🖌', inline: true },
        { name: 'Jerry', value: '[Twitter](https://www.twitter.com/chinglun77) 💬\n[DeviantArt](https://www.deviantart.com/j7663701) 🖌', inline: true},
        { name: 'Adar', value: '[Twitter](https://twitter.com/UmbraNumbersGuy) 💬\n[DeviantArt](https://www.deviantart.com/adarmarcus/gallery) 🖌', inline: true},
        { name: 'Omega', value: '[Twitter](https://twitter.com/who_omega) 💬', inline: true},
        { name: 'SleepLate', value: '[Twitter](https://www.twitter.com/_SleepLate) 💬', inline: true},
        { name: 'Antiant', value: '[Twitter](https://www.twitter.com/Antiant27) 💬', inline: true},
        { name: ' ', value: ' ', inline: true},
        { name: 'Squip', value: '[Twitter](https://twitter.com/squippyboy) 💬', inline: true},
        { name: ' ', value: ' ', inline: true},
        { name: '\u200B', value: '\u200B' },
    )
    .addFields({ name: 'Devs without socials', value: 'Kotaro', inline: true })
	//.setImage('https://i.imgur.com/AfFp7pu.png')
	.setTimestamp();
	//.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

    interaction.reply({ embeds: [exampleEmbed] });
}

module.exports = { data, run };