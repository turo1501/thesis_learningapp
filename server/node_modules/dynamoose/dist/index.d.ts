import { ModelTableOptions } from "./Model";
import { Schema, SchemaDefinition } from "./Schema";
import { Condition } from "./Condition";
import transaction from "./Transaction";
import { Item, AnyItem } from "./Item";
import { ModelType } from "./General";
import { Instance } from "./Instance";
declare const _default: {
    /**
     * This method is the basic entry point for creating a model in Dynamoose. When you call this method a new model is created, and it returns an item initializer that you can use to create instances of the given model.
     *
     * The `name` parameter is a string representing the table name that will be used to store items created by this model.
     *
     * The `schema` parameter can either be an object OR a [Schema](Schema.md) instance. If you pass in an object for the `schema` parameter it will create a Schema instance for you automatically.
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
     * @param name The name of the model.
     * @param schema The schema definition(s) for the model. This can either be a Schema instance, object representing a Schema, or an array of either.
     * @returns The model instance.
     */
    model: <T extends Item = AnyItem>(name: string, schema?: Schema | SchemaDefinition | (Schema | SchemaDefinition)[], options?: ModelTableOptions) => ModelType<T>;
    Table: import("./Instance").PrimaryTableInterface & {
        defaults: import("./Table/defaults").TableOptionsAccessor;
    };
    Instance: typeof Instance;
    Schema: typeof Schema;
    Condition: typeof Condition;
    transaction: typeof transaction;
    aws: import("./aws").AWS;
    logger: () => Promise<any>;
    type: {
        UNDEFINED: symbol;
        THIS: symbol;
        NULL: symbol;
        ANY: symbol;
        CONSTANT: (value: string | number | boolean) => {
            value: string;
            settings: {
                value: string | number | boolean;
            };
        };
        COMBINE: (attributes: string[], separator?: string) => {
            value: string;
            settings: {
                attributes: string[];
                separator?: string;
            };
        };
    };
};
export = _default;
