"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DynamoDB = require("@aws-sdk/client-dynamodb");
function default_1() {
    let customDDB = new DynamoDB.DynamoDB({});
    const func = () => customDDB;
    func.DynamoDB = DynamoDB.DynamoDB;
    func.set = (ddb) => {
        customDDB = ddb;
    };
    func.revert = () => {
        customDDB = new DynamoDB.DynamoDB({});
    };
    func.local = (endpoint = "http://localhost:8000") => {
        func.set(new DynamoDB.DynamoDB({
            endpoint
        }));
    };
    return func;
}
exports.default = default_1;
