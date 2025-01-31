export declare type GeneralObject<T> = {
    [key: string]: T;
};
export declare type GeneralObjectOrValue<T> = T | GeneralObject<T>;
