"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionReturnOptions = void 0;
const internal_1 = require("./aws/ddb/internal");
const utils_1 = require("./utils");
const Error_1 = require("./Error");
const ModelStore_1 = require("./ModelStore");
const Item_1 = require("./Item");
const Internal_1 = require("./Internal");
const { internalProperties } = Internal_1.default.General;
var TransactionReturnOptions;
(function (TransactionReturnOptions) {
    TransactionReturnOptions["request"] = "request";
    TransactionReturnOptions["items"] = "items";
})(TransactionReturnOptions || (exports.TransactionReturnOptions = TransactionReturnOptions = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["get"] = "get";
    TransactionType["write"] = "write";
})(TransactionType || (TransactionType = {}));
function Transaction(transactions, settings, callback) {
    settings = settings !== null && settings !== void 0 ? settings : { "return": TransactionReturnOptions.items };
    if (typeof settings === "function") {
        callback = settings;
        settings = { "return": TransactionReturnOptions.items };
    }
    if (typeof transactions === "function") {
        callback = transactions;
        transactions = null;
    }
    const promise = (async () => {
        if (!Array.isArray(transactions) || transactions.length <= 0) {
            throw new Error_1.default.InvalidParameter("You must pass in an array with items for the transactions parameter.");
        }
        const transactionObjects = await Promise.all(transactions);
        const transactionParams = {
            "TransactItems": transactionObjects
        };
        if (settings.return === TransactionReturnOptions.request) {
            return transactionParams;
        }
        let transactionType;
        if (settings.type) {
            switch (settings.type) {
                case TransactionType.get:
                    transactionType = "transactGetItems";
                    break;
                case TransactionType.write:
                    transactionType = "transactWriteItems";
                    break;
                default:
                    throw new Error_1.default.InvalidParameter("Invalid type option, please pass in \"get\" or \"write\".");
            }
        }
        else {
            transactionType = transactionObjects.map((a) => Object.keys(a)[0]).every((key) => key === "Get") ? "transactGetItems" : "transactWriteItems";
        }
        const tableNames = transactionObjects.map((a) => Object.values(a)[0].TableName);
        const uniqueTableNames = utils_1.default.unique_array_elements(tableNames);
        const tables = uniqueTableNames.map((name) => { var _a; return (_a = ModelStore_1.default.forTableName(name)) === null || _a === void 0 ? void 0 : _a[0].getInternalProperties(internalProperties).table(); });
        const validTables = tables.filter((table) => table !== undefined);
        tables.forEach((table, index) => {
            if (!table) {
                throw new Error_1.default.InvalidParameter(`Table "${uniqueTableNames[index]}" not found. Please register the table with dynamoose before using it in transactions.`);
            }
        });
        await Promise.all(tables.map((table) => table.getInternalProperties(internalProperties).pendingTaskPromise()));
        const instance = tables.reduce((instance, table) => {
            const tableInstance = table.getInternalProperties(internalProperties).instance;
            if (!instance) {
                return tableInstance;
            }
            if (tableInstance !== instance) {
                throw new Error_1.default.InvalidParameter("You must use a single Dynamoose instance for all tables in a transaction.");
            }
            return instance;
        }, undefined);
        // TODO: remove `as any` here (https://stackoverflow.com/q/61111476/894067)
        const result = await (0, internal_1.default)(instance, transactionType, transactionParams);
        return result.Responses ? await Promise.all(result.Responses.map(async (item, index) => {
            const tableName = tableNames[index];
            const table = validTables.find((table) => table.name === tableName);
            const model = await table.getInternalProperties(internalProperties).modelForObject(Item_1.Item.fromDynamo(item.Item));
            return new model.Item(item.Item, { "type": "fromDynamo" }).conformToSchema({ "customTypesDynamo": true, "checkExpiredItem": true, "saveUnknown": true, "type": "fromDynamo" });
        })) : null;
    })();
    if (callback) {
        promise.then((result) => callback(null, result)).catch((error) => callback(error));
    }
    else {
        return promise;
    }
}
exports.default = Transaction;
