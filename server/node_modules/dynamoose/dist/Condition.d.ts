import { Item } from "./Item";
declare const OR: unique symbol;
import { ObjectType } from "./General";
import { ExpressionAttributeNameMap, ExpressionAttributeValueMap } from "./Types";
import { Model } from "./Model";
import { InternalPropertiesClass } from "./InternalPropertiesClass";
export type ConditionFunction = (condition: Condition) => Condition;
type ConditionStorageType = {
    [key: string]: ConditionsConditionStorageObject;
} | typeof OR;
export type ConditionStorageTypeNested = ConditionStorageType | Array<ConditionStorageTypeNested>;
type ConditionRequestObjectResult = {
    ExpressionAttributeNames?: ExpressionAttributeNameMap;
    ExpressionAttributeValues?: ExpressionAttributeValueMap;
};
interface ConditionComparisonType {
    name: ConditionComparisonComparatorName;
    typeName: ConditionComparisonComparatorDynamoName;
    not?: ConditionComparisonComparatorDynamoName;
    multipleArguments?: boolean;
}
declare enum ConditionComparisonComparatorName {
    equals = "eq",
    notEquals = "ne",
    lessThan = "lt",
    lessThanEquals = "le",
    greaterThan = "gt",
    greaterThanEquals = "ge",
    beginsWith = "beginsWith",
    contains = "contains",
    exists = "exists",
    in = "in",
    between = "between"
}
declare enum ConditionComparisonComparatorDynamoName {
    equals = "EQ",
    notEquals = "NE",
    lessThan = "LT",
    lessThanEquals = "LE",
    greaterThan = "GT",
    greaterThanEquals = "GE",
    beginsWith = "BEGINS_WITH",
    contains = "CONTAINS",
    notContains = "NOT_CONTAINS",
    exists = "EXISTS",
    notExists = "NOT_EXISTS",
    in = "IN",
    between = "BETWEEN"
}
export type ConditionInitializer = Condition | ObjectType | string;
export interface BasicOperators<T = Condition> {
    and: () => T;
    or: () => T;
    not: () => T;
    parenthesis: (value: Condition | ConditionFunction) => T;
    group: (value: Condition | ConditionFunction) => T;
    where: (key: string) => T;
    filter: (key: string) => T;
    attribute: (key: string) => T;
    eq: (value: any) => T;
    lt: (value: any) => T;
    le: (value: any) => T;
    gt: (value: any) => T;
    ge: (value: any) => T;
    beginsWith: (value: any) => T;
    contains: (value: any) => T;
    exists: () => T;
    in: (value: any) => T;
    between: (...values: any[]) => T;
}
export interface Condition extends BasicOperators {
    where: (key: string) => Condition;
    filter: (key: string) => Condition;
    attribute: (key: string) => Condition;
    eq: (value: any) => Condition;
    lt: (value: any) => Condition;
    le: (value: any) => Condition;
    gt: (value: any) => Condition;
    ge: (value: any) => Condition;
    beginsWith: (value: any) => Condition;
    contains: (value: any) => Condition;
    exists: () => Condition;
    in: (value: any) => Condition;
    between: (...values: any[]) => Condition;
}
type ConditionObject = {
    [key: string]: {
        type: ConditionComparisonComparatorDynamoName;
        value: any;
    };
} | typeof OR;
interface ConditionInternalProperties {
    requestObject: (model: Model<Item>, settings?: ConditionRequestObjectSettings) => Promise<ConditionRequestObjectResult>;
    settings?: {
        conditions?: ConditionObject[];
        pending?: {
            key?: string;
            not?: boolean;
            type?: ConditionComparisonType;
            value?: any;
        };
        raw?: ConditionInitializer;
    };
    comparisonChart: (model: Model<Item>) => Promise<any>;
}
export declare class Condition extends InternalPropertiesClass<ConditionInternalProperties> {
    /**
     * TODO
     * @param object
     * @returns Condition
     */
    constructor(object?: ConditionInitializer);
    /**
     * This function specifies an `OR` join between two conditions, as opposed to the default `AND`. The condition will return `true` if either condition is met.
     *
     * ```js
     * new dynamoose.Condition().where("id").eq(1).or().where("name").eq("Bob"); // id = 1 OR name = Bob
     * ```
     * @returns Condition
     */
    or(): Condition;
    /**
     * This function has no behavior and is only used to increase readability of your conditional. This function can be omitted with no behavior change to your code.
     *
     * ```js
     * // The two condition objects below are identical
     * new dynamoose.Condition().where("id").eq(1).and().where("name").eq("Bob");
     * new dynamoose.Condition().where("id").eq(1).where("name").eq("Bob");
     * ```
     * @returns Condition
     */
    and(): Condition;
    /**
     * This function sets the condition to use the opposite comparison type for the given condition. You can find the list opposite comparison types below.
     *
     * | Original | Opposite |
     * |---|---|
     * | equals (EQ) | not equals (NE) |
     * | less than or equals (LE) | greater than (GT) |
     * | less than (LT) | greater than or equals (GE) |
     * | null (NULL) | not null (NOT_NULL) |
     * | contains (CONTAINS) | not contains (NOT_CONTAINS) |
     * | exists (EXISTS) | not exists (NOT_EXISTS) |
     *
     * The following comparisons do not have an opposite comparison type, and will throw an error if you try to use condition.not() with them.
     *
     * | Original |
     * |---|
     * | in (IN) |
     * | between (BETWEEN) |
     * | begins with (BEGINS_WITH) |
     *
     * ```js
     * new dynamoose.Condition().where("id").not().eq(1); // Retrieve all objects where id does NOT equal 1
     * new dynamoose.Condition().where("id").not().between(1, 2); // Will throw error since between does not have an opposite comparison type
     * ```
     * @returns Condition
     */
    not(): Condition;
    /**
     * This function takes in a `Condition` instance as a parameter and uses that as a group. This lets you specify the priority of the conditional. You can also pass a function into the `condition` parameter and Dynamoose will call your function with one argument which is a condition instance that you can return to specify the group.
     *
     * ```js
     * // The two condition objects below are identical
     * new dynamoose.Condition().where("id").eq(1).and().parenthesis(new dynamoose.Condition().where("name").eq("Bob")); // id = 1 AND (name = Bob)
     * new dynamoose.Condition().where("id").eq(1).and().parenthesis((condition) => condition.where("name").eq("Bob")); // id = 1 AND (name = Bob)
     * ```
     *
     * `condition.group` is an alias to this method.
     * @param condition A new Condition instance or a function. If a function is passed, it will be called with one argument which is a condition instance that you can return to specify the group.
     * @returns Condition
     */
    parenthesis(condition: Condition | ConditionFunction): Condition;
    /**
     * This function takes in a `Condition` instance as a parameter and uses that as a group. This lets you specify the priority of the conditional. You can also pass a function into the `condition` parameter and Dynamoose will call your function with one argument which is a condition instance that you can return to specify the group.
     *
     * ```js
     * // The two condition objects below are identical
     * new dynamoose.Condition().where("id").eq(1).and().group(new dynamoose.Condition().where("name").eq("Bob")); // id = 1 AND (name = Bob)
     * new dynamoose.Condition().where("id").eq(1).and().group((condition) => condition.where("name").eq("Bob")); // id = 1 AND (name = Bob)
     * ```
     *
     * `condition.parenthesis` is an alias to this method.
     * @param condition A new Condition instance or a function. If a function is passed, it will be called with one argument which is a condition instance that you can return to specify the group.
     * @returns Condition
     */
    group(condition: Condition | ConditionFunction): Condition;
}
interface ConditionsConditionStorageObject {
    type: ConditionComparisonComparatorDynamoName;
    value: any;
}
interface ConditionRequestObjectSettings {
    conditionString: string;
    index?: {
        start: number;
        set: (newIndex: number) => void;
    };
    conditionStringType: "array" | "string";
}
export {};
