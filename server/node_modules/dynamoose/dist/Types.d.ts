import * as DynamoDB from "@aws-sdk/client-dynamodb";
export type AttributeMap = {
    [key: string]: DynamoDB.AttributeValue;
};
export type ExpressionAttributeNameMap = {
    [key: string]: string;
};
export type ExpressionAttributeValueMap = {
    [key: string]: DynamoDB.AttributeValue;
};
declare global {
    interface Blob {
    }
    interface File {
    }
}
declare global {
    interface ReadableStream {
    }
}
export type AnySimpleValue = string | number | symbol;
export type AnySimpleObject = Record<string, AnySimpleValue>;
export type ArrayItemsMerger = <T extends AnySimpleObject = AnySimpleObject>(target: T[], source: T[]) => T[];
