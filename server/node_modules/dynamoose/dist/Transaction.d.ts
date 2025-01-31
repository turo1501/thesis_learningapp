import * as DynamoDB from "@aws-sdk/client-dynamodb";
import { CallbackType } from "./General";
export declare enum TransactionReturnOptions {
    request = "request",
    items = "items"
}
declare enum TransactionType {
    get = "get",
    write = "write"
}
export interface TransactionSettings {
    return: TransactionReturnOptions;
    type?: TransactionType;
}
export type GetTransactionInput = {
    Get: DynamoDB.GetItemInput;
};
export type CreateTransactionInput = {
    Put: DynamoDB.PutItemInput;
};
export type DeleteTransactionInput = {
    Delete: DynamoDB.DeleteItemInput;
};
export type UpdateTransactionInput = {
    Update: DynamoDB.UpdateItemInput;
};
export type ConditionTransactionInput = {
    ConditionCheck: DynamoDB.ConditionCheck;
};
type Transaction = GetTransactionInput | CreateTransactionInput | DeleteTransactionInput | UpdateTransactionInput | ConditionTransactionInput;
type Transactions = (Transaction | Promise<Transaction>)[];
type TransactionCallback = CallbackType<any, any>;
type TransactionReturnType = any;
declare function Transaction(transactions: Transactions): TransactionReturnType;
declare function Transaction(transactions: Transactions, settings: TransactionSettings): TransactionReturnType;
declare function Transaction(transactions: Transactions, callback: TransactionCallback): TransactionReturnType;
declare function Transaction(transaction: Transactions, settings: TransactionSettings, callback: TransactionCallback): TransactionReturnType;
export default Transaction;
