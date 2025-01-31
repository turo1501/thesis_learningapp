import { Table } from ".";
import * as DynamoDB from "@aws-sdk/client-dynamodb";
export declare function getTableDetails(table: Table, settings?: {
    allowError?: boolean;
    forceRefresh?: boolean;
}): Promise<DynamoDB.DescribeTableOutput>;
export declare function getTagDetails(table: Table): Promise<DynamoDB.ListTagsOfResourceOutput>;
export declare function createTableRequest(table: Table): Promise<DynamoDB.CreateTableInput>;
export declare function createTable(table: Table): Promise<void | (() => Promise<void>)>;
export declare function createTable(table: Table, force: true): Promise<void>;
export declare function createTable(table: Table, force: false): Promise<void | (() => Promise<void>)>;
export declare function updateTimeToLive(table: Table): Promise<void>;
export declare function waitForActive(table: Table, forceRefreshOnFirstAttempt?: boolean): () => Promise<void>;
export declare function updateTable(table: Table): Promise<void>;
