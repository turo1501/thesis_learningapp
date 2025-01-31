import { Model } from "./Model";
import { Schema } from "./Schema";
import { AttributeMap } from "./Types";
import * as DynamoDB from "@aws-sdk/client-dynamodb";
import { CallbackType, ObjectType } from "./General";
import { SerializerOptions } from "./Serializer";
import { PopulateSettings } from "./Populate";
import { Condition } from "./Condition";
import { InternalPropertiesClass } from "./InternalPropertiesClass";
export interface ItemSaveSettings {
    overwrite?: boolean;
    return?: "request" | "item";
    condition?: Condition;
}
export interface ItemSettings {
    type?: "fromDynamo" | "toDynamo";
}
interface ItemInternalProperties {
    originalObject: any;
    originalSettings: ItemSettings;
    model: Model<Item>;
    storedInDynamo: boolean;
}
export declare class Item extends InternalPropertiesClass<ItemInternalProperties> {
    /**
     * Create a new item.
     * @param model Internal property. Not used publicly.
     * @param object The object for the item.
     * @param settings The settings for the item.
     */
    constructor(model: Model<Item>, object?: AttributeMap | ObjectType, settings?: ItemSettings);
    static objectToDynamo(object: ObjectType): AttributeMap;
    static objectToDynamo(object: any, settings: {
        type: "value";
    }): DynamoDB.AttributeValue;
    static objectToDynamo(object: ObjectType, settings: {
        type: "object";
    }): AttributeMap;
    static fromDynamo(object: AttributeMap): ObjectType;
    static isDynamoObject(object: ObjectType, recursive?: boolean): boolean | null;
    static attributesWithSchema: (item: Item, model: Model<Item>) => Promise<string[]>;
    static objectFromSchema: (object: any, model: Model<Item>, settings?: ItemObjectFromSchemaSettings) => Promise<any>;
    static prepareForObjectFromSchema: (object: any, model: Model<Item>, settings: ItemObjectFromSchemaSettings) => any;
    conformToSchema: (this: Item, settings?: ItemObjectFromSchemaSettings) => Promise<Item>;
    toDynamo: (this: Item, settings?: Partial<ItemObjectFromSchemaSettings>) => Promise<any>;
    prepareForResponse(): Promise<Item>;
    /**
     * This function returns the original item that was received from DynamoDB. This function will return a JSON object that represents the original item. In the event no item has been retrieved from DynamoDB `null` will be returned.
     *
     * ```js
     * const user = await User.get(1);
     * console.log(user); // {"id": 1, "name": "Bob"}
     * user.name = "Tim";
     *
     * console.log(user); // {"id": 1, "name": "Tim"}
     * console.log(user.original()); // {"id": 1, "name": "Bob"}
     * ```
     * @returns Object | null
     */
    original(): ObjectType | null;
    /**
     * This function returns a JSON object representation of the item. This is most commonly used when comparing an item to an object you receive elsewhere without worrying about prototypes.
     *
     * ```js
     * const user = new User({"id": 1, "name": "Tim"});
     *
     * console.log(user); // Item {"id": 1, "name": "Tim"}
     * console.log(user.toJSON()); // {"id": 1, "name": "Tim"}
     * ```
     *
     * Due to the fact that an item instance is based on an object it is rare that you will have to use this function since you can access all the properties of the item directly. For example, both of the results will yield the same output.
     *
     * ```js
     * const user = new User({"id": 1, "name": "Tim"});
     *
     * console.log(user.id); // 1
     * console.log(user.toJSON().id); // 1
     * ```
     * @returns Object
     */
    toJSON(): ObjectType;
    /**
     * This method will return a promise containing an object of the item that includes default values for any undefined values in the item.
     *
     * ```js
     * const schema = new Schema({
     * 	"id": String,
     * 	"data": {
     * 		"type": String,
     * 		"default": "Hello World"
     * 	}
     * });
     * const User = dynamoose.model("User", schema);
     * const user = new User({"id": 1});
     * console.log(await user.withDefaults()); // {"id": 1, "data": "Hello World"}
     * ```
     * @returns Promise<Object>
     */
    withDefaults(): Promise<ObjectType>;
    serialize(nameOrOptions?: SerializerOptions | string): ObjectType;
    /**
     * This deletes the given item from DynamoDB. This method uses the `deleteItem` DynamoDB API call to delete your object in the given table associated with the model.
     *
     * This method returns a promise that will resolve when the operation is complete, this promise will reject upon failure. Nothing will be passed into the result for the promise.
     *
     * ```js
     * const myUser = User.get("1");
     *
     * try {
     * 	await myUser.delete();
     * 	console.log("Delete operation was successful.");
     * } catch (error) {
     * 	console.error(error);
     * }
     * ```
     * @returns Promise\<void\>
     */
    delete(): Promise<void>;
    /**
     * This deletes the given item from DynamoDB. This method uses the `deleteItem` DynamoDB API call to delete your object in the given table associated with the model.
     *
     * This method returns nothing. It accepts a function into the `callback` parameter to have it be used in a callback format as opposed to a promise format. Nothing will be passed into the result for the callback.
     *
     * ```js
     * const myUser = User.get("1");
     *
     * myUser.delete((error) => {
     * 	if (error) {
     * 		console.error(error);
     * 	} else {
     * 		console.log("Delete operation was successful.");
     * 	}
     * });
     * ```
     * @param callback Function - `(): void`
     * @returns void
     */
    delete(callback: CallbackType<void, any>): void;
    /**
     * This saves an item to DynamoDB. This method uses the `putItem` DynamoDB API call to store your object in the given table associated with the model. This method is overwriting, and will overwrite the data you currently have in place for the existing key for your table.
     *
     * This method returns a promise that will resolve when the operation is complete, this promise will reject upon failure. Nothing will be passed into the result for the promise.
     *
     * ```js
     * const myUser = new User({
     * 	"id": 1,
     * 	"name": "Tim"
     * });
     *
     * try {
     * 	await myUser.save();
     * 	console.log("Save operation was successful.");
     * } catch (error) {
     * 	console.error(error);
     * }
     * ```
     * @returns Promise\<Item\>
     */
    save(): Promise<Item>;
    /**
     * This saves an item to DynamoDB. This method uses the `putItem` DynamoDB API call to store your object in the given table associated with the model. This method is overwriting, and will overwrite the data you currently have in place for the existing key for your table.
     *
     * This method returns nothing. It accepts a function into the `callback` parameter. Nothing will be passed into the result for the callback.
     *
     * Both `settings` and `callback` parameters are optional. You can pass in a `callback` without `settings`, just by passing in one argument and having that argument be the `callback`. You are not required to pass in `settings` if you just want to pass in a `callback`.
     *
     * ```js
     * const myUser = new User({
     * 	"id": 1,
     * 	"name": "Tim"
     * });
     *
     * myUser.save((error) => {
     * 	if (error) {
     * 		console.error(error);
     * 	} else {
     * 		console.log("Save operation was successful.");
     * 	}
     * });
     * ```
     * @param callback Function - `(error: any, item: Item): void`
     */
    save(callback: CallbackType<Item, any>): void;
    /**
     * This saves an item to DynamoDB. This method uses the `putItem` DynamoDB API call to store your object in the given table associated with the model. This method is overwriting, and will overwrite the data you currently have in place for the existing key for your table.
     *
     * This method returns a promise that will resolve when the operation is complete, this promise will reject upon failure. Nothing will be passed into the result for the promise.
     *
     * You can also pass a settings object in as the first parameter. The following options are available for settings are:
     *
     * | Name | Type | Default | Notes |
     * |---|---|---|---|
     * | overwrite | boolean | true | If an existing item with the same hash key should be overwritten in the database. You can set this to false to not overwrite an existing item with the same hash key. |
     * | return | string | `item` | If the function should return the `item` or `request`. If you set this to `request` the request that would be made to DynamoDB will be returned, but no requests will be made to DynamoDB. |
     * | condition | [`dynamoose.Condition`](https://dynamoosejs.com/guide/Condition) | `null` | This is an optional instance of a Condition for the save. |
     *
     * The `settings` parameter is optional.
     *
     * ```js
     * const myUser = new User({
     * 	"id": 1,
     * 	"name": "Tim"
     * });
     *
     * try {
     * 	await myUser.save({
     * 		"overwrite": false,
     * 		"return": "request"
     * 	});
     * 	console.log("Save operation was successful.");
     * } catch (error) {
     * 	console.error(error);
     * }
     * ```
     * @param settings Object - `{"overwrite": boolean, "return": "request", "condition": Condition}`
     * @returns Promise\<DynamoDB.PutItemInput\>
     */
    save(settings: ItemSaveSettings & {
        return: "request";
    }): Promise<DynamoDB.PutItemInput>;
    /**
     * This saves an item to DynamoDB. This method uses the `putItem` DynamoDB API call to store your object in the given table associated with the model. This method is overwriting, and will overwrite the data you currently have in place for the existing key for your table.
     *
     * This method returns a promise that will resolve when the operation is complete, this promise will reject upon failure. You can also pass in a function into the `callback` parameter to have it be used in a callback format as opposed to a promise format. Nothing will be passed into the result for the promise or callback.
     *
     * You can also pass a settings object in as the first parameter. The following options are available for settings are:
     *
     * | Name | Type | Default | Notes |
     * |---|---|---|---|
     * | overwrite | boolean | true | If an existing item with the same hash key should be overwritten in the database. You can set this to false to not overwrite an existing item with the same hash key. |
     * | return | string | `item` | If the function should return the `item` or `request`. If you set this to `request` the request that would be made to DynamoDB will be returned, but no requests will be made to DynamoDB. |
     * | condition | [`dynamoose.Condition`](https://dynamoosejs.com/guide/Condition) | `null` | This is an optional instance of a Condition for the save. |
     *
     * Both `settings` and `callback` parameters are optional. You can pass in a `callback` without `settings`, just by passing in one argument and having that argument be the `callback`. You are not required to pass in `settings` if you just want to pass in a `callback`.
     *
     * ```js
     * const myUser = new User({
     * 	"id": 1,
     * 	"name": "Tim"
     * });
     *
     * myUser.save({
     * 	"overwrite": false,
     * 	"return": "request"
     * }, (error) => {
     * 	if (error) {
     * 		console.error(error);
     * 	} else {
     * 		console.log("Save operation was successful.");
     * 	}
     * });
     * ```
     * @param settings Object - `{"overwrite": boolean, "return": "request", "condition": Condition}`
     * @param callback Function - `(error: any, request: DynamoDB.PutItemInput): void`
     */
    save(settings: ItemSaveSettings & {
        return: "request";
    }, callback: CallbackType<DynamoDB.PutItemInput, any>): void;
    /**
     * This saves an item to DynamoDB. This method uses the `putItem` DynamoDB API call to store your object in the given table associated with the model. This method is overwriting, and will overwrite the data you currently have in place for the existing key for your table.
     *
     * This method returns a promise that will resolve when the operation is complete, this promise will reject upon failure. You can also pass in a function into the `callback` parameter to have it be used in a callback format as opposed to a promise format. Nothing will be passed into the result for the promise or callback.
     *
     * You can also pass a settings object in as the first parameter. The following options are available for settings are:
     *
     * | Name | Type | Default | Notes |
     * |---|---|---|---|
     * | overwrite | boolean | true | If an existing item with the same hash key should be overwritten in the database. You can set this to false to not overwrite an existing item with the same hash key. |
     * | return | string | `item` | If the function should return the `item` or `request`. If you set this to `request` the request that would be made to DynamoDB will be returned, but no requests will be made to DynamoDB. |
     * | condition | [`dynamoose.Condition`](https://dynamoosejs.com/guide/Condition) | `null` | This is an optional instance of a Condition for the save. |
     *
     * The `settings` parameter is optional.
     *
     * ```js
     * const myUser = new User({
     * 	"id": 1,
     * 	"name": "Tim"
     * });
     *
     * try {
     * 	await myUser.save({
     * 		"overwrite": false,
     * 		"return": "item"
     * 	});
     * 	console.log("Save operation was successful.");
     * } catch (error) {
     * 	console.error(error);
     * }
     * ```
     * @param settings Object - `{"overwrite": boolean, "return": "item", "condition": Condition}`
     * @returns Promise\<Item\>
     */
    save(settings: ItemSaveSettings & {
        return: "item";
    }): Promise<Item>;
    /**
     * This saves an item to DynamoDB. This method uses the `putItem` DynamoDB API call to store your object in the given table associated with the model. This method is overwriting, and will overwrite the data you currently have in place for the existing key for your table.
     *
     * This method returns a promise that will resolve when the operation is complete, this promise will reject upon failure. You can also pass in a function into the `callback` parameter to have it be used in a callback format as opposed to a promise format. Nothing will be passed into the result for the promise or callback.
     *
     * You can also pass a settings object in as the first parameter. The following options are available for settings are:
     *
     * | Name | Type | Default | Notes |
     * |---|---|---|---|
     * | overwrite | boolean | true | If an existing item with the same hash key should be overwritten in the database. You can set this to false to not overwrite an existing item with the same hash key. |
     * | return | string | `item` | If the function should return the `item` or `request`. If you set this to `request` the request that would be made to DynamoDB will be returned, but no requests will be made to DynamoDB. |
     * | condition | [`dynamoose.Condition`](https://dynamoosejs.com/guide/Condition) | `null` | This is an optional instance of a Condition for the save. |
     *
     * Both `settings` and `callback` parameters are optional. You can pass in a `callback` without `settings`, just by passing in one argument and having that argument be the `callback`. You are not required to pass in `settings` if you just want to pass in a `callback`.
     *
     * ```js
     * const myUser = new User({
     * 	"id": 1,
     * 	"name": "Tim"
     * });
     *
     * myUser.save({
     * 	"overwrite": false,
     * 	"return": "item"
     * }, (error) => {
     * 	if (error) {
     * 		console.error(error);
     * 	} else {
     * 		console.log("Save operation was successful.");
     * 	}
     * });
     * ```
     * @param settings Object - `{"overwrite": boolean, "return": "item", "condition": Condition}`
     * @param callback Function - `(error: any, request: Item): void`
     */
    save(settings: ItemSaveSettings & {
        return: "item";
    }, callback: CallbackType<Item, any>): void;
    populate(): Promise<Item>;
    populate(callback: CallbackType<Item, any>): void;
    populate(settings: PopulateSettings): Promise<Item>;
    populate(settings: PopulateSettings, callback: CallbackType<Item, any>): void;
}
export declare class AnyItem extends Item {
    [key: string]: any;
}
export interface ItemObjectFromSchemaSettings {
    type: "toDynamo" | "fromDynamo";
    schema?: Schema;
    checkExpiredItem?: boolean;
    saveUnknown?: boolean;
    defaults?: boolean;
    forceDefault?: boolean;
    customTypesDynamo?: boolean;
    validate?: boolean;
    required?: boolean | "nested";
    enum?: boolean;
    populate?: boolean;
    combine?: boolean;
    modifiers?: ("set" | "get")[];
    updateTimestamps?: boolean | {
        updatedAt?: boolean;
        createdAt?: boolean;
    };
    typeCheck?: boolean;
    mapAttributes?: boolean;
}
export {};
