import { ObjectType, ModelType } from "./General";
import { Item } from "./Item";
import { InternalPropertiesClass } from "./InternalPropertiesClass";
export interface SerializerOptions {
    include?: string[];
    exclude?: string[];
    modify?: (serialized: ObjectType, original: ObjectType) => ObjectType;
}
interface SerializerInternalProperties {
    serializers: {
        [key: string]: SerializerOptions;
    };
    defaultSerializer?: string;
    serializeMany: (itemsArray: ModelType<Item>[], nameOrOptions: SerializerOptions | string) => ObjectType[];
    serialize: (item: ObjectType, nameOrOptions: SerializerOptions | string) => ObjectType;
}
export declare class Serializer extends InternalPropertiesClass<SerializerInternalProperties> {
    static defaultName: string;
    constructor();
    add(name: string, options: SerializerOptions): void;
    default: {
        set: (name?: string) => void;
    };
    delete(name: string): void;
}
export {};
