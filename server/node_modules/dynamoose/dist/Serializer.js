"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serializer = void 0;
const Error_1 = require("./Error");
const utils_1 = require("./utils");
const InternalPropertiesClass_1 = require("./InternalPropertiesClass");
const Internal_1 = require("./Internal");
const { internalProperties } = Internal_1.default.General;
class Serializer extends InternalPropertiesClass_1.InternalPropertiesClass {
    constructor() {
        super();
        this.default = {
            "set": (name) => {
                if (typeof name === "undefined" || name === null) {
                    name = Serializer.defaultName;
                }
                if (!name || typeof name !== "string") {
                    throw new Error_1.default.InvalidParameter("Field name is required and should be of type string");
                }
                if (Object.keys(this.getInternalProperties(internalProperties).serializers).includes(name)) {
                    this.setInternalProperties(internalProperties, Object.assign(Object.assign({}, this.getInternalProperties(internalProperties)), { "defaultSerializer": name }));
                }
            }
        };
        this.setInternalProperties(internalProperties, {
            "serializers": {
                [Serializer.defaultName]: {
                    "modify": (serialized, original) => (Object.assign({}, original))
                }
            },
            "serializeMany": (itemsArray, nameOrOptions) => {
                if (!itemsArray || !Array.isArray(itemsArray)) {
                    throw new Error_1.default.InvalidParameter("itemsArray must be an array of item objects");
                }
                return itemsArray.map((item) => {
                    try {
                        return item.serialize(nameOrOptions);
                    }
                    catch (e) {
                        return this.getInternalProperties(internalProperties).serialize(item, nameOrOptions);
                    }
                });
            },
            "serialize": (item, nameOrOptions = this.getInternalProperties(internalProperties).defaultSerializer) => {
                let options;
                if (typeof nameOrOptions === "string") {
                    options = this.getInternalProperties(internalProperties).serializers[nameOrOptions];
                }
                else {
                    options = nameOrOptions;
                }
                if (!options || !(Array.isArray(options) || typeof options === "object")) {
                    throw new Error_1.default.InvalidParameter("Field options is required and should be an object or array");
                }
                if (Array.isArray(options)) {
                    return utils_1.default.object.pick(item, options);
                }
                return [
                    {
                        "if": Boolean(options.include),
                        "function": () => utils_1.default.object.pick(item, options.include)
                    },
                    {
                        "if": Boolean(options.exclude),
                        "function": (serialized) => utils_1.default.object.delete(serialized, options.exclude)
                    },
                    {
                        "if": Boolean(options.modify),
                        "function": (serialized) => options.modify(serialized, item)
                    }
                ].filter((item) => item.if).reduce((serialized, item) => item.function(serialized), Object.assign({}, item));
            }
        });
        this.default.set();
    }
    add(name, options) {
        if (!name || typeof name !== "string") {
            throw new Error_1.default.InvalidParameter("Field name is required and should be of type string");
        }
        if (!options || !(Array.isArray(options) || typeof options === "object")) {
            throw new Error_1.default.InvalidParameter("Field options is required and should be an object or array");
        }
        this.getInternalProperties(internalProperties).serializers[name] = options;
    }
    delete(name) {
        if (!name || typeof name !== "string") {
            throw new Error_1.default.InvalidParameter("Field name is required and should be of type string");
        }
        if (name === Serializer.defaultName) {
            throw new Error_1.default.InvalidParameter("Can not delete primary default serializer");
        }
        // Removing serializer
        if (Object.keys(this.getInternalProperties(internalProperties).serializers).includes(name)) {
            delete this.getInternalProperties(internalProperties).serializers[name];
        }
        // Reset defaultSerializer to default if removing default serializer
        if (this.getInternalProperties(internalProperties).defaultSerializer === name) {
            this.default.set();
        }
    }
}
exports.Serializer = Serializer;
Serializer.defaultName = "_default";
