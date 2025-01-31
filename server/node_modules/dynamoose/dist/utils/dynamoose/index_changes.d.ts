import { IndexItem } from "../../Schema";
import { Table } from "../../Table";
export declare enum TableIndexChangeType {
    add = "add",
    delete = "delete"
}
export interface ModelIndexAddChange {
    type: TableIndexChangeType.add;
    spec: IndexItem;
}
export interface ModelIndexDeleteChange {
    type: TableIndexChangeType.delete;
    name: string;
}
declare const index_changes: (table: Table, existingIndexes?: any[]) => Promise<(ModelIndexAddChange | ModelIndexDeleteChange)[]>;
export default index_changes;
