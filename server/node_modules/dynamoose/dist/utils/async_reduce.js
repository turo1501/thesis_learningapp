"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function default_1(array, callbackfn, initialValue) {
    const result = await array.reduce(async (a, b, c, d) => {
        const awaitedAccumulator = await a;
        return callbackfn(awaitedAccumulator, b, c, d);
    }, Promise.resolve(initialValue));
    return result;
}
exports.default = default_1;
