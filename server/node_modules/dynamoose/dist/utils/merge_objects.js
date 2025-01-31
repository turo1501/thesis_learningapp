"use strict";
// This function is used to merge objects for combining multiple responses.
const keyBy_1 = require("./keyBy");
var MergeObjectsCombineMethod;
(function (MergeObjectsCombineMethod) {
    MergeObjectsCombineMethod["ObjectCombine"] = "object_combine";
    MergeObjectsCombineMethod["ArrayMerge"] = "array_merge";
    MergeObjectsCombineMethod["ArrayMergeNewArray"] = "array_merge_new_array";
})(MergeObjectsCombineMethod || (MergeObjectsCombineMethod = {}));
const main = (settings = { "combineMethod": MergeObjectsCombineMethod.ArrayMerge }) => (...args) => {
    let returnObject;
    args.forEach((arg, index) => {
        if (typeof arg !== "object") {
            throw new Error("You can only pass objects into merge_objects method.");
        }
        if (index === 0) {
            returnObject = arg;
        }
        else {
            if (Array.isArray(returnObject) !== Array.isArray(arg)) {
                throw new Error("You can't mix value types for the merge_objects method.");
            }
            Object.keys(arg).forEach((key) => {
                if (typeof returnObject[key] === "object" && typeof arg[key] === "object" && !Array.isArray(returnObject[key]) && !Array.isArray(arg[key]) && returnObject[key] !== null) {
                    if (settings.combineMethod === MergeObjectsCombineMethod.ObjectCombine) {
                        returnObject[key] = Object.assign(Object.assign({}, returnObject[key]), arg[key]);
                    }
                    else if (settings.combineMethod === MergeObjectsCombineMethod.ArrayMergeNewArray) {
                        returnObject[key] = main(settings)(returnObject[key], arg[key]);
                    }
                    else {
                        returnObject[key] = [returnObject[key], arg[key]];
                    }
                }
                else if (Array.isArray(returnObject[key]) && Array.isArray(arg[key])) {
                    returnObject[key] = settings.arrayItemsMerger ? settings.arrayItemsMerger(returnObject[key], arg[key]) : [...returnObject[key], ...arg[key]];
                }
                else if (Array.isArray(returnObject[key])) {
                    returnObject[key] = [...returnObject[key], arg[key]];
                }
                else if (returnObject[key]) {
                    if (settings.combineMethod === MergeObjectsCombineMethod.ArrayMergeNewArray) {
                        returnObject[key] = [returnObject[key], arg[key]];
                    }
                    else if (typeof returnObject[key] === "number") {
                        returnObject[key] += arg[key];
                    }
                    else {
                        returnObject[key] = arg[key];
                    }
                }
                else {
                    returnObject[key] = arg[key];
                }
            });
        }
    });
    return returnObject;
};
const schemaAttributesMerger = (target, source) => {
    if (!target.length && !source.length) {
        return [];
    }
    const firstElement = target[0] || source[0];
    const keyByIteratee = "AttributeName" in firstElement ? "AttributeName" : "IndexName";
    const targetKeyBy = (0, keyBy_1.default)(target, keyByIteratee);
    const sourceKeyBy = (0, keyBy_1.default)(source, keyByIteratee);
    const merged = main({ "combineMethod": MergeObjectsCombineMethod.ObjectCombine })({}, targetKeyBy, sourceKeyBy);
    return Object.values(merged);
};
const returnObject = main();
returnObject.main = main;
returnObject.MergeObjectsCombineMethod = MergeObjectsCombineMethod;
returnObject.schemaAttributesMerger = schemaAttributesMerger;
module.exports = returnObject;
