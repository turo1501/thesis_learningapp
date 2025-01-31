import { CallbackType, DeepPartial, ObjectType } from "../General";
import { Model } from "../Model";
import * as DynamoDB from "@aws-sdk/client-dynamodb";
import { IndexItem } from "../Schema";
import { Item as ItemCarrier } from "../Item";
import { TableClass } from "./types";
import { InternalPropertiesClass } from "../InternalPropertiesClass";
import { Instance } from "../Instance";
interface TableInternalProperties {
    options: TableOptions;
    name: string;
    originalName: string;
    instance: Instance;
    ready: boolean;
    alreadyCreated: boolean;
    setupFlowRunning: boolean;
    pendingTasks: any[];
    pendingTaskPromise: () => Promise<void>;
    models: any[];
    latestTableDetails?: DynamoDB.DescribeTableOutput;
    getIndexes: () => Promise<{
        GlobalSecondaryIndexes?: IndexItem[];
        LocalSecondaryIndexes?: IndexItem[];
        TableIndex?: any;
    }>;
    modelForObject: (object: ObjectType) => Promise<Model<ItemCarrier>>;
    getCreateTableAttributeParams: () => Promise<Pick<DynamoDB.CreateTableInput, "AttributeDefinitions" | "KeySchema" | "GlobalSecondaryIndexes" | "LocalSecondaryIndexes">>;
    getHashKey: () => string;
    getRangeKey: () => string;
    runSetupFlow: () => Promise<void>;
}
export declare class Table extends InternalPropertiesClass<TableInternalProperties> {
    static defaults: TableOptions;
    /**
     * This method is the basic entry point for creating a table in Dynamoose.
     *
     * The `name` parameter is a string representing the table name.  Prefixes and suffixes may be added to this name using the `config` options.
     *
     * The `models` parameter is an array of [Model](/guide/Model) instances.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const Order = dynamoose.model("Order", {"id": String});
     * const Shipment = dynamoose.model("Shipment", {"id": String});
     * const Table = new dynamoose.Table("Table", [Order, Shipment]);
     * ```
     *
     * The `options` parameter is an optional object used to customize settings for the table.
     *
     * | Name | Description | Type | Default |
     * |------|-------------|------|---------|
     * | create | If Dynamoose should attempt to create the table on DynamoDB. This function will run a `describeTable` call first to ensure the table doesn't already exist. For production environments we recommend setting this value to `false`. | Boolean | true |
     * | throughput | An object with settings for what the throughput for the table should be on creation, or a number which will use the same throughput for both read and write. If this is set to `ON_DEMAND` the table will use the `PAY_PER_REQUEST` billing mode. If the table is not created by Dynamoose, this object has no effect. | Object \| Number \| String |  |
     * | throughput.read | What the read throughput should be set to. Only valid if `throughput` is an object. | Number | 1 |
     * | throughput.write | What the write throughput should be set to. Only valid if `throughput` is an object. | Number | 1 |
     * | prefix | A string that should be pre-pended to the table name. | String |   |
     * | suffix | A string that should be appended to the table name. | String |   |
     * | waitForActive | Settings for how DynamoDB should handle waiting for the table to be active before enabling actions to be run on the table. This property can also be set to `false` to easily disable the behavior of waiting for the table to be active. For production environments we recommend setting this value to `false`. | Object |  |
     * | waitForActive.enabled | If Dynamoose should wait for the table to be active before running actions on it. | Boolean | true |
     * | waitForActive.check | Settings for how Dynamoose should check if the table is active | Object |  |
     * | waitForActive.check.timeout | How many milliseconds before Dynamoose should timeout and stop checking if the table is active. | Number | 180000 |
     * | waitForActive.check.frequency | How many milliseconds Dynamoose should delay between checks to see if the table is active. If this number is set to 0 it will use `setImmediate()` to run the check again. | Number | 1000 |
     * | update | If Dynamoose should update the capacity of the existing table to match the model throughput. If this is a boolean of `true` all update actions will be run. If this is an array of strings, only the actions in the array will be run. The array of strings can include the following settings to update, `ttl`, `indexes`, `throughput`, `tags`, `tableClass`. | Boolean \| [String] | false |
     * | expires | The setting to describe the time to live for items created. If you pass in a number it will be used for the `expires.ttl` setting, with default values for everything else. If this is `undefined`, no time to live will be active on the model. | Number \| Object | undefined |
     * | expires.ttl | The default amount of time the item should stay alive from creation time in milliseconds. | Number | undefined |
     * | expires.attribute | The attribute name for where the item time to live attribute. | String | `ttl` |
     * | expires.items | The options for items with ttl. | Object | {} |
     * | expires.items.returnExpired | If Dynamoose should include expired items when returning retrieved items. | Boolean | true |
     * | tags | An object containing key value pairs that should be added to the table as tags. | Object | {} |
     * | tableClass | A string representing the table class to use. | "standard" \| "infrequentAccess" | "standard" |
     * | initialize | If Dynamoose should run it's initialization flow (creating the table, updating the throughput, etc) automatically. | Boolean | true |
     *
     * The default object is listed below.
     *
     * ```js
     * {
     * 	"create": true,
     * 	"throughput": {
     * 		"read": 5,
     * 		"write": 5
     * 	}, // Same as `"throughput": 5`
     * 	"prefix": "",
     * 	"suffix": "",
     * 	"waitForActive": {
     * 		"enabled": true,
     * 		"check": {
     * 			"timeout": 180000,
     * 			"frequency": 1000
     * 		}
     * 	},
     * 	"update": false,
     * 	"expires": null,
     * 	"tags": {},
     * 	"tableClass": "standard",
     * 	"initialize": true
     * }
     * ```
     * @param instance INTERNAL PARAMETER
     * @param name The name of the table.
     * @param models An array of [Model](/guide/Model.md) instances.
     * @param options An optional object used to customize settings for the table.
     */
    constructor(instance: Instance, name: string, models: Model[], options?: TableOptionsOptional);
    /**
     * This property is a string that represents the table's hashKey.
     *
     * This property is unable to be set.
     *
     * ```js
     * const DynamoTable = new dynamoose.Table("Table", [Model]);
     *
     * console.log(DynamoTable.hashKey); // id
     * ```
     * @readonly
     */
    get hashKey(): string;
    /**
     * This property is a string that represents the table's rangeKey. It is possible this value will be `undefined` if your table doesn't have a range key.
     *
     * This property is unable to be set.
     *
     * ```js
     * const DynamoTable = new dynamoose.Table("Table", [Model]);
     *
     * console.log(DynamoTable.rangeKey); // data
     * ```
     * @readonly
     */
    get rangeKey(): string | undefined;
    /**
     * This property is a string that represents the table name. The result will include all prefixes and suffixes.
     *
     * This property is unable to be set.
     *
     * ```js
     * const DynamoTable = new dynamoose.Table("Table", [Model]);
     *
     * console.log(DynamoTable.name); // Table
     * ```
     *
     * ```js
     * const DynamoTable = new dynamoose.Table("Table", [Model], {"prefix": "MyApp_"});
     *
     * console.log(DynamoTable.name); // MyApp_Table
     * ```
     * @readonly
     */
    get name(): string;
    create(): Promise<void>;
    create(callback: CallbackType<void, any>): void;
    create(settings: TableCreateOptions): Promise<void>;
    create(settings: TableCreateOptions, callback: CallbackType<void, any>): void;
    create(settings: TableCreateOptions & {
        return: "request";
    }): Promise<DynamoDB.CreateTableInput>;
    create(settings: TableCreateOptions & {
        return: "request";
    }, callback: CallbackType<DynamoDB.CreateTableInput, any>): void;
    /**
     * This method will run Dynamoose's initialization flow. The actions run will be based on your tables options at initialization.
     *
     * - `create`
     * - `waitForActive`
     * - `update`
     *
     * ```js
     * const DynamoTable = new dynamoose.Table("Table", [Model], {"initialize": false});
     * await DynamoTable.initialize();
     * ```
     * @returns Promise\<void\>
     */
    initialize(): Promise<void>;
    /**
     * This method will run Dynamoose's initialization flow. The actions run will be based on your tables options at initialization.
     *
     * - `create`
     * - `waitForActive`
     * - `update`
     *
     * ```js
     * const DynamoTable = new dynamoose.Table("Table", [Model], {"initialize": false});
     * DynamoTable.initialize((error) => {
     * 	if (error) {
     * 		console.error(error);
     * 	} else {
     * 		console.log("Successfully initialized table");
     * 	}
     * });
     * ```
     * @param callback Function - `(error: any, response: void): void`
     */
    initialize(callback: CallbackType<any, void>): void;
}
interface TableCreateOptions {
    return: "request" | undefined;
}
export interface TableWaitForActiveSettings {
    enabled: boolean;
    check: {
        timeout: number;
        frequency: number;
    };
}
export interface TableExpiresSettings {
    ttl: number;
    attribute: string;
    items?: {
        returnExpired: boolean;
    };
}
export declare enum TableUpdateOptions {
    ttl = "ttl",
    indexes = "indexes",
    throughput = "throughput",
    tags = "tags",
    tableClass = "tableClass"
}
export interface TableOptions {
    create: boolean;
    throughput: "ON_DEMAND" | number | {
        read: number;
        write: number;
    };
    prefix: string;
    suffix: string;
    waitForActive: boolean | TableWaitForActiveSettings;
    update: boolean | TableUpdateOptions[];
    populate: string | string[] | boolean;
    expires: number | TableExpiresSettings;
    tags: {
        [key: string]: string;
    };
    tableClass: TableClass;
    initialize: boolean;
}
export type TableOptionsOptional = DeepPartial<TableOptions>;
export {};
