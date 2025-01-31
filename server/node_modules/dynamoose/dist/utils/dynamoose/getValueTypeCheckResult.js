"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// export = (schema: Schema, value: any, key: string, settings: {"type": "toDynamo" | "fromDynamo"}, options = {}): {typeDetails: DynamoDBTypeResult | DynamoDBSetTypeResult; isValidType: boolean} => {
// 	const typeDetails = schema.getAttributeTypeDetails(key, options);
// 	const isValidType = [((typeDetails.customType || {}).functions || {}).isOfType, typeDetails.isOfType].filter((a) => Boolean(a)).some((func) => func(value, settings.type));
// 	return {typeDetails, isValidType};
// };
exports.default = (schema, value, key, settings, options) => {
    const typeDetails = schema.getAttributeTypeDetails(key, options);
    const typeDetailsArray = Array.isArray(typeDetails) ? typeDetails : [typeDetails];
    const matchedTypeDetailsIndexes = typeDetailsArray.map((details, index) => {
        var _a, _b;
        if ([(_b = (_a = details.customType) === null || _a === void 0 ? void 0 : _a.functions) === null || _b === void 0 ? void 0 : _b.isOfType, details.isOfType].filter((a) => Boolean(a)).some((func) => func(value, settings.type))) {
            return index;
        }
    }).filter((a) => a !== undefined);
    const matchedTypeDetailsIndex = matchedTypeDetailsIndexes[0];
    const matchedTypeDetails = typeDetailsArray[matchedTypeDetailsIndex];
    const isValidType = Boolean(matchedTypeDetails);
    const returnObj = { typeDetails, matchedTypeDetails, matchedTypeDetailsIndex, matchedTypeDetailsIndexes, typeDetailsArray, isValidType };
    return returnObj;
};
