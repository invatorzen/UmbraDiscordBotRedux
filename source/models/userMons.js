const { Schema, model } = require('mongoose');
const { randomInt } = require('crypto');

const userMonsSchema = new Schema({
    userId: { type: String, required: true },
    username: { type: String, required: true },
    guildName: { type: String, required: true },
    walkingPokemonIndex : { type: Number, required: false, default: null}, 
    pokemon: [{
        species: { type: String, required: true },
        gender: { type: Number, default: 0 }, // 0 = genderless, 1 = male, 2 = female
        level: { type: Number, default: 1 },
        xp: { type: Number, default: 0 },
        xp_rate: { type: String, required: true },
        evs: {
            hp: { type: Number, default: 0 },
            atk: { type: Number, default: 0 },
            def: { type: Number, default: 0 },
            spAtk: { type: Number, default: 0 },
            spDef: { type: Number, default: 0 },
            speed: { type: Number, default: 0 },
        },
        ivs: {
            hp: { type: Number, default: () => randomInt(0, 32) }, // Random IV between 0 and 31
            atk: { type: Number, default: () => randomInt(0, 32) },
            def: { type: Number, default: () => randomInt(0, 32) },
            spAtk: { type: Number, default: () => randomInt(0, 32) },
            spDef: { type: Number, default: () => randomInt(0, 32) },
            speed: { type: Number, default: () => randomInt(0, 32) },
        },
        shiny: { type: Boolean, default: false },
    }],
});

module.exports = model('UserMons', userMonsSchema);