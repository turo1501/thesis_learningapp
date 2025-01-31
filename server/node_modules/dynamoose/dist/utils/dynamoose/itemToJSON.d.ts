import { ItemArray, ObjectType } from "../../General";
import { Item } from "../../Item";
export declare function itemToJSON(this: Item): ObjectType;
export declare function itemToJSON(this: ItemArray<Item>): ObjectType[];
