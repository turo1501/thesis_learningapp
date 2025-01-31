"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = exports.Scan = void 0;
const internal_1 = require("./aws/ddb/internal");
const Error_1 = require("./Error");
const utils_1 = require("./utils");
const Condition_1 = require("./Condition");
const Item_1 = require("./Item");
const General_1 = require("./General");
const Populate_1 = require("./Populate");
const Internal_1 = require("./Internal");
const InternalPropertiesClass_1 = require("./InternalPropertiesClass");
const { internalProperties } = Internal_1.default.General;
var ItemRetrieverTypes;
(function (ItemRetrieverTypes) {
    ItemRetrieverTypes["scan"] = "scan";
    ItemRetrieverTypes["query"] = "query";
})(ItemRetrieverTypes || (ItemRetrieverTypes = {}));
// ItemRetriever is used for both Scan and Query since a lot of the code is shared between the two
// type ItemRetriever = BasicOperators;
class ItemRetriever extends InternalPropertiesClass_1.InternalPropertiesClass {
    exec(callback) {
        let timesRequested = 0;
        const { model } = this.getInternalProperties(internalProperties).internalSettings;
        const table = model.getInternalProperties(internalProperties).table();
        const prepareForReturn = async (result) => {
            if (Array.isArray(result)) {
                result = utils_1.default.merge_objects(...result);
            }
            if (this.getInternalProperties(internalProperties).settings.count) {
                return {
                    "count": result.Count,
                    [`${this.getInternalProperties(internalProperties).internalSettings.typeInformation.pastTense}Count`]: result[`${utils_1.default.capitalize_first_letter(this.getInternalProperties(internalProperties).internalSettings.typeInformation.pastTense)}Count`]
                };
            }
            const array = (await Promise.all(result.Items.map(async (item) => await new model.Item(item, { "type": "fromDynamo" }).conformToSchema({ "customTypesDynamo": true, "checkExpiredItem": true, "saveUnknown": true, "modifiers": ["get"], "type": "fromDynamo", "mapAttributes": true })))).filter((a) => Boolean(a));
            array.lastKey = result.LastEvaluatedKey ? Array.isArray(result.LastEvaluatedKey) ? result.LastEvaluatedKey.map((key) => model.Item.fromDynamo(key)) : model.Item.fromDynamo(result.LastEvaluatedKey) : undefined;
            array.count = result.Count;
            array[`${this.getInternalProperties(internalProperties).internalSettings.typeInformation.pastTense}Count`] = result[`${utils_1.default.capitalize_first_letter(this.getInternalProperties(internalProperties).internalSettings.typeInformation.pastTense)}Count`];
            array[`times${utils_1.default.capitalize_first_letter(this.getInternalProperties(internalProperties).internalSettings.typeInformation.pastTense)}`] = timesRequested;
            array["populate"] = Populate_1.PopulateItems;
            array["toJSON"] = utils_1.default.dynamoose.itemToJSON;
            return array;
        };
        const promise = table.getInternalProperties(internalProperties).pendingTaskPromise().then(() => this.getRequest()).then((request) => {
            const allRequest = (extraParameters = {}) => {
                let promise = (0, internal_1.default)(table.getInternalProperties(internalProperties).instance, this.getInternalProperties(internalProperties).internalSettings.typeInformation.type, Object.assign(Object.assign({}, request), extraParameters));
                timesRequested++;
                if (this.getInternalProperties(internalProperties).settings.all) {
                    promise = promise.then(async (result) => {
                        if (this.getInternalProperties(internalProperties).settings.all.delay && this.getInternalProperties(internalProperties).settings.all.delay > 0) {
                            await utils_1.default.timeout(this.getInternalProperties(internalProperties).settings.all.delay);
                        }
                        let lastKey = result.LastEvaluatedKey;
                        let requestedTimes = 1;
                        while (lastKey && (this.getInternalProperties(internalProperties).settings.all.max === 0 || requestedTimes < this.getInternalProperties(internalProperties).settings.all.max)) {
                            if (this.getInternalProperties(internalProperties).settings.all.delay && this.getInternalProperties(internalProperties).settings.all.delay > 0) {
                                await utils_1.default.timeout(this.getInternalProperties(internalProperties).settings.all.delay);
                            }
                            const nextRequest = await (0, internal_1.default)(table.getInternalProperties(internalProperties).instance, this.getInternalProperties(internalProperties).internalSettings.typeInformation.type, Object.assign(Object.assign(Object.assign({}, request), extraParameters), { "ExclusiveStartKey": lastKey }));
                            timesRequested++;
                            result = utils_1.default.merge_objects(result, nextRequest);
                            // The operation below is safe because right above we are overwriting the entire `result` variable, so there is no chance it'll be reassigned based on an outdated value since it's already been overwritten. There might be a better way to do this than ignoring the rule on the line below.
                            result.LastEvaluatedKey = nextRequest.LastEvaluatedKey; // eslint-disable-line require-atomic-updates
                            lastKey = nextRequest.LastEvaluatedKey;
                            requestedTimes++;
                        }
                        return result;
                    });
                }
                return promise;
            };
            if (this.getInternalProperties(internalProperties).settings.parallel) {
                return Promise.all(new Array(this.getInternalProperties(internalProperties).settings.parallel).fill(0).map((a, index) => allRequest({ "Segment": index })));
            }
            else {
                return allRequest();
            }
        });
        if (callback) {
            promise.then((result) => prepareForReturn(result)).then((result) => callback(null, result)).catch((error) => callback(error));
        }
        else {
            return (async () => {
                const result = await promise;
                const finalResult = await prepareForReturn(result);
                return finalResult;
            })();
        }
    }
    constructor(model, typeInformation, object) {
        super();
        let condition;
        try {
            condition = new Condition_1.Condition(object);
        }
        catch (e) {
            e.message = `${e.message.replace(" is invalid.", "")} is invalid for the ${typeInformation.type} operation.`;
            throw e;
        }
        this.setInternalProperties(internalProperties, {
            "internalSettings": {
                model,
                typeInformation
            },
            "settings": {
                condition
            }
        });
    }
}
Object.getOwnPropertyNames(Condition_1.Condition.prototype).forEach((key) => {
    if (!["requestObject", "constructor"].includes(key)) {
        ItemRetriever.prototype[key] = function (...args) {
            Condition_1.Condition.prototype[key].bind(this.getInternalProperties(internalProperties).settings.condition)(...args);
            return this;
        };
    }
});
ItemRetriever.prototype.getRequest = async function () {
    const { model } = this.getInternalProperties(internalProperties).internalSettings;
    const table = model.getInternalProperties(internalProperties).table();
    const object = Object.assign(Object.assign({}, await this.getInternalProperties(internalProperties).settings.condition.getInternalProperties(internalProperties).requestObject(model, { "conditionString": "FilterExpression", "conditionStringType": "array" })), { "TableName": table.getInternalProperties(internalProperties).name });
    if (this.getInternalProperties(internalProperties).settings.limit) {
        object.Limit = this.getInternalProperties(internalProperties).settings.limit;
    }
    if (this.getInternalProperties(internalProperties).settings.startAt) {
        object.ExclusiveStartKey = Item_1.Item.isDynamoObject(this.getInternalProperties(internalProperties).settings.startAt) ? this.getInternalProperties(internalProperties).settings.startAt : model.Item.objectToDynamo(this.getInternalProperties(internalProperties).settings.startAt);
    }
    const indexes = await model.getInternalProperties(internalProperties).getIndexes();
    if (this.getInternalProperties(internalProperties).settings.index) {
        object.IndexName = this.getInternalProperties(internalProperties).settings.index;
    }
    else if (this.getInternalProperties(internalProperties).internalSettings.typeInformation.type === "query") {
        const comparisonChart = await this.getInternalProperties(internalProperties).settings.condition.getInternalProperties(internalProperties).comparisonChart(model);
        const indexSpec = utils_1.default.find_best_index(indexes, comparisonChart);
        if (!indexSpec.tableIndex) {
            if (!indexSpec.indexName) {
                throw new Error_1.default.InvalidParameter("Index can't be found for query.");
            }
            object.IndexName = indexSpec.indexName;
        }
    }
    function moveParameterNames(val, prefix) {
        const entry = Object.entries(object.ExpressionAttributeNames).find((entry) => entry[1] === val);
        if (!entry) {
            return;
        }
        const [key, value] = entry;
        const filterExpressionIndex = object.FilterExpression.findIndex((item) => item.includes(key));
        const filterExpression = object.FilterExpression[filterExpressionIndex];
        if (filterExpression.includes("attribute_exists") || filterExpression.includes("contains")) {
            return;
        }
        object.ExpressionAttributeNames[`#${prefix}a`] = value;
        delete object.ExpressionAttributeNames[key];
        const valueKey = key.replace("#a", ":v");
        Object.keys(object.ExpressionAttributeValues).filter((key) => key === valueKey || key.startsWith(`${valueKey}_`)).forEach((key) => {
            object.ExpressionAttributeValues[key.replace(new RegExp(":v\\d+"), `:${prefix}v`)] = object.ExpressionAttributeValues[key];
            delete object.ExpressionAttributeValues[key];
        });
        const newExpression = filterExpression.replace(key, `#${prefix}a`).replace(new RegExp(valueKey, "g"), `:${prefix}v`);
        object.KeyConditionExpression = `${object.KeyConditionExpression || ""}${object.KeyConditionExpression ? " AND " : ""}${newExpression}`;
        utils_1.default.object.delete(object.FilterExpression, filterExpressionIndex);
        const previousElementIndex = filterExpressionIndex === 0 ? 0 : filterExpressionIndex - 1;
        if (object.FilterExpression[previousElementIndex] === "AND") {
            utils_1.default.object.delete(object.FilterExpression, previousElementIndex);
        }
    }
    if (this.getInternalProperties(internalProperties).internalSettings.typeInformation.type === "query") {
        const index = utils_1.default.array_flatten(Object.values(indexes)).find((index) => index.IndexName === object.IndexName) || indexes.TableIndex;
        const { hash, range } = index.KeySchema.reduce((res, item) => {
            res[item.KeyType.toLowerCase()] = item.AttributeName;
            return res;
        }, {});
        moveParameterNames(hash, "qh");
        if (range) {
            moveParameterNames(range, "qr");
        }
    }
    if (this.getInternalProperties(internalProperties).settings.consistent) {
        object.ConsistentRead = this.getInternalProperties(internalProperties).settings.consistent;
    }
    if (this.getInternalProperties(internalProperties).settings.count) {
        object.Select = "COUNT";
    }
    if (this.getInternalProperties(internalProperties).settings.parallel) {
        object.TotalSegments = this.getInternalProperties(internalProperties).settings.parallel;
    }
    if (this.getInternalProperties(internalProperties).settings.sort === General_1.SortOrder.descending) {
        object.ScanIndexForward = false;
    }
    if (this.getInternalProperties(internalProperties).settings.attributes) {
        if (!object.ExpressionAttributeNames) {
            object.ExpressionAttributeNames = {};
        }
        object.ProjectionExpression = this.getInternalProperties(internalProperties).settings.attributes.map((attribute) => {
            let expressionAttributeName = "";
            expressionAttributeName = (Object.entries(object.ExpressionAttributeNames).find((entry) => entry[1] === attribute) || [])[0];
            if (!expressionAttributeName) {
                const nextIndex = (Object.keys(object.ExpressionAttributeNames).map((item) => parseInt(item.replace("#a", ""))).filter((item) => !isNaN(item)).reduce((existing, item) => Math.max(item, existing), 0) || 0) + 1;
                expressionAttributeName = `#a${nextIndex}`;
                object.ExpressionAttributeNames[expressionAttributeName] = attribute;
            }
            return expressionAttributeName;
        }).sort().join(", ");
    }
    if (object.FilterExpression && Array.isArray(object.FilterExpression)) {
        object.FilterExpression = utils_1.default.dynamoose.convertConditionArrayRequestObjectToString(object.FilterExpression);
    }
    if (object.FilterExpression === "") {
        delete object.FilterExpression;
    }
    return object;
};
const settings = [
    "limit",
    "startAt",
    "attributes",
    { "name": "count", "boolean": true },
    { "name": "consistent", "boolean": true },
    { "name": "using", "settingsName": "index" }
];
settings.forEach((item) => {
    ItemRetriever.prototype[item.name || item] = function (value) {
        const key = item.settingsName || item.name || item;
        this.getInternalProperties(internalProperties).settings[key] = item.boolean ? !this.getInternalProperties(internalProperties).settings[key] : value;
        return this;
    };
});
ItemRetriever.prototype.all = function (delay = 0, max = 0) {
    this.getInternalProperties(internalProperties).settings.all = { delay, max };
    return this;
};
class Scan extends ItemRetriever {
    exec(callback) {
        return super.exec(callback);
    }
    parallel(value) {
        this.getInternalProperties(internalProperties).settings.parallel = value;
        return this;
    }
    constructor(model, object) {
        super(model, { "type": ItemRetrieverTypes.scan, "pastTense": "scanned" }, object);
    }
}
exports.Scan = Scan;
class Query extends ItemRetriever {
    exec(callback) {
        return super.exec(callback);
    }
    sort(order) {
        this.getInternalProperties(internalProperties).settings.sort = order;
        return this;
    }
    constructor(model, object) {
        super(model, { "type": ItemRetrieverTypes.query, "pastTense": "queried" }, object);
    }
}
exports.Query = Query;
