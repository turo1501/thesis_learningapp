"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTable = exports.waitForActive = exports.updateTimeToLive = exports.createTable = exports.createTableRequest = exports.getTagDetails = exports.getTableDetails = void 0;
const _1 = require(".");
const Internal_1 = require("../Internal");
const { internalProperties } = Internal_1.default.General;
const DynamoDB = require("@aws-sdk/client-dynamodb");
const internal_1 = require("../aws/ddb/internal");
const utils_1 = require("../utils");
const Error_1 = require("../Error");
const index_changes_1 = require("../utils/dynamoose/index_changes");
const types_1 = require("./types");
const defaults = require("./defaults");
// Utility functions
async function getTableDetails(table, settings = {}) {
    const func = async () => {
        const tableDetails = await (0, internal_1.default)(table.getInternalProperties(internalProperties).instance, "describeTable", { "TableName": table.getInternalProperties(internalProperties).name });
        table.getInternalProperties(internalProperties).latestTableDetails = tableDetails; // eslint-disable-line require-atomic-updates
    };
    if (settings.forceRefresh || !table.getInternalProperties(internalProperties).latestTableDetails) {
        if (settings.allowError) {
            try {
                await func();
            }
            catch (e) { } // eslint-disable-line no-empty
        }
        else {
            await func();
        }
    }
    return table.getInternalProperties(internalProperties).latestTableDetails;
}
exports.getTableDetails = getTableDetails;
function getExpectedTags(table) {
    const tagEntries = Object.entries(table.getInternalProperties(internalProperties).options.tags);
    if (tagEntries.length === 0) {
        return undefined;
    }
    else {
        return tagEntries.map(([Key, Value]) => ({
            Key,
            Value
        }));
    }
}
async function getTagDetails(table) {
    const tableDetails = await getTableDetails(table);
    const instance = table.getInternalProperties(internalProperties).instance;
    const tags = await (0, internal_1.default)(instance, "listTagsOfResource", {
        "ResourceArn": tableDetails.Table.TableArn
    });
    while (tags.NextToken) {
        // TODO: The timeout below causes tests to fail, so we disable it for now. We should also probably only run a timeout if we get an error from AWS.
        // await timeout(100); // You can call ListTagsOfResource up to 10 times per second, per account.
        const nextTags = await (0, internal_1.default)(instance, "listTagsOfResource", {
            "ResourceArn": tableDetails.Table.TableArn,
            "NextToken": tags.NextToken
        });
        tags.NextToken = nextTags.NextToken;
        tags.Tags = [...tags.Tags, ...nextTags.Tags];
    }
    return tags;
}
exports.getTagDetails = getTagDetails;
async function createTableRequest(table) {
    const object = Object.assign(Object.assign({ "TableName": table.getInternalProperties(internalProperties).name }, utils_1.default.dynamoose.get_provisioned_throughput(table.getInternalProperties(internalProperties).options)), await table.getInternalProperties(internalProperties).getCreateTableAttributeParams());
    if (table.getInternalProperties(internalProperties).options.tableClass === types_1.TableClass.infrequentAccess) {
        object.TableClass = DynamoDB.TableClass.STANDARD_INFREQUENT_ACCESS;
    }
    const tags = getExpectedTags(table);
    if (tags) {
        object.Tags = tags;
    }
    return object;
}
exports.createTableRequest = createTableRequest;
async function createTable(table, force = false) {
    var _a, _b;
    const tableStatus = (_b = (_a = (await getTableDetails(table, { "allowError": true }))) === null || _a === void 0 ? void 0 : _a.Table) === null || _b === void 0 ? void 0 : _b.TableStatus;
    if (!force && tableStatus === "ACTIVE") {
        table.getInternalProperties(internalProperties).alreadyCreated = true;
        return () => Promise.resolve.bind(Promise)();
    }
    await (0, internal_1.default)(table.getInternalProperties(internalProperties).instance, "createTable", await createTableRequest(table));
}
exports.createTable = createTable;
async function updateTimeToLive(table) {
    let ttlDetails;
    const instance = table.getInternalProperties(internalProperties).instance;
    async function updateDetails() {
        ttlDetails = await (0, internal_1.default)(instance, "describeTimeToLive", {
            "TableName": table.getInternalProperties(internalProperties).name
        });
    }
    await updateDetails();
    function updateTTL() {
        return (0, internal_1.default)(instance, "updateTimeToLive", {
            "TableName": table.getInternalProperties(internalProperties).name,
            "TimeToLiveSpecification": {
                "AttributeName": table.getInternalProperties(internalProperties).options.expires.attribute,
                "Enabled": true
            }
        });
    }
    switch (ttlDetails.TimeToLiveDescription.TimeToLiveStatus) {
        case "DISABLING":
            while (ttlDetails.TimeToLiveDescription.TimeToLiveStatus === "DISABLING") {
                await utils_1.default.timeout(1000);
                await updateDetails();
            }
        // fallthrough
        case "DISABLED":
            await updateTTL();
            break;
        /* istanbul ignore next */
        default:
            break;
    }
}
exports.updateTimeToLive = updateTimeToLive;
function waitForActive(table, forceRefreshOnFirstAttempt = true) {
    return () => new Promise((resolve, reject) => {
        const start = Date.now();
        async function check(count) {
            var _a;
            const waitForActiveSettingValue = table.getInternalProperties(internalProperties).options.waitForActive;
            if (typeof waitForActiveSettingValue !== "boolean" || waitForActiveSettingValue === true) {
                const waitForActiveSetting = typeof waitForActiveSettingValue === "boolean" ? defaults.original.waitForActive : waitForActiveSettingValue;
                try {
                    // Normally we'd want to do `dynamodb.waitFor` here, but since it doesn't work with tables that are being updated we can't use it in this case
                    const tableDetails = (await getTableDetails(table, { "forceRefresh": forceRefreshOnFirstAttempt === true ? forceRefreshOnFirstAttempt : count > 0 })).Table;
                    if (tableDetails.TableStatus === "ACTIVE" && ((_a = tableDetails.GlobalSecondaryIndexes) !== null && _a !== void 0 ? _a : []).every((val) => val.IndexStatus === "ACTIVE")) {
                        return resolve();
                    }
                }
                catch (e) {
                    return reject(e);
                }
                if (count > 0) {
                    waitForActiveSetting.check.frequency === 0 ? await utils_1.default.set_immediate_promise() : await utils_1.default.timeout(waitForActiveSetting.check.frequency);
                }
                if (Date.now() - start >= waitForActiveSetting.check.timeout) {
                    return reject(new Error_1.default.WaitForActiveTimeout(`Wait for active timed out after ${Date.now() - start} milliseconds.`));
                }
                else {
                    check(++count);
                }
            }
        }
        check(0);
    });
}
exports.waitForActive = waitForActive;
async function updateTable(table) {
    const updateAll = typeof table.getInternalProperties(internalProperties).options.update === "boolean" && table.getInternalProperties(internalProperties).options.update;
    const instance = table.getInternalProperties(internalProperties).instance;
    // Throughput
    if (updateAll || table.getInternalProperties(internalProperties).options.update.includes(_1.TableUpdateOptions.throughput)) {
        const currentThroughput = (await getTableDetails(table)).Table;
        const expectedThroughput = utils_1.default.dynamoose.get_provisioned_throughput(table.getInternalProperties(internalProperties).options);
        const isThroughputUpToDate = expectedThroughput.BillingMode === (currentThroughput.BillingModeSummary || {}).BillingMode && expectedThroughput.BillingMode || (currentThroughput.ProvisionedThroughput || {}).ReadCapacityUnits === (expectedThroughput.ProvisionedThroughput || {}).ReadCapacityUnits && currentThroughput.ProvisionedThroughput.WriteCapacityUnits === expectedThroughput.ProvisionedThroughput.WriteCapacityUnits;
        if (!isThroughputUpToDate) {
            const object = Object.assign({ "TableName": table.getInternalProperties(internalProperties).name }, expectedThroughput);
            await (0, internal_1.default)(instance, "updateTable", object);
            await waitForActive(table)();
        }
    }
    // Indexes
    if (updateAll || table.getInternalProperties(internalProperties).options.update.includes(_1.TableUpdateOptions.indexes)) {
        const tableDetails = await getTableDetails(table);
        const existingIndexes = tableDetails.Table.GlobalSecondaryIndexes;
        const updateIndexes = await utils_1.default.dynamoose.index_changes(table, existingIndexes);
        await updateIndexes.reduce(async (existingFlow, index) => {
            await existingFlow;
            const params = {
                "TableName": table.getInternalProperties(internalProperties).name
            };
            if (index.type === index_changes_1.TableIndexChangeType.add) {
                params.AttributeDefinitions = (await table.getInternalProperties(internalProperties).getCreateTableAttributeParams()).AttributeDefinitions;
                params.GlobalSecondaryIndexUpdates = [{ "Create": index.spec }];
            }
            else {
                params.GlobalSecondaryIndexUpdates = [{ "Delete": { "IndexName": index.name } }];
            }
            await (0, internal_1.default)(instance, "updateTable", params);
            await waitForActive(table)();
        }, Promise.resolve());
    }
    // Tags
    if (updateAll || table.getInternalProperties(internalProperties).options.update.includes(_1.TableUpdateOptions.tags)) {
        try {
            const currentTags = (await getTagDetails(table)).Tags;
            const expectedTags = table.getInternalProperties(internalProperties).options.tags;
            let tableDetails;
            const tagsToDelete = currentTags.filter((tag) => expectedTags[tag.Key] !== tag.Value).map((tag) => tag.Key);
            if (tagsToDelete.length > 0) {
                tableDetails = await getTableDetails(table);
                await (0, internal_1.default)(instance, "untagResource", {
                    "ResourceArn": tableDetails.Table.TableArn,
                    "TagKeys": tagsToDelete
                });
            }
            const tagsToAdd = Object.keys(expectedTags).filter((key) => tagsToDelete.includes(key) || !currentTags.some((tag) => tag.Key === key));
            if (tagsToAdd.length > 0) {
                tableDetails = tableDetails || await getTableDetails(table);
                await (0, internal_1.default)(instance, "tagResource", {
                    "ResourceArn": tableDetails.Table.TableArn,
                    "Tags": tagsToAdd.map((key) => ({
                        "Key": key,
                        "Value": expectedTags[key]
                    }))
                });
            }
        }
        catch (error) {
            if (error.name === "UnknownOperationException" && error.message === "Tagging is not currently supported in DynamoDB Local.") {
                console.warn(`Tagging is not currently supported in DynamoDB Local. Skipping tag update for table: ${table.name}`); // eslint-disable-line no-console
            }
            else {
                throw error;
            }
        }
    }
    // Table Class
    if (updateAll || table.getInternalProperties(internalProperties).options.update.includes(_1.TableUpdateOptions.tableClass)) {
        const tableDetails = (await getTableDetails(table)).Table;
        const expectedDynamoDBTableClass = table.getInternalProperties(internalProperties).options.tableClass === types_1.TableClass.infrequentAccess ? DynamoDB.TableClass.STANDARD_INFREQUENT_ACCESS : DynamoDB.TableClass.STANDARD;
        if (!tableDetails.TableClassSummary && expectedDynamoDBTableClass !== DynamoDB.TableClass.STANDARD || tableDetails.TableClassSummary && tableDetails.TableClassSummary.TableClass !== expectedDynamoDBTableClass) {
            const object = {
                "TableName": table.getInternalProperties(internalProperties).name,
                "TableClass": expectedDynamoDBTableClass
            };
            await (0, internal_1.default)(instance, "updateTable", object);
            await waitForActive(table)();
        }
    }
}
exports.updateTable = updateTable;
