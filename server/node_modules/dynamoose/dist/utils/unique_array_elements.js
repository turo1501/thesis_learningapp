"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obj = require("js-object-utilities");
exports.default = (array) => array.filter((value, index, self) => self.findIndex((searchVal) => obj.equals(searchVal, value)) === index);
