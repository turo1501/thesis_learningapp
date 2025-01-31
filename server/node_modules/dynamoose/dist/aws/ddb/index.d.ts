import * as DynamoDB from "@aws-sdk/client-dynamodb";
export interface DDBInterface {
    (): DynamoDB.DynamoDB;
    DynamoDB: typeof DynamoDB.DynamoDB;
    set: (ddb: DynamoDB.DynamoDB) => void;
    revert: () => void;
    local: (endpoint?: string) => void;
}
export default function (): DDBInterface;
