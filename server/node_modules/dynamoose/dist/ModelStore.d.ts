import { Model } from "./Model";
import { Item } from "./Item";
declare const returnObject: {
    <T extends Item>(input: string | Model<T>): Model<T>;
    clear(): void;
    /**
     * This method will return all of the models that are linked to the given tableName passed in. It will return `undefined` if the tableName is not linked to any models.
     * @param tableName The name of the table to get the models for.
     * @returns Array of Models.
     */
    forTableName(tableName: string): Model<Item>[] | undefined;
};
export default returnObject;
