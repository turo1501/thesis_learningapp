"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
async function main(instance, method, params) {
    await utils_1.default.log({ "level": "debug", "category": `aws:dynamodb:${method}:request`, "message": JSON.stringify(params, null, 4), "payload": { "request": params } });
    const result = await instance.aws.ddb()[method](params);
    await utils_1.default.log({ "level": "debug", "category": `aws:dynamodb:${method}:response`, "message": typeof result === "undefined" ? "undefined" : JSON.stringify(result, null, 4), "payload": { "response": result } });
    return result;
}
exports.default = main;
