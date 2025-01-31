"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.default = (model) => {
    const returnObject = model.Item;
    const keys = __1.default.array_flatten([
        Object.keys(model),
        Object.keys(Object.getPrototypeOf(model)),
        Object.getOwnPropertyNames(Object.getPrototypeOf(model))
    ]).filter((key) => !["constructor", "name"].includes(key));
    keys.forEach((key) => {
        if (typeof model[key] === "object") {
            const main = (key) => {
                __1.default.object.set(returnObject, key, {});
                const value = __1.default.object.get(model, key);
                if (value === null || value.constructor !== Object && value.constructor !== Array) {
                    __1.default.object.set(returnObject, key, value);
                }
                else {
                    Object.keys(value).forEach((subKey) => {
                        const newKey = `${key}.${subKey}`;
                        const subValue = __1.default.object.get(model, newKey);
                        if (typeof subValue === "object") {
                            main(newKey);
                        }
                        else {
                            __1.default.object.set(returnObject, newKey, subValue.bind(model));
                        }
                    });
                }
            };
            main(key);
        }
        else {
            returnObject[key] = model[key].bind(model);
        }
    });
    Object.defineProperty(returnObject, "name", {
        "configurable": false,
        "value": returnObject.Model.name
    });
    return returnObject;
};
