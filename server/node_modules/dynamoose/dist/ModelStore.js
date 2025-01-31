"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Error_1 = require("./Error");
const Model_1 = require("./Model");
const Internal_1 = require("./Internal");
const { internalProperties } = Internal_1.default.General;
let models = {};
const returnObject = (input) => {
    if (input instanceof Model_1.Model) {
        models[input.name] = input;
        return input;
    }
    else if (typeof input === "string") {
        return models[input];
    }
    else {
        throw new Error_1.default.InvalidParameter("You must pass in a Model or model name as a string.");
    }
};
returnObject.clear = () => {
    models = {};
};
/**
 * This method will return all of the models that are linked to the given tableName passed in. It will return `undefined` if the tableName is not linked to any models.
 * @param tableName The name of the table to get the models for.
 * @returns Array of Models.
 */
returnObject.forTableName = (tableName) => {
    const modelsInTable = Object.values(models).filter((model) => model.getInternalProperties(internalProperties).tableName === tableName);
    return modelsInTable.length === 0 ? undefined : modelsInTable;
};
exports.default = returnObject;
