import * as object from "js-object-utilities";
import find_best_index from "./find_best_index";
import deep_copy from "./deep_copy";
import childKey from "./childKey";
import parentKey from "./parentKey";
import async_reduce from "./async_reduce";
declare const _default: {
    combine_objects: <T>(...args: T[]) => T;
    merge_objects: any;
    timeout: (time: string | number) => Promise<void>;
    capitalize_first_letter: (str: string) => string;
    set_immediate_promise: () => Promise<void>;
    unique_array_elements: <T_1>(array: T_1[]) => T_1[];
    all_elements_match: <T_2>(array: T_2[]) => boolean;
    array_flatten: <T_3>(array: T_3[]) => any[];
    empty_function: () => void;
    object: typeof object;
    dynamoose: {
        get_provisioned_throughput: (options: Partial<import("./dynamoose/get_provisioned_throughput").TableSettings>) => {} | {
            BillingMode: "PAY_PER_REQUEST";
        } | {
            ProvisionedThroughput: {
                ReadCapacityUnits: number;
                WriteCapacityUnits: number;
            };
        };
        index_changes: (table: import("../Table").Table, existingIndexes?: any[]) => Promise<(import("./dynamoose/index_changes").ModelIndexAddChange | import("./dynamoose/index_changes").ModelIndexDeleteChange)[]>;
        convertConditionArrayRequestObjectToString: (expression: any[]) => string;
        getValueTypeCheckResult: (schema: import("../Schema").Schema, value: any, key: string, settings: {
            type: "toDynamo" | "fromDynamo";
        }, options: {
            standardKey?: boolean;
            typeIndexOptionMap?: import("../General").ObjectType;
        }) => {
            typeDetails: import("../Schema").DynamoDBTypeResult | import("../Schema").DynamoDBSetTypeResult | import("../Schema").DynamoDBTypeResult[] | import("../Schema").DynamoDBSetTypeResult[];
            matchedTypeDetailsIndex: number;
            matchedTypeDetailsIndexes: number[];
            matchedTypeDetails: import("../Schema").DynamoDBTypeResult | import("../Schema").DynamoDBSetTypeResult;
            typeDetailsArray: (import("../Schema").DynamoDBTypeResult | import("../Schema").DynamoDBSetTypeResult)[];
            isValidType: boolean;
        };
        itemToJSON: typeof import("./dynamoose/itemToJSON").itemToJSON;
        wildcard_allowed_check: (saveUnknown: boolean | string[], checkKey: string, settings?: {
            splitString: string;
            prefixesDisallowed: boolean;
        }) => boolean;
    };
    type_name: (value: any, typeDetailsArray: (import("../Schema").DynamoDBTypeResult | import("../Schema").DynamoDBSetTypeResult)[]) => string;
    importPackage: (name: string) => Promise<any>;
    log: (...args: any[]) => Promise<void>;
    find_best_index: typeof find_best_index;
    deep_copy: typeof deep_copy;
    childKey: typeof childKey;
    parentKey: typeof parentKey;
    async_reduce: typeof async_reduce;
    keyBy: <T_4 = import("../Types").AnySimpleValue | import("../Types").AnySimpleObject>(array: T_4[], key: string) => object.GeneralObject<T_4>;
};
export default _default;
