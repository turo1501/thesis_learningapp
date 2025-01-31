import { TableOptions, TableOptionsOptional } from "./index";
export declare const original: TableOptions;
export interface TableOptionsAccessor {
    "set": (val: TableOptionsOptional) => void;
    "get": () => TableOptionsOptional;
}
declare const customObject: TableOptionsAccessor;
export { customObject as custom };
