import ModelStore from "../ModelStore";
import { Schema, SchemaDefinition, IndexItem, TableIndex } from "../Schema";
import { Item as ItemCarrier, ItemSaveSettings, AnyItem } from "../Item";
import { Serializer, SerializerOptions } from "../Serializer";
import { Condition, ConditionInitializer } from "../Condition";
import { Scan, Query } from "../ItemRetriever";
import { CallbackType, ObjectType, FunctionType, ItemArray, ModelType, KeyObject, InputKey } from "../General";
import * as DynamoDB from "@aws-sdk/client-dynamodb";
import { GetTransactionInput, CreateTransactionInput, DeleteTransactionInput, UpdateTransactionInput, ConditionTransactionInput } from "../Transaction";
import { Table, TableOptionsOptional } from "../Table";
import { InternalPropertiesClass } from "../InternalPropertiesClass";
type UpdatePartial<T> = Partial<T> | {
    $SET: Partial<T>;
} | {
    $ADD: Partial<T>;
} | {
    $REMOVE: Partial<T>;
} | {
    $DELETE: Partial<T>;
};
type GetTransactionResult = Promise<GetTransactionInput>;
type CreateTransactionResult = Promise<CreateTransactionInput>;
type DeleteTransactionResult = Promise<DeleteTransactionInput>;
type UpdateTransactionResult = Promise<UpdateTransactionInput>;
type ConditionTransactionResult = Promise<ConditionTransactionInput>;
export interface GetTransaction {
    (key: InputKey): GetTransactionResult;
    (key: InputKey, settings?: ModelGetSettings): GetTransactionResult;
    (key: InputKey, settings: ModelGetSettings & {
        return: "item";
    }): GetTransactionResult;
    (key: InputKey, settings: ModelGetSettings & {
        return: "request";
    }): GetTransactionResult;
}
export interface CreateTransaction {
    (item: ObjectType): CreateTransactionResult;
    (item: ObjectType, settings: ItemSaveSettings & {
        return: "request";
    }): CreateTransactionResult;
    (item: ObjectType, settings: ItemSaveSettings & {
        return: "item";
    }): CreateTransactionResult;
    (item: ObjectType, settings?: ItemSaveSettings): CreateTransactionResult;
}
export interface DeleteTransaction {
    (key: InputKey): DeleteTransactionResult;
    (key: InputKey, settings: ModelDeleteSettings & {
        return: "request";
    }): DeleteTransactionResult;
    (key: InputKey, settings: ModelDeleteSettings & {
        return: null;
    }): DeleteTransactionResult;
    (key: InputKey, settings?: ModelDeleteSettings): DeleteTransactionResult;
}
export interface UpdateTransaction {
    (obj: ObjectType): CreateTransactionResult;
    (keyObj: ObjectType, updateObj: ObjectType): UpdateTransactionResult;
    (keyObj: ObjectType, updateObj: ObjectType, settings: ModelUpdateSettings & {
        "return": "item";
    }): UpdateTransactionResult;
    (keyObj: ObjectType, updateObj: ObjectType, settings: ModelUpdateSettings & {
        "return": "request";
    }): UpdateTransactionResult;
    (keyObj: ObjectType, updateObj?: ObjectType, settings?: ModelUpdateSettings): UpdateTransactionResult;
}
export interface ConditionTransaction {
    (key: InputKey, condition: Condition): ConditionTransactionResult;
}
type TransactionType = {
    get: GetTransaction;
    create: CreateTransaction;
    delete: DeleteTransaction;
    update: UpdateTransaction;
    condition: ConditionTransaction;
};
interface ModelGetSettings {
    return?: "item" | "request";
    attributes?: string[];
    consistent?: boolean;
}
interface ModelDeleteSettings {
    return?: null | "request";
    condition?: Condition;
}
interface ModelBatchPutSettings {
    return?: "response" | "request";
}
interface ModelUpdateSettings {
    return?: "item" | "request";
    condition?: Condition;
    returnValues?: DynamoDB.ReturnValue;
}
interface ModelBatchGetItemsResponse<T> extends ItemArray<T> {
    unprocessedKeys: ObjectType[];
}
interface ModelBatchGetSettings {
    return?: "items" | "request";
    attributes?: string[];
    consistent?: boolean;
}
interface ModelBatchDeleteSettings {
    return?: "response" | "request";
}
export interface ModelIndexes {
    TableIndex?: TableIndex;
    GlobalSecondaryIndexes?: IndexItem[];
    LocalSecondaryIndexes?: IndexItem[];
}
export interface ModelTableOptions extends TableOptionsOptional {
    tableName?: string;
}
interface ModelInternalProperties {
    name: string;
    options: TableOptionsOptional;
    getIndexes: () => Promise<{
        GlobalSecondaryIndexes?: IndexItem[];
        LocalSecondaryIndexes?: IndexItem[];
        TableIndex?: any;
    }>;
    convertKeyToObject: (key: InputKey) => Promise<KeyObject>;
    schemaCorrectnessScores: (object: ObjectType) => number[];
    schemaForObject: (object: ObjectType) => Schema;
    dynamoPropertyForAttribute: (attribute: string) => Promise<string>;
    getCreateTableAttributeParams: () => Promise<Pick<DynamoDB.CreateTableInput, "AttributeDefinitions" | "KeySchema" | "GlobalSecondaryIndexes" | "LocalSecondaryIndexes">>;
    getHashKey: () => string;
    getRangeKey: () => string | void;
    table: () => Table;
    tableName: string;
    schemas: Schema[];
    /**
     * This should never be called directly. Use `table()` instead.
     */
    _table?: Table;
}
export declare class Model<T extends ItemCarrier = AnyItem> extends InternalPropertiesClass<ModelInternalProperties> {
    /**
     * This method is the basic entry point for creating a model in Dynamoose. When you call this method a new model is created, and it returns an item initializer that you can use to create instances of the given model.
     *
     * The `name` parameter is a string representing the model name.
     *
     * The `schema` parameter can either be an object OR a [Schema](Schema.md) instance. If you pass in an object for the `schema` parameter it will create a Schema instance for you automatically.
     *
     * The `options` parameter is the same as the options that are passed to the [Table](Table.md) constructor except it takes additional argument `tableName`:
     *
     * | Name | Description | Type | Default |
     * |------|-------------|------|---------|
     * | tableName | Optional table name to overwrite the default one that is equals to a model name. It respects both `prefix` and `suffix` provided locally or globally. The main goal of this option is to store multiple models within single table to conform the DynamoDB's single table design approach. | String | undefined |
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const Cat = dynamoose.model("Cat", {"name": String});
     *
     * const Cat = dynamoose.model("Cat", new dynamoose.Schema({"name": String}));
     * ```
     *
     * An optional TypeScript class which extends `Item` can be provided right before the function bracket. This provides type checking when using operations like `Model.create()`.
     *
     * ```ts
     * import * as dynamoose from "dynamoose";
     * import {Item} from "dynamoose/dist/Item";
     *
     * // Strongly typed model
     * class Cat extends Item {
     * 	id: number;
     * 	name: string;
     * }
     * const CatModel = dynamoose.model<Cat>("Cat", {"id": Number, "name": String});
     *
     * // Will raise type checking error as random is not a valid field.
     * CatModel.create({"id": 1, "random": "string"});
     *
     * // Will return the correct type of Cat
     * const cat = await CatModel.get(1);
     * ```
     *
     * You can also pass in an array of Schema instances or schema objects into the `schema` parameter. This is useful for cases of single table design where you want one model to have multiple options for a schema. Behind the scenes Dynamoose will automatically pick the closest schema to match to your item, and use that schema for all operations pertaining to that item. If no matching schema can be found, it will default to the first schema in the array.
     *
     * :::note
     * If you use multiple schemas in one model, the hash & range keys must match for all schemas.
     * :::
     *
     * ```js
     * const Cat = dynamoose.model("Cat", [
     * 	new dynamoose.Schema({"id": String, "name": String}),
     * 	{"id": String, "age": Number}
     * ]);
     * ```
     *
     * If you don't pass the `schema` parameter it is required that you have an existing model already registered with that name. This will use the existing model already registered.
     *
     * ```js
     * const Cat = dynamoose.model("Cat"); // Will reference existing model, or if no model exists already with name `Cat` it will throw an error.
     * ```
     *
     * If you choose to pass the model into a [`Table`](Table.md) constructor, you must ensure that you don't use the model for any DynamoDB requests before initializing the table.
     * @param name The name of the model.
     * @param schema The schema for the model.
     * @param options The options for the model. This is the same type as `Table` options.
     * @param _ModelStore INTERNAL PARAMETER
     */
    constructor(name: string, schema: Schema | SchemaDefinition | (Schema | SchemaDefinition)[], options: ModelTableOptions, _ModelStore: typeof ModelStore);
    /**
     * This property is a string that represents the model name.
     *
     * This property is unable to be set.
     *
     * ```js
     * const User = dynamoose.model("User", {"id": String});
     *
     * console.log(User.name); // User
     * ```
     * @readonly
     */
    get name(): string;
    /**
     * This function will return the [`Table`](Table.md) instance for the model.
     *
     * If a Table instance hasn't been created yet for this model, it will be created when calling this function.
     *
     * ```js
     * const User = dynamoose.model("User", {"id": String});
     *
     * console.log(User.table().hashKey); // id
     * ```
     */
    table(): Table;
    serializer: Serializer;
    Item: typeof ItemCarrier;
    scan: (object?: ConditionInitializer) => Scan<T>;
    query: (object?: ConditionInitializer) => Query<T>;
    methods: {
        item: {
            set: (name: string, fn: FunctionType) => void;
            delete: (name: string) => void;
        };
        set: (name: string, fn: FunctionType) => void;
        delete: (name: string) => void;
    };
    transaction: TransactionType;
    batchGet(keys: InputKey[]): Promise<ModelBatchGetItemsResponse<T>>;
    batchGet(keys: InputKey[], callback: CallbackType<ModelBatchGetItemsResponse<T>, any>): void;
    batchGet(keys: InputKey[], settings: ModelBatchGetSettings & {
        "return": "request";
    }): Promise<DynamoDB.BatchGetItemInput>;
    batchGet(keys: InputKey[], settings: ModelBatchGetSettings & {
        "return": "request";
    }, callback: CallbackType<DynamoDB.BatchGetItemInput, any>): void;
    batchGet(keys: InputKey[], settings: ModelBatchGetSettings): Promise<ModelBatchGetItemsResponse<T>>;
    batchGet(keys: InputKey[], settings: ModelBatchGetSettings, callback: CallbackType<ModelBatchGetItemsResponse<T>, any>): void;
    batchGet(keys: InputKey[], settings: ModelBatchGetSettings & {
        "return": "items";
    }): Promise<ModelBatchGetItemsResponse<T>>;
    batchGet(keys: InputKey[], settings: ModelBatchGetSettings & {
        "return": "items";
    }, callback: CallbackType<ModelBatchGetItemsResponse<T>, any>): void;
    batchPut(items: ObjectType[]): Promise<{
        "unprocessedItems": ObjectType[];
    }>;
    batchPut(items: ObjectType[], callback: CallbackType<{
        "unprocessedItems": ObjectType[];
    }, any>): void;
    batchPut(items: ObjectType[], settings: ModelBatchPutSettings & {
        "return": "request";
    }): Promise<DynamoDB.BatchWriteItemInput>;
    batchPut(items: ObjectType[], settings: ModelBatchPutSettings & {
        "return": "request";
    }, callback: CallbackType<DynamoDB.BatchWriteItemInput, any>): void;
    batchPut(items: ObjectType[], settings: ModelBatchPutSettings): Promise<{
        "unprocessedItems": ObjectType[];
    }>;
    batchPut(items: ObjectType[], settings: ModelBatchPutSettings, callback: CallbackType<{
        "unprocessedItems": ObjectType[];
    }, any>): void;
    batchPut(items: ObjectType[], settings: ModelBatchPutSettings & {
        "return": "response";
    }): Promise<{
        "unprocessedItems": ObjectType[];
    }>;
    batchPut(items: ObjectType[], settings: ModelBatchPutSettings & {
        "return": "response";
    }, callback: CallbackType<{
        "unprocessedItems": ObjectType[];
    }, any>): void;
    batchDelete(keys: InputKey[]): Promise<{
        unprocessedItems: ObjectType[];
    }>;
    batchDelete(keys: InputKey[], callback: CallbackType<{
        unprocessedItems: ObjectType[];
    }, any>): void;
    batchDelete(keys: InputKey[], settings: ModelBatchDeleteSettings & {
        "return": "request";
    }): Promise<DynamoDB.BatchWriteItemInput>;
    batchDelete(keys: InputKey[], settings: ModelBatchDeleteSettings & {
        "return": "request";
    }, callback: CallbackType<DynamoDB.BatchWriteItemInput, any>): void;
    batchDelete(keys: InputKey[], settings: ModelBatchDeleteSettings): Promise<{
        unprocessedItems: ObjectType[];
    }>;
    batchDelete(keys: InputKey[], settings: ModelBatchDeleteSettings, callback: CallbackType<{
        unprocessedItems: ObjectType[];
    }, any>): Promise<{
        unprocessedItems: ObjectType[];
    }>;
    batchDelete(keys: InputKey[], settings: ModelBatchDeleteSettings & {
        "return": "response";
    }): Promise<{
        unprocessedItems: ObjectType[];
    }>;
    batchDelete(keys: InputKey[], settings: ModelBatchDeleteSettings & {
        "return": "response";
    }, callback: CallbackType<{
        unprocessedItems: ObjectType[];
    }, any>): Promise<{
        unprocessedItems: ObjectType[];
    }>;
    update(obj: UpdatePartial<T>): Promise<T>;
    update(obj: UpdatePartial<T>, callback: CallbackType<T, any>): void;
    update(keyObj: InputKey, updateObj: UpdatePartial<T>): Promise<T>;
    update(keyObj: InputKey, updateObj: UpdatePartial<T>, callback: CallbackType<T, any>): void;
    update(keyObj: InputKey, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings & {
        "return": "request";
    }): Promise<DynamoDB.UpdateItemInput>;
    update(keyObj: InputKey, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings & {
        "return": "request";
    }, callback: CallbackType<DynamoDB.UpdateItemInput, any>): void;
    update(keyObj: InputKey, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings): Promise<T>;
    update(keyObj: InputKey, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings, callback: CallbackType<T, any>): void;
    update(keyObj: InputKey, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings & {
        "return": "document";
    }): Promise<T>;
    update(keyObj: InputKey, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings & {
        "return": "document";
    }, callback: CallbackType<T, any>): void;
    update(keyObj: ObjectType, updateObj: UpdatePartial<T>): Promise<T>;
    update(keyObj: ObjectType, updateObj: UpdatePartial<T>, callback: CallbackType<T, any>): void;
    update(keyObj: ObjectType, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings & {
        "return": "request";
    }): Promise<DynamoDB.UpdateItemInput>;
    update(keyObj: ObjectType, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings & {
        "return": "request";
    }, callback: CallbackType<DynamoDB.UpdateItemInput, any>): void;
    update(keyObj: ObjectType, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings): Promise<T>;
    update(keyObj: ObjectType, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings, callback: CallbackType<T, any>): void;
    update(keyObj: ObjectType, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings & {
        "return": "item";
    }): Promise<T>;
    update(keyObj: ObjectType, updateObj: UpdatePartial<T>, settings: ModelUpdateSettings & {
        "return": "item";
    }, callback: CallbackType<T, any>): void;
    create(item: Partial<T>): Promise<T>;
    create(item: Partial<T>, callback: CallbackType<T, any>): void;
    create(item: Partial<T>, settings: ItemSaveSettings & {
        return: "request";
    }): Promise<DynamoDB.PutItemInput>;
    create(item: Partial<T>, settings: ItemSaveSettings & {
        return: "request";
    }, callback: CallbackType<DynamoDB.PutItemInput, any>): void;
    create(item: Partial<T>, settings: ItemSaveSettings): Promise<T>;
    create(item: Partial<T>, settings: ItemSaveSettings, callback: CallbackType<T, any>): void;
    create(item: Partial<T>, settings: ItemSaveSettings & {
        return: "item";
    }): Promise<T>;
    create(item: Partial<T>, settings: ItemSaveSettings & {
        return: "item";
    }, callback: CallbackType<T, any>): void;
    delete(key: InputKey): Promise<void>;
    delete(key: InputKey, callback: CallbackType<void, any>): void;
    delete(key: InputKey, settings: ModelDeleteSettings & {
        return: "request";
    }): Promise<DynamoDB.DeleteItemInput>;
    delete(key: InputKey, settings: ModelDeleteSettings & {
        return: "request";
    }, callback: CallbackType<DynamoDB.DeleteItemInput, any>): void;
    delete(key: InputKey, settings: ModelDeleteSettings): Promise<void>;
    delete(key: InputKey, settings: ModelDeleteSettings, callback: CallbackType<void, any>): void;
    delete(key: InputKey, settings: ModelDeleteSettings & {
        return: null;
    }): Promise<void>;
    delete(key: InputKey, settings: ModelDeleteSettings & {
        return: null;
    }, callback: CallbackType<void, any>): void;
    get(key: InputKey): Promise<T>;
    get(key: InputKey, callback: CallbackType<T, any>): void;
    get(key: InputKey, settings: ModelGetSettings & {
        return: "request";
    }): Promise<DynamoDB.GetItemInput>;
    get(key: InputKey, settings: ModelGetSettings & {
        return: "request";
    }, callback: CallbackType<DynamoDB.GetItemInput, any>): void;
    get(key: InputKey, settings: ModelGetSettings): Promise<T>;
    get(key: InputKey, settings: ModelGetSettings, callback: CallbackType<T, any>): void;
    get(key: InputKey, settings: ModelGetSettings & {
        return: "item";
    }): Promise<T>;
    get(key: InputKey, settings: ModelGetSettings & {
        return: "item";
    }, callback: CallbackType<T, any>): void;
    serializeMany(itemsArray: ModelType<ItemCarrier>[], nameOrOptions: SerializerOptions | string): any;
}
export {};
