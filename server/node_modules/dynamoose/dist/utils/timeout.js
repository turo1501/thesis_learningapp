"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (time) => {
    const ms = typeof time === "string" ? parseInt(time) : time;
    return new Promise((resolve, reject) => {
        if (isNaN(ms)) {
            reject(`Invalid milliseconds passed in: ${time}`);
        }
        setTimeout(() => resolve(), ms);
    });
};
