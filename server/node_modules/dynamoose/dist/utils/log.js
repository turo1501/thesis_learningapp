"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const importPackage_1 = require("./importPackage");
exports.default = async (...args) => {
    let log;
    try {
        log = await (0, importPackage_1.default)("dynamoose-logger/dist/emitter");
    }
    catch (e) { } // eslint-disable-line no-empty
    if (log && typeof log === "function") {
        log(...args);
    }
};
