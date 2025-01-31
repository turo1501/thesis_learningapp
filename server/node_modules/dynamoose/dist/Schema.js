"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.IndexType = void 0;
const Error_1 = require("./Error");
const utils_1 = require("./utils");
const Internal_1 = require("./Internal");
const Item_1 = require("./Item");
const Model_1 = require("./Model");
const InternalPropertiesClass_1 = require("./InternalPropertiesClass");
const { internalProperties } = Internal_1.default.General;
class DynamoDBType {
    constructor(obj) {
        Object.keys(obj).forEach((key) => {
            this[key] = obj[key];
        });
    }
    result(typeSettings) {
        // Can't use variable below to check type, see TypeScript issue link below for more information
        // https://github.com/microsoft/TypeScript/issues/37855
        // const isSubType = this.dynamodbType instanceof DynamoDBType; // Represents underlying DynamoDB type for custom types
        const type = (() => {
            if (this.dynamodbType instanceof DynamoDBType) {
                return this.dynamodbType;
            }
            else if (typeof this.dynamodbType === "function") {
                const result = this.dynamodbType(typeSettings);
                if (result instanceof DynamoDBType) {
                    return result;
                }
            }
            return this;
        })();
        const underlyingDynamoDBType = (() => {
            if (this.dynamodbType instanceof DynamoDBType) {
                return this.dynamodbType;
            }
            else if (typeof this.dynamodbType === "function") {
                const returnedType = this.dynamodbType(typeSettings);
                if (returnedType instanceof DynamoDBType) {
                    return returnedType;
                }
            }
        })();
        const dynamodbType = (() => {
            if (this.dynamodbType instanceof DynamoDBType) {
                return this.dynamodbType.dynamodbType;
            }
            else if (typeof this.dynamodbType === "function") {
                const returnedType = this.dynamodbType(typeSettings);
                if (returnedType instanceof DynamoDBType) {
                    return returnedType.dynamodbType;
                }
                else {
                    return returnedType;
                }
            }
            else {
                return this.dynamodbType;
            }
        })();
        const result = {
            "name": this.name,
            dynamodbType,
            "nestedType": this.nestedType,
            "isOfType": this.jsType.func ? (val) => this.jsType.func(val, typeSettings) : (val) => {
                return [{ "value": this.jsType, "type": "main" }, { "value": underlyingDynamoDBType ? type.jsType : null, "type": "underlying" }].filter((a) => Boolean(a.value)).find((jsType) => typeof jsType.value === "string" ? typeof val === jsType.value : val instanceof jsType.value);
            },
            "isSet": false,
            typeSettings
        };
        if (this.dynamicName) {
            result.dynamicName = () => this.dynamicName(typeSettings);
        }
        if (this.customType) {
            const functions = this.customType.functions(typeSettings);
            result.customType = Object.assign(Object.assign({}, this.customType), { functions });
        }
        const isSetAllowed = typeof type.set === "function" ? type.set(typeSettings) : type.set;
        if (isSetAllowed) {
            result.set = {
                "name": `${this.name} Set`,
                "isSet": true,
                "dynamodbType": `${dynamodbType}S`,
                "isOfType": (val, type, settings = {}) => {
                    if (type === "toDynamo") {
                        return !settings.saveUnknown && Array.isArray(val) && val.every((subValue) => result.isOfType(subValue)) || val instanceof Set && [...val].every((subValue) => result.isOfType(subValue));
                    }
                    else {
                        return val instanceof Set;
                    }
                },
                "toDynamo": (val) => Array.isArray(val) ? new Set(val) : val,
                typeSettings
            };
            if (this.dynamicName) {
                result.set.dynamicName = () => `${this.dynamicName(typeSettings)} Set`;
            }
            if (this.customType) {
                result.set.customType = {
                    "functions": {
                        "toDynamo": (val) => val.map(result.customType.functions.toDynamo),
                        "fromDynamo": (val) => new Set([...val].map(result.customType.functions.fromDynamo)),
                        "isOfType": (val, type) => {
                            if (type === "toDynamo") {
                                return (val instanceof Set || Array.isArray(val) && new Set(val).size === val.length) && [...val].every((item) => result.customType.functions.isOfType(item, type));
                            }
                            else {
                                return val instanceof Set;
                            }
                        }
                    }
                };
            }
        }
        return result;
    }
}
const attributeTypesMain = (() => {
    const numberType = new DynamoDBType({ "name": "Number", "dynamodbType": "N", "set": true, "jsType": "number" });
    const stringType = new DynamoDBType({ "name": "String", "dynamodbType": "S", "set": true, "jsType": "string" });
    const booleanType = new DynamoDBType({ "name": "Boolean", "dynamodbType": "BOOL", "jsType": "boolean" });
    return [
        new DynamoDBType({ "name": "Any", "jsType": { "func": () => true } }),
        new DynamoDBType({ "name": "Null", "dynamodbType": "NULL", "set": false, "jsType": { "func": (val) => val === null } }),
        new DynamoDBType({ "name": "Buffer", "dynamodbType": "B", "set": true, "jsType": Buffer }),
        booleanType,
        new DynamoDBType({ "name": "Array", "dynamodbType": "L", "jsType": { "func": Array.isArray }, "nestedType": true }),
        new DynamoDBType({ "name": "Object", "dynamodbType": "M", "jsType": { "func": (val) => Boolean(val) && (val.constructor === undefined || val.constructor === Object) }, "nestedType": true }),
        numberType,
        stringType,
        new DynamoDBType({ "name": "Date", "dynamodbType": (typeSettings) => {
                if (typeSettings && typeSettings.storage === "iso") {
                    return stringType;
                }
                else {
                    return numberType;
                }
            }, "customType": {
                "functions": (typeSettings) => ({
                    "toDynamo": (val) => {
                        if (typeSettings.storage === "seconds") {
                            return Math.round(val.getTime() / 1000);
                        }
                        else if (typeSettings.storage === "iso") {
                            return val.toISOString();
                        }
                        else {
                            return val.getTime();
                        }
                    },
                    "fromDynamo": (val) => {
                        if (typeSettings.storage === "seconds") {
                            return new Date(val * 1000);
                        }
                        else if (typeSettings.storage === "iso") {
                            return new Date(val);
                        }
                        else {
                            return new Date(val);
                        }
                    },
                    "isOfType": (val, type) => {
                        if (type === "toDynamo") {
                            return val instanceof Date;
                        }
                        else {
                            if (typeSettings.storage === "iso") {
                                return typeof val === "string";
                            }
                            else {
                                return typeof val === "number";
                            }
                        }
                    }
                })
            }, "jsType": Date }),
        new DynamoDBType({ "name": "Combine", "dynamodbType": stringType, "set": false, "jsType": String }),
        new DynamoDBType({ "name": "Constant", "dynamicName": (typeSettings) => {
                return `constant ${typeof typeSettings.value} (${typeSettings.value})`;
            }, "customType": {
                "functions": (typeSettings) => ({
                    "isOfType": (val) => typeSettings.value === val
                })
            }, "jsType": { "func": (val, typeSettings) => val === typeSettings.value }, "dynamodbType": (typeSettings) => {
                switch (typeof typeSettings.value) {
                    case "string":
                        return stringType.dynamodbType;
                    case "boolean":
                        return booleanType.dynamodbType;
                    case "number":
                        return numberType.dynamodbType;
                }
            } }),
        new DynamoDBType({ "name": "Model", "dynamicName": (typeSettings) => typeSettings.model.Model.name, "dynamodbType": (typeSettings) => {
                const model = typeSettings.model.Model;
                const hashKey = model.getInternalProperties(internalProperties).getHashKey();
                const rangeKey = model.getInternalProperties(internalProperties).getRangeKey();
                return rangeKey ? "M" : model.getInternalProperties(internalProperties).schemas[0].getAttributeType(hashKey);
            }, "set": (typeSettings) => {
                return !typeSettings.model.Model.getInternalProperties(internalProperties).getRangeKey();
            }, "jsType": { "func": (val) => val.prototype instanceof Item_1.Item }, "customType": {
                "functions": (typeSettings) => ({
                    "toDynamo": (val) => {
                        var _a;
                        const model = typeSettings.model.Model;
                        const hashKey = model.getInternalProperties(internalProperties).getHashKey();
                        const rangeKey = model.getInternalProperties(internalProperties).getRangeKey();
                        if (rangeKey) {
                            return {
                                [hashKey]: val[hashKey],
                                [rangeKey]: val[rangeKey]
                            };
                        }
                        else {
                            return (_a = val[hashKey]) !== null && _a !== void 0 ? _a : val;
                        }
                    },
                    "fromDynamo": (val) => val,
                    "isOfType": (val, type) => {
                        var _a;
                        const model = typeSettings.model.Model;
                        const hashKey = model.getInternalProperties(internalProperties).getHashKey();
                        const rangeKey = model.getInternalProperties(internalProperties).getRangeKey();
                        if (rangeKey) {
                            return typeof val === "object" && val[hashKey] && val[rangeKey];
                        }
                        else {
                            return utils_1.default.dynamoose.getValueTypeCheckResult(model.getInternalProperties(internalProperties).schemas[0], (_a = val[hashKey]) !== null && _a !== void 0 ? _a : val, hashKey, { type }, {}).isValidType;
                        }
                    }
                })
            } })
    ];
})();
const attributeTypes = utils_1.default.array_flatten(attributeTypesMain.filter((checkType) => !checkType.customType).map((checkType) => checkType.result()).map((a) => [a, a.set])).filter((a) => Boolean(a));
var IndexType;
(function (IndexType) {
    /**
     * A global secondary index (GSI) is a secondary index in a DynamoDB table that is not local to a single partition key value.
     */
    IndexType["global"] = "global";
    /**
     * A local secondary index (LSI) is a secondary index in a DynamoDB table that is local to a single partition key value.
     */
    IndexType["local"] = "local";
})(IndexType || (exports.IndexType = IndexType = {}));
function getTimestampAttributes(timestamps) {
    if (!timestamps) {
        return [];
    }
    const createdAtArray = Array.isArray(timestamps.createdAt) ? timestamps.createdAt : [timestamps.createdAt];
    const updatedAtArray = Array.isArray(timestamps.updatedAt) ? timestamps.updatedAt : [timestamps.updatedAt];
    const combinedArray = [];
    function forEachFunc(type, inputArray) {
        return (val) => {
            if (typeof val === "string") {
                inputArray.push({
                    "name": val,
                    "value": Date,
                    type
                });
            }
            else if (val) {
                Object.entries(val).forEach(([key, value]) => {
                    inputArray.push({
                        "name": key,
                        "value": value,
                        type
                    });
                });
            }
        };
    }
    createdAtArray.forEach(forEachFunc("createdAt", combinedArray));
    updatedAtArray.forEach(forEachFunc("updatedAt", combinedArray));
    return combinedArray;
}
class Schema extends InternalPropertiesClass_1.InternalPropertiesClass {
    /**
     * You can use this method to create a schema. The `schema` parameter is an object defining your schema, each value should be a type or object defining the type with additional settings (listed below).
     *
     * The `options` parameter is an optional object with the following options:
     *
     * | Name | Type | Default | Information
     * |---|---|---|---|
     * | `saveUnknown` | array \| boolean | false | This setting lets you specify if the schema should allow properties not defined in the schema. If you pass `true` in for this option all unknown properties will be allowed. If you pass in an array of strings, only properties that are included in that array will be allowed. If you pass in an array of strings, you can use `*` to indicate a wildcard nested property one level deep, or `**` to indicate a wildcard nested property infinite levels deep (ex. `["person.*", "friend.**"]` will allow you store a property `person` with 1 level of unknown properties and `friend` with infinitely nested level unknown properties). If you retrieve items from DynamoDB with `saveUnknown` enabled, all custom Dynamoose types will be returned as the underlying DynamoDB type (ex. Dates will be returned as a Number representing number of milliseconds since Jan 1 1970).
     * | `timestamps` | boolean \| object | false | This setting lets you indicate to Dynamoose that you would like it to handle storing timestamps in your items for both creation and most recent update times. If you pass in an object for this setting you must specify two keys `createdAt` & `updatedAt`, each with a value of a string or array of strings being the name of the attribute(s) for each timestamp. You can also set each of the `createdAt` & `updatedAt` properties equal to a Schema object. The keys of this Schema object represent the name of the attributes, with the value allowing for customization such as changing the storage type of the date. If you pass in `null` for either of those keys that specific timestamp won't be added to the schema. If you set this option to `true` it will use the default attribute names of `createdAt` & `updatedAt`.
     * | `get` | function \| async function | undefined | You can use a get function on the schema to be run whenever retrieving an item from DynamoDB. Dynamoose will pass the entire item into this function and you must return the new value of the entire object you want Dynamoose to return to the application. This function will be run after all property `get` functions are run.
     * | `set` | function \| async function | undefined | You can use a set function on the schema to be run whenever saving an item to DynamoDB. It will also be used when retrieving an item (ie. `get`, `query`, `update`, etc). Dynamoose will pass the entire item into this function and you must return the new value of the entire object you want Dynamoose to save to DynamoDB. This function will be run after all property `set` functions are run.
     * | `validate` | function \| async function | undefined | You can use a validate function on the schema to ensure the value passes a given validation before saving the item. Dynamoose will pass the entire item into this function and you must return a boolean (`true` if validation passes or `false` if validation fails) or throw an error. This function will be run after all property `validate` functions are run.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     * const schema = new dynamoose.Schema({
     * 	"id": String,
     * 	"age": Number
     * }, {
     * 	"saveUnknown": true,
     * 	"timestamps": true
     * });
     * ```
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const schema = new dynamoose.Schema({
     * 	"id": String,
     * 	"person": Object,
     * 	"friend": Object
     * }, {
     * 	"saveUnknown": [
     * 		"person.*", // store 1 level deep of nested properties in `person` property
     * 		"friend.**" // store infinite levels deep of nested properties in `friend` property
     * 	],
     * });
     * ```
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const schema = new dynamoose.Schema({
     * 	"id": String,
     * 	"age": {
     * 		"type": Number,
     * 		"default": 5
     * 	}
     * });
     * ```
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const schema = new dynamoose.Schema({
     * 	"id": String,
     * 	"name": String
     * }, {
     * 	"timestamps": {
     * 		"createdAt": "createDate",
     * 		"updatedAt": null // updatedAt will not be stored as part of the timestamp
     * 	}
     * });
     * ```
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const schema = new dynamoose.Schema({
     * 	"id": String,
     * 	"name": String
     * }, {
     * 	"timestamps": {
     * 		"createdAt": ["createDate", "creation"],
     * 		"updatedAt": ["updateDate", "updated"]
     * 	}
     * });
     * ```
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const schema = new dynamoose.Schema({
     * 	"id": String,
     * 	"name": String
     * }, {
     * 	"timestamps": {
     * 		"createdAt": {
     * 			"created_at": {
     * 				"type": {
     * 					"value": Date,
     * 					"settings": {
     * 						"storage": "iso"
     * 					}
     * 				}
     * 			}
     * 		},
     * 		"updatedAt": {
     * 			"updated": {
     * 				"type": {
     * 					"value": Date,
     * 					"settings": {
     * 						"storage": "seconds"
     * 					}
     * 				}
     * 			}
     * 		}
     * 	}
     * });
     * ```
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const schema = new dynamoose.Schema({
     * 	"id": String,
     * 	"name": String
     * }, {
     * 	"validate": (obj) => {
     * 		if (!obj.id.beginsWith(name[0])) {
     * 			throw new Error("id first letter of name.");
     * 		}
     * 		return true;
     * 	}
     * });
     * ```
     * @param object The schema object.
     * @param settings The settings to apply to the schema.
     */
    constructor(object, settings = {}) {
        super();
        if (!object || typeof object !== "object" || Array.isArray(object)) {
            throw new Error_1.default.InvalidParameterType("Schema initialization parameter must be an object.");
        }
        if (Object.keys(object).length === 0) {
            throw new Error_1.default.InvalidParameter("Schema initialization parameter must not be an empty object.");
        }
        if (settings.timestamps === true) {
            settings.timestamps = {
                "createdAt": "createdAt",
                "updatedAt": "updatedAt"
            };
        }
        if (settings.timestamps) {
            const combinedArray = getTimestampAttributes(settings.timestamps);
            combinedArray.forEach((prop) => {
                if (object[prop.name]) {
                    throw new Error_1.default.InvalidParameter("Timestamp attributes must not be defined in schema.");
                }
                object[prop.name] = prop.value;
            });
        }
        let parsedSettings = Object.assign({}, settings);
        const parsedObject = Object.assign({}, object);
        utils_1.default.object.entries(parsedObject).filter((entry) => entry[1] instanceof Schema).forEach((entry) => {
            const [key, value] = entry;
            let newValue = {
                "type": Object,
                "schema": value.getInternalProperties(internalProperties).schemaObject
            };
            if (key.endsWith(".schema")) {
                newValue = value.getInternalProperties(internalProperties).schemaObject;
            }
            const subSettings = Object.assign({}, value.getInternalProperties(internalProperties).settings);
            Object.entries(subSettings).forEach((entry) => {
                const [settingsKey, settingsValue] = entry;
                switch (settingsKey) {
                    case "saveUnknown":
                        subSettings[settingsKey] = typeof subSettings[settingsKey] === "boolean" ? [`${key}.**`] : settingsValue.map((val) => `${key}.${val}`);
                        break;
                    case "timestamps":
                        subSettings[settingsKey] = Object.entries(subSettings[settingsKey]).reduce((obj, entity) => {
                            const [subKey, subValue] = entity;
                            obj[subKey] = Array.isArray(subValue) ? subValue.map((subValue) => `${key}.${subValue}`) : `${key}.${subValue}`;
                            return obj;
                        }, {});
                        break;
                }
            });
            parsedSettings = utils_1.default.merge_objects.main({ "combineMethod": "array_merge_new_array" })(parsedSettings, subSettings);
            utils_1.default.object.set(parsedObject, key, newValue);
        });
        utils_1.default.object.entries(parsedObject).forEach((entry) => {
            const key = entry[0];
            const value = entry[1];
            if (!key.endsWith(".type") && !key.endsWith(".0")) {
                if (value && value.Model && value.Model instanceof Model_1.Model) {
                    utils_1.default.object.set(parsedObject, key, { "type": value });
                }
                else if (value && Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (item && item.Model && item.Model instanceof Model_1.Model) {
                            utils_1.default.object.set(parsedObject, `${key}.${index}`, { "type": item });
                        }
                    });
                }
            }
        });
        const mapSettingNames = [
            "map",
            "alias",
            "aliases"
        ];
        const defaultMapSettingNames = [
            "defaultMap",
            "defaultAlias"
        ];
        this.setInternalProperties(internalProperties, {
            "schemaObject": parsedObject,
            "settings": parsedSettings,
            "getMapSettingValuesForKey": (key, settingNames) => utils_1.default.array_flatten(mapSettingNames.filter((name) => !settingNames || settingNames.includes(name)).map((mapSettingName) => {
                const result = this.getAttributeSettingValue(mapSettingName, key);
                if (Array.isArray(result)) {
                    const filteredArray = result.filter((item) => Boolean(item));
                    return filteredArray.length === 0 ? undefined : [...new Set(filteredArray)];
                }
                return result;
            }).filter((v) => Boolean(v))),
            "getMapSettingObject": () => {
                const attributes = this.attributes();
                return attributes.reduce((obj, attribute) => {
                    const mapSettingValues = this.getInternalProperties(internalProperties).getMapSettingValuesForKey(attribute);
                    mapSettingValues.forEach((val) => {
                        obj[val] = attribute;
                    });
                    return obj;
                }, {});
            },
            "getDefaultMapAttribute": (attribute) => {
                for (const name of defaultMapSettingNames) {
                    const result = this.getAttributeSettingValue(name, attribute);
                    if (result) {
                        return result;
                    }
                }
            },
            "getIndexAttributes": () => {
                return this.attributes()
                    .map((attribute) => ({
                    "index": this.getAttributeSettingValue("index", attribute),
                    attribute
                }))
                    .filter((obj) => Array.isArray(obj.index) ? obj.index.some((index) => Boolean(index)) : obj.index)
                    .reduce((accumulator, currentValue) => {
                    if (Array.isArray(currentValue.index)) {
                        currentValue.index.forEach((currentIndex) => {
                            accumulator.push(Object.assign(Object.assign({}, currentValue), { "index": currentIndex }));
                        });
                    }
                    else {
                        accumulator.push(currentValue);
                    }
                    return accumulator;
                }, []);
            },
            "getTimestampAttributes": () => getTimestampAttributes(settings.timestamps)
        });
        const checkAttributeNameDots = (object /*, existingKey = ""*/) => {
            Object.keys(object).forEach((key) => {
                if (key.includes(".")) {
                    throw new Error_1.default.InvalidParameter("Attributes must not contain dots.");
                }
                // TODO: lots of `as` statements in the two lines below. We should clean that up.
                if (typeof object[key] === "object" && object[key] !== null && object[key].schema) {
                    checkAttributeNameDots(object[key].schema /*, key*/);
                }
            });
        };
        checkAttributeNameDots(this.getInternalProperties(internalProperties).schemaObject);
        const checkMultipleArraySchemaElements = (key) => {
            let attributeType = [];
            try {
                const tmpAttributeType = this.getAttributeType(key);
                attributeType = Array.isArray(tmpAttributeType) ? tmpAttributeType : [tmpAttributeType];
            }
            catch (e) { } // eslint-disable-line no-empty
            if (attributeType.some((type) => type === "L") && (this.getAttributeValue(key).schema || []).length > 1) {
                throw new Error_1.default.InvalidParameter("You must only pass one element into schema array.");
            }
        };
        this.attributes().forEach((key) => checkMultipleArraySchemaElements(key));
        const hashRangeKeys = this.attributes().reduce((val, key) => {
            const hashKey = this.getAttributeSettingValue("hashKey", key);
            const rangeKey = this.getAttributeSettingValue("rangeKey", key);
            const isHashKey = Array.isArray(hashKey) ? hashKey.every((item) => Boolean(item)) : hashKey;
            const isRangeKey = Array.isArray(rangeKey) ? rangeKey.every((item) => Boolean(item)) : rangeKey;
            if (isHashKey) {
                val.hashKeys.push(key);
            }
            if (isRangeKey) {
                val.rangeKeys.push(key);
            }
            if (isHashKey && isRangeKey) {
                val.hashAndRangeKeyAttributes.push(key);
            }
            return val;
        }, { "hashKeys": [], "rangeKeys": [], "hashAndRangeKeyAttributes": [] });
        const keyTypes = ["hashKey", "rangeKey"];
        keyTypes.forEach((keyType) => {
            if (hashRangeKeys[`${keyType}s`].length > 1) {
                throw new Error_1.default.InvalidParameter(`Only one ${keyType} allowed per schema.`);
            }
            if (hashRangeKeys[`${keyType}s`].find((key) => key.includes("."))) {
                throw new Error_1.default.InvalidParameter(`${keyType} must be at root object and not nested in object or array.`);
            }
        });
        if (hashRangeKeys.hashAndRangeKeyAttributes.length > 0) {
            throw new Error_1.default.InvalidParameter(`Attribute ${hashRangeKeys.hashAndRangeKeyAttributes[0]} must not be both hashKey and rangeKey`);
        }
        this.attributes().forEach((key) => {
            const attributeSettingValue = this.getAttributeSettingValue("index", key);
            if (key.includes(".") && (Array.isArray(attributeSettingValue) ? attributeSettingValue.some((singleValue) => Boolean(singleValue)) : attributeSettingValue)) {
                throw new Error_1.default.InvalidParameter("Index must be at root object and not nested in object or array.");
            }
        });
        this.attributes().forEach((key) => {
            try {
                this.getAttributeType(key);
            }
            catch (e) {
                if (!e.message.includes("is not allowed to be a set")) {
                    throw new Error_1.default.InvalidParameter(`Attribute ${key} does not have a valid type.`);
                }
            }
        });
        this.attributes().forEach((key) => {
            const mapSettingValues = mapSettingNames.map((name) => this.getInternalProperties(internalProperties).getMapSettingValuesForKey(key, [name])).filter((v) => Boolean(v) && (!Array.isArray(v) || v.length > 0));
            if (mapSettingValues.length > 1) {
                throw new Error_1.default.InvalidParameter("Only one of map, alias, or aliases can be specified per attribute.");
            }
        });
        this.attributes().forEach((key) => {
            const defaultMapSettingValues = utils_1.default.array_flatten(defaultMapSettingNames.map((mapSettingName) => {
                const result = this.getAttributeSettingValue(mapSettingName, key);
                if (Array.isArray(result)) {
                    const filteredArray = result.filter((item) => Boolean(item));
                    return filteredArray.length === 0 ? undefined : filteredArray;
                }
                return result;
            }).filter((v) => Boolean(v)));
            if (defaultMapSettingValues.length > 1) {
                throw new Error_1.default.InvalidParameter("Only defaultMap or defaultAlias can be specified per attribute.");
            }
            const defaultMapSettingValue = defaultMapSettingValues[0];
            const defaultMapAttribute = defaultMapSettingNames.find((mapSettingName) => this.getAttributeSettingValue(mapSettingName, key));
            if (defaultMapSettingValue) {
                if (!this.getInternalProperties(internalProperties).getMapSettingValuesForKey(key).includes(defaultMapSettingValue) && defaultMapSettingValue !== key) {
                    throw new Error_1.default.InvalidParameter(`${defaultMapAttribute} must exist in map, alias, or aliases property or be equal to attribute name.`);
                }
            }
        });
        const mapAttributes = this.attributes().map((key) => this.getInternalProperties(internalProperties).getMapSettingValuesForKey(key));
        const mapAttributesFlattened = utils_1.default.array_flatten(mapAttributes);
        const mapAttributesSet = new Set(mapAttributesFlattened);
        if (mapAttributesSet.size !== mapAttributesFlattened.length) {
            throw new Error_1.default.InvalidParameter("Each properties map, alias, or aliases properties must be unique across the entire schema.");
        }
        if ([...mapAttributesSet].some((key) => this.attributes().includes(key))) {
            throw new Error_1.default.InvalidParameter("Each properties map, alias, or aliases properties must be not be used as a property name in the schema.");
        }
    }
    /**
     * This property returns an array of strings with each string being the name of an attribute. Only attributes that are indexes are returned.
     *
     * ```js
     * const schema = new Schema({
     * 	"id": String,
     * 	"name": {
     * 		"type": String,
     * 		"index": true
     * 	}
     * });
     * console.log(schema.indexAttributes); // ["name"]
     * ```
     */
    get indexAttributes() {
        return this.getInternalProperties(internalProperties).getIndexAttributes().map((key) => key.attribute);
    }
    async getCreateTableAttributeParams(model) {
        const hashKey = this.hashKey;
        const AttributeDefinitions = [
            {
                "AttributeName": hashKey,
                "AttributeType": this.getSingleAttributeType(hashKey)
            }
        ];
        const AttributeDefinitionsNames = [hashKey];
        const KeySchema = [
            {
                "AttributeName": hashKey,
                "KeyType": "HASH"
            }
        ];
        const rangeKey = this.rangeKey;
        if (rangeKey) {
            AttributeDefinitions.push({
                "AttributeName": rangeKey,
                "AttributeType": this.getSingleAttributeType(rangeKey)
            });
            AttributeDefinitionsNames.push(rangeKey);
            KeySchema.push({
                "AttributeName": rangeKey,
                "KeyType": "RANGE"
            });
        }
        utils_1.default.array_flatten(await Promise.all([this.getInternalProperties(internalProperties).getIndexAttributes(), this.getIndexRangeKeyAttributes()])).map((obj) => obj.attribute).forEach((index) => {
            if (AttributeDefinitionsNames.includes(index)) {
                return;
            }
            AttributeDefinitionsNames.push(index);
            AttributeDefinitions.push({
                "AttributeName": index,
                "AttributeType": this.getSingleAttributeType(index)
            });
        });
        const response = {
            AttributeDefinitions,
            KeySchema
        };
        const { GlobalSecondaryIndexes, LocalSecondaryIndexes } = await this.getIndexes(model);
        if (GlobalSecondaryIndexes) {
            response.GlobalSecondaryIndexes = GlobalSecondaryIndexes;
        }
        if (LocalSecondaryIndexes) {
            response.LocalSecondaryIndexes = LocalSecondaryIndexes;
        }
        return response;
    }
    // This function has the same behavior as `getAttributeType` except if the schema has multiple types, it will throw an error. This is useful for attribute definitions and keys for when you are only allowed to have one type for an attribute
    getSingleAttributeType(key, value, settings) {
        const attributeType = this.getAttributeType(key, value, settings);
        if (Array.isArray(attributeType)) {
            throw new Error_1.default.InvalidParameter(`You can not have multiple types for attribute definition: ${key}.`);
        }
        return attributeType;
    }
    getAttributeType(key, value, settings) {
        try {
            const typeDetails = this.getAttributeTypeDetails(key);
            return Array.isArray(typeDetails) ? typeDetails.map((detail) => detail.dynamodbType) : typeDetails.dynamodbType;
        }
        catch (e) {
            if ((settings === null || settings === void 0 ? void 0 : settings.unknownAttributeAllowed) && e.message === `Invalid Attribute: ${key}` && value) {
                return Object.keys(Item_1.Item.objectToDynamo(value, { "type": "value" }))[0];
            }
            else {
                throw e;
            }
        }
    }
    /**
     * This property returns the property name of your schema's hash key.
     *
     * ```js
     * const schema = new dynamoose.Schema({"id": String});
     * console.log(schema.hashKey); // "id"
     * ```
     */
    get hashKey() {
        return Object.keys(this.getInternalProperties(internalProperties).schemaObject).find((key) => this.getInternalProperties(internalProperties).schemaObject[key].hashKey) || Object.keys(this.getInternalProperties(internalProperties).schemaObject)[0];
    }
    /**
     * This property returns the property name of your schema's range key. It will return undefined if a range key does not exist for your schema.
     * ```js
     * const schema = new dynamoose.Schema({"id": String, "type": {"type": String, "rangeKey": true}});
     * console.log(schema.rangeKey); // "type"
     * ```
     *
     * ```js
     * const schema = new dynamoose.Schema({"id": String});
     * console.log(schema.rangeKey); // undefined
     * ```
     */
    get rangeKey() {
        return Object.keys(this.getInternalProperties(internalProperties).schemaObject).find((key) => this.getInternalProperties(internalProperties).schemaObject[key].rangeKey);
    }
    // This function will take in an attribute and value, and returns the default value if it should be applied.
    async defaultCheck(key, value, settings) {
        const isValueUndefined = typeof value === "undefined" || value === null;
        if (settings.defaults && isValueUndefined || settings.forceDefault && this.getAttributeSettingValue("forceDefault", key)) {
            const defaultValueRaw = this.getAttributeSettingValue("default", key);
            let hasMultipleTypes;
            try {
                hasMultipleTypes = Array.isArray(this.getAttributeType(key));
            }
            catch (e) {
                hasMultipleTypes = false;
            }
            const defaultValue = Array.isArray(defaultValueRaw) && hasMultipleTypes ? defaultValueRaw[0] : defaultValueRaw;
            const isDefaultValueUndefined = typeof defaultValue === "undefined" || defaultValue === null;
            if (!isDefaultValueUndefined) {
                return defaultValue;
            }
        }
    }
    getAttributeSettingValue(setting, key, settings = { "returnFunction": false }) {
        function func(attributeValue) {
            const defaultPropertyValue = (attributeValue || {})[setting];
            return typeof defaultPropertyValue === "function" && !settings.returnFunction ? defaultPropertyValue() : defaultPropertyValue;
        }
        const attributeValue = this.getAttributeValue(key, { "typeIndexOptionMap": settings.typeIndexOptionMap });
        if (Array.isArray(attributeValue)) {
            return attributeValue.map(func);
        }
        else {
            return func(attributeValue);
        }
    }
    getTypePaths(object, settings = { "type": "toDynamo" }) {
        return Object.entries(object).reduce((result, entry) => {
            const [key, value] = entry;
            const fullKey = [settings.previousKey, key].filter((a) => Boolean(a)).join(".");
            let typeCheckResult;
            try {
                typeCheckResult = utils_1.default.dynamoose.getValueTypeCheckResult(this, value, fullKey, settings, {});
            }
            catch (e) {
                if (result && settings.includeAllProperties) {
                    result[fullKey] = {
                        "index": 0,
                        "matchCorrectness": 0.5,
                        "entryCorrectness": [0.5]
                    };
                }
                return result;
            }
            const { typeDetails, matchedTypeDetailsIndex, matchedTypeDetailsIndexes } = typeCheckResult;
            const hasMultipleTypes = Array.isArray(typeDetails);
            const isObject = typeof value === "object" && !(value instanceof Buffer) && value !== null;
            if (hasMultipleTypes) {
                if (matchedTypeDetailsIndexes.length > 1 && isObject) {
                    result[fullKey] = matchedTypeDetailsIndexes.map((index) => {
                        const entryCorrectness = utils_1.default.object.entries(value).map((entry) => {
                            const [subKey, subValue] = entry;
                            try {
                                const { isValidType } = utils_1.default.dynamoose.getValueTypeCheckResult(this, subValue, `${fullKey}.${subKey}`, settings, { "typeIndexOptionMap": { [fullKey]: index } });
                                return isValidType ? 1 : 0;
                            }
                            catch (e) {
                                return 0.5;
                            }
                        });
                        return {
                            index,
                            // 1 = full match
                            // 0.5 = attributes don't exist
                            // 0 = types don't match
                            "matchCorrectness": Math.min(...entryCorrectness),
                            entryCorrectness
                        };
                    }).sort((a, b) => {
                        if (a.matchCorrectness === b.matchCorrectness) {
                            return b.entryCorrectness.reduce((a, b) => a + b, 0) - a.entryCorrectness.reduce((a, b) => a + b, 0);
                        }
                        else {
                            return b.matchCorrectness - a.matchCorrectness;
                        }
                    }).map((a) => a.index)[0];
                }
                if (result[fullKey] === undefined) {
                    result[fullKey] = matchedTypeDetailsIndex;
                }
            }
            else if (settings.includeAllProperties) {
                const matchCorrectness = typeCheckResult.isValidType ? 1 : 0;
                result[fullKey] = {
                    "index": 0,
                    matchCorrectness,
                    "entryCorrectness": [matchCorrectness]
                };
            }
            if (isObject) {
                result = Object.assign(Object.assign({}, result), this.getTypePaths(value, Object.assign(Object.assign({}, settings), { "previousKey": fullKey })));
            }
            return result;
        }, {});
    }
}
exports.Schema = Schema;
Schema.attributeTypes = {
    "findDynamoDBType": (type) => attributeTypes.find((checkType) => checkType.dynamodbType === type),
    "findTypeForValue": (...args) => attributeTypes.find((checkType) => checkType.isOfType(...args))
};
// This function will take in an attribute and value, and throw an error if the property is required and the value is undefined or null.
Schema.prototype.requiredCheck = async function (key, value) {
    const isRequired = this.getAttributeSettingValue("required", key);
    if ((typeof value === "undefined" || value === null) && (Array.isArray(isRequired) ? isRequired.some((val) => Boolean(val)) : isRequired)) {
        throw new Error_1.default.ValidationError(`${key} is a required property but has no value when trying to save item`);
    }
};
Schema.prototype.getIndexRangeKeyAttributes = async function () {
    const indexes = await this.getInternalProperties(internalProperties).getIndexAttributes();
    return indexes.map((index) => index.index.rangeKey).filter((a) => Boolean(a)).map((a) => ({ "attribute": a }));
};
Schema.prototype.getIndexes = async function (model) {
    const indexes = (await this.getInternalProperties(internalProperties).getIndexAttributes()).reduce((accumulator, currentValue) => {
        const indexValue = currentValue.index;
        const attributeValue = currentValue.attribute;
        const isGlobalIndex = indexValue.type === "global" || !indexValue.type;
        const dynamoIndexObject = {
            "IndexName": indexValue.name || `${attributeValue}${isGlobalIndex ? "GlobalIndex" : "LocalIndex"}`,
            "KeySchema": [],
            "Projection": { "ProjectionType": "KEYS_ONLY" }
        };
        if (indexValue.project || typeof indexValue.project === "undefined" || indexValue.project === null) {
            dynamoIndexObject.Projection = Array.isArray(indexValue.project) ? { "ProjectionType": "INCLUDE", "NonKeyAttributes": indexValue.project } : { "ProjectionType": "ALL" };
        }
        if (isGlobalIndex) {
            dynamoIndexObject.KeySchema.push({ "AttributeName": attributeValue, "KeyType": "HASH" });
            if (indexValue.rangeKey) {
                dynamoIndexObject.KeySchema.push({ "AttributeName": indexValue.rangeKey, "KeyType": "RANGE" });
            }
            const throughputObject = utils_1.default.dynamoose.get_provisioned_throughput(indexValue.throughput ? indexValue : model.getInternalProperties(internalProperties).table().getInternalProperties(internalProperties).options.throughput === "ON_DEMAND" ? {} : model.getInternalProperties(internalProperties).table().getInternalProperties(internalProperties).options);
            if ("ProvisionedThroughput" in throughputObject) {
                dynamoIndexObject.ProvisionedThroughput = throughputObject.ProvisionedThroughput;
            }
        }
        else {
            dynamoIndexObject.KeySchema.push({ "AttributeName": this.hashKey, "KeyType": "HASH" });
            dynamoIndexObject.KeySchema.push({ "AttributeName": attributeValue, "KeyType": "RANGE" });
        }
        const accumulatorKey = isGlobalIndex ? "GlobalSecondaryIndexes" : "LocalSecondaryIndexes";
        if (!accumulator[accumulatorKey]) {
            accumulator[accumulatorKey] = [];
        }
        accumulator[accumulatorKey].push(dynamoIndexObject);
        return accumulator;
    }, {});
    indexes.TableIndex = { "KeySchema": [{ "AttributeName": this.hashKey, "KeyType": "HASH" }] };
    const rangeKey = this.rangeKey;
    if (rangeKey) {
        indexes.TableIndex.KeySchema.push({ "AttributeName": rangeKey, "KeyType": "RANGE" });
    }
    return indexes;
};
Schema.prototype.getSettingValue = function (setting) {
    return this.getInternalProperties(internalProperties).settings[setting];
};
Schema.prototype.attributes = function (object, settings) {
    const typePaths = object && this.getTypePaths(object);
    const main = (object, existingKey = "") => {
        return Object.keys(object).reduce((accumulator, key) => {
            const keyWithExisting = `${existingKey ? `${existingKey}.` : ""}${key}`;
            accumulator.push(keyWithExisting);
            if (settings === null || settings === void 0 ? void 0 : settings.includeMaps) {
                accumulator.push(...this.getInternalProperties(internalProperties).getMapSettingValuesForKey(keyWithExisting));
            }
            let attributeType;
            try {
                const tmpAttributeType = this.getAttributeType(keyWithExisting);
                attributeType = Array.isArray(tmpAttributeType) ? tmpAttributeType : [tmpAttributeType];
            }
            catch (e) { } // eslint-disable-line no-empty
            // TODO: using too many `as` statements in the few lines below. Clean that up.
            function recursive(type, arrayTypeIndex) {
                if ((type === "M" || type === "L") && (object[key][arrayTypeIndex] || object[key]).schema) {
                    accumulator.push(...main((object[key][arrayTypeIndex] || object[key]).schema, keyWithExisting));
                }
            }
            if (attributeType) {
                if (typePaths && typePaths[keyWithExisting] !== undefined) {
                    const index = typePaths[keyWithExisting];
                    const type = attributeType[index];
                    recursive(type, index);
                }
                else {
                    attributeType.forEach(recursive);
                }
            }
            // ------------------------------
            return accumulator;
        }, []);
    };
    return main(this.getInternalProperties(internalProperties).schemaObject);
};
Schema.prototype.getAttributeValue = function (key, settings) {
    const previousKeyParts = [];
    let result = ((settings === null || settings === void 0 ? void 0 : settings.standardKey) ? key : key.replace(/\.\d+/gu, ".0")).split(".").reduce((result, part) => {
        if (Array.isArray(result)) {
            const predefinedIndex = settings && settings.typeIndexOptionMap && settings.typeIndexOptionMap[previousKeyParts.join(".")];
            if (predefinedIndex !== undefined) {
                result = result[predefinedIndex];
            }
            else {
                result = result.find((item) => item.schema && item.schema[part]);
            }
        }
        previousKeyParts.push(part);
        return utils_1.default.object.get(result.schema, part);
    }, { "schema": this.getInternalProperties(internalProperties).schemaObject });
    if (Array.isArray(result)) {
        const predefinedIndex = settings && settings.typeIndexOptionMap && settings.typeIndexOptionMap[previousKeyParts.join(".")];
        if (predefinedIndex !== undefined) {
            result = result[predefinedIndex];
        }
    }
    return result;
};
function retrieveTypeInfo(type, isSet, key, typeSettings) {
    const foundType = attributeTypesMain.find((checkType) => checkType.name.toLowerCase() === type.toLowerCase());
    if (!foundType) {
        throw new Error_1.default.InvalidType(`${key} contains an invalid type: ${type}`);
    }
    const parentType = foundType.result(typeSettings);
    if (!parentType.set && isSet) {
        throw new Error_1.default.InvalidType(`${key} with type: ${type} is not allowed to be a set`);
    }
    return isSet ? parentType.set : parentType;
}
// TODO: using too many `as` statements in the function below. We should clean this up.
Schema.prototype.getAttributeTypeDetails = function (key, settings = {}) {
    const standardKey = settings.standardKey ? key : key.replace(/\.\d+/gu, ".0");
    const val = this.getAttributeValue(standardKey, Object.assign(Object.assign({}, settings), { "standardKey": true }));
    if (typeof val === "undefined") {
        throw new Error_1.default.UnknownAttribute(`Invalid Attribute: ${key}`);
    }
    let typeVal = typeof val === "object" && !Array.isArray(val) && val.type ? val.type : val;
    let typeSettings = {};
    if (typeof typeVal === "object" && !Array.isArray(typeVal)) {
        typeSettings = typeVal.settings || {};
        typeVal = typeVal.value;
    }
    const getType = (typeVal) => {
        let type;
        const isThisType = typeVal === Internal_1.default.Public.this;
        const isNullType = typeVal === Internal_1.default.Public.null;
        const isAnyType = typeVal === Internal_1.default.Public.any;
        if (typeof typeVal === "function" || isThisType) {
            if (typeVal.prototype instanceof Item_1.Item || isThisType) {
                type = "model";
                if (isThisType) {
                    const obj = {
                        "getInternalProperties": () => ({
                            "schemas": [this],
                            "getHashKey": () => this.hashKey,
                            "getRangeKey": () => this.rangeKey
                        })
                    };
                    typeSettings.model = { "Model": obj };
                }
                else {
                    typeSettings.model = typeVal;
                }
            }
            else {
                const regexFuncName = /^Function ([^(]+)\(/iu;
                [, type] = typeVal.toString().match(regexFuncName);
            }
        }
        else if (isNullType) {
            type = "null";
        }
        else if (isAnyType) {
            type = "any";
        }
        else if (typeVal.toLowerCase() === "null") {
            throw new Error("Please use dynamoose.type.NULL instead of \"null\" for your type attribute.");
        }
        else if (typeVal.toLowerCase() === "any") {
            throw new Error("Please use dynamoose.type.ANY instead of \"any\" for your type attribute.");
        }
        else {
            type = typeVal;
        }
        return type;
    };
    const result = (Array.isArray(typeVal) ? typeVal : [typeVal]).map((item, index) => {
        item = typeof item === "object" && !Array.isArray(item) && item.type ? item.type : item;
        if (typeof item === "object" && !Array.isArray(item)) {
            typeSettings = item.settings || {};
            item = item.value;
        }
        let type = getType(item);
        const isSet = type.toLowerCase() === "set";
        if (isSet) {
            let schemaValue = this.getAttributeSettingValue("schema", key);
            if (Array.isArray(schemaValue[index])) {
                schemaValue = schemaValue[index];
            }
            const subValue = schemaValue[0];
            type = getType(typeof subValue === "object" && subValue.type ? subValue.type : subValue);
        }
        const returnObject = retrieveTypeInfo(type, isSet, key, typeSettings);
        return returnObject;
    });
    const returnObject = result.length < 2 ? result[0] : result;
    return returnObject;
};
