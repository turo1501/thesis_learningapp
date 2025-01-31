"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableIndexChangeType = void 0;
const obj = require("js-object-utilities");
const Internal_1 = require("../../Internal");
const deep_copy_1 = require("../deep_copy");
const { internalProperties } = Internal_1.default.General;
var TableIndexChangeType;
(function (TableIndexChangeType) {
    TableIndexChangeType["add"] = "add";
    TableIndexChangeType["delete"] = "delete";
})(TableIndexChangeType || (exports.TableIndexChangeType = TableIndexChangeType = {}));
const index_changes = async (table, existingIndexes = []) => {
    const output = [];
    const expectedIndexes = await table.getInternalProperties(internalProperties).getIndexes();
    const tableThroughput = table.getInternalProperties(internalProperties).options.throughput;
    // Indexes to delete
    const identicalProperties = ["IndexName", "KeySchema", "Projection", "ProvisionedThroughput"]; // This array represents the properties in the indexes that should match between existingIndexes (from DynamoDB) and expectedIndexes. This array will not include things like `IndexArn`, `ItemCount`, etc, since those properties do not exist in expectedIndexes
    if (tableThroughput === "ON_DEMAND") {
        // remove `ProvisionedThroughput` property from properties to compare against
        // because `ProvisionedThroughput` is not set on index schema in case of `ON_DEMAND` throughput
        // meaning `ProvisionedThroughput` is implicitly inherited from the table
        identicalProperties.pop();
    }
    const sanitizeIndex = (index) => {
        if (Array.isArray(index.Projection.NonKeyAttributes)) {
            index.Projection.NonKeyAttributes.sort();
        }
        return index;
    };
    const deleteIndexes = existingIndexes.filter((index) => {
        const cleanedIndex = (0, deep_copy_1.default)(index);
        obj.entries(cleanedIndex).forEach(([key, value]) => {
            if (value === undefined) {
                obj.delete(cleanedIndex, key);
            }
        });
        return !(expectedIndexes.GlobalSecondaryIndexes || []).find((searchIndex) => obj.equals(sanitizeIndex(obj.pick(cleanedIndex, identicalProperties)), sanitizeIndex(obj.pick(searchIndex, identicalProperties))));
    }).map((index) => ({ "name": index.IndexName, "type": TableIndexChangeType.delete }));
    output.push(...deleteIndexes);
    // Indexes to create
    const createIndexes = (expectedIndexes.GlobalSecondaryIndexes || []).filter((index) => ![...output.map((i) => i.name), ...existingIndexes.map((i) => i.IndexName)].includes(index.IndexName)).map((index) => ({
        "type": TableIndexChangeType.add,
        "spec": index
    }));
    output.push(...createIndexes);
    return output;
};
exports.default = index_changes;
