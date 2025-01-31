import Converter from "./converter";
import { DDBInterface } from "./ddb";
export declare class AWS {
    ddb: DDBInterface;
    converter: typeof Converter;
    constructor();
}
