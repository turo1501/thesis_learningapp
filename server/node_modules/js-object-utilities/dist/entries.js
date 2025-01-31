"use strict";
const _1 = require(".");
const main = (object, existingKey = "") => {
    return Object.entries(object).reduce((accumulator, entry) => {
        const [key, value] = entry;
        const keyWithExisting = `${existingKey ? `${existingKey}.` : ""}${key}`;
        accumulator.push([keyWithExisting, value]);
        if (typeof value === "object" && !(value instanceof Buffer) && value !== null && !(0, _1.isCircular)(value, keyWithExisting)) {
            accumulator.push(...main(value, keyWithExisting));
        }
        return accumulator;
    }, []);
};
module.exports = main;
