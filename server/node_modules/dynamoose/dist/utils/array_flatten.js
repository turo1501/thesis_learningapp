"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This function flattens an array non recursively
exports.default = (array) => Array.prototype.concat.apply([], array);
