"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This function is used to turn `setImmediate` into a promise. This is especially useful if you want to wait for pending promises to fire and complete before running the asserts on a test.
exports.default = () => new Promise((resolve) => setImmediate(resolve));
