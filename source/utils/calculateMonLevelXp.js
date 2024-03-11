const xpConstants = {
    erratic: (level) => {
        if (level <= 50) {
            return ((level ** 3) * (100 - level)) / 50;
        } else if (level <= 68) {
            return ((level ** 3) * (150 - level)) / 100;
        } else if (level <= 98) {
            return ((level ** 3) * ((1911 - 10 * level) / 3)) / 500;
        } else {
            return ((level ** 3) * (160 - level)) / 100;
        }
    },
    fast: (level) => 0.8 * (level ** 3),
    medium_fast: (level) => level ** 3,
    medium_slow: (level) => 1.2 * (level ** 3) - 15 * (level ** 2) + 100 * level - 140,
    slow: (level) => 1.25 * (level ** 3),
    fluctuating: (level) => {
        if (level <= 15) {
            return (level ** 3) * ((((level + 1) / 3) + 24) / 50);
        } else if (level <= 36) {
            return (level ** 3) * ((level + 14) / 50);
        } else {
            return (level ** 3) * (((level / 2) + 32) / 50);
        }
    }
};

function calculateMonLevelXp(level, xpRate) {
    const calculateXp = xpConstants[xpRate.toLowerCase()];
    if (!calculateXp) {
        throw new Error(`Invalid XP rate: ${xpRate}`);
    }
    return Math.floor(calculateXp(level + 1) - calculateXp(level));
}

module.exports = calculateMonLevelXp;