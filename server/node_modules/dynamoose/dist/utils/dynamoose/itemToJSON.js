"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemToJSON = void 0;
function itemToJSON() {
    return JSON.parse(JSON.stringify(Array.isArray(this) ? [...this] : Object.assign({}, this)));
}
exports.itemToJSON = itemToJSON;
