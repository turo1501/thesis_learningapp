"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This function takes in an array, and returns an object where each key is the value of the key in the object in the array, and the value is the object in the array. In the event that a key is not provided, the value of the key will be the object in the array.
 *
 * @example
 * const array = [{id: 1, name: "test"}, {id: 2, name: "test2"}];
 * const result = keyBy(array, "id");
 * // result = {1: {id: 1, name: "test"}, 2: {id: 2, name: "test2"}}
 *
 * @param array An array to convert to an object.
 * @param key The key to look at in each object in the array to use as the key in the output of the object.
 * @returns An object created from the array where each key is the value of the key in the object in the array, and the value is the object in the array.
 * @private
 */
exports.default = (array, key) => {
    if (!array) {
        return {};
    }
    return array.reduce((result, item) => (Object.assign(Object.assign({}, result), { [key ? item[key] : item]: item })), {});
};
