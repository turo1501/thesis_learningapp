"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWS = void 0;
const ddb_1 = require("./ddb");
const converter_1 = require("./converter");
class AWS {
    constructor() {
        this.ddb = (0, ddb_1.default)();
        this.converter = converter_1.default;
    }
}
exports.AWS = AWS;
