const {Schema, model} = require('mongoose');
const guildConfigurationSchema = new Schema({
    guildId: {
        type: String,
        required: true,
    },
    suggestionsChannelId: {
        type: [String],
        default: [],
    },
    pokemonWildAreaIds: {
        type: [String],
        default: [],
    },
    pokemonInWild: {
        type: [{ areaId: String, pokemonName: String, level: Number, isShiny: Boolean, xp_rate: String}],
        default: [],
    },
});

module.exports = model('GuildConfiguration', guildConfigurationSchema);