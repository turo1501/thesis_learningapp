import { GeneralObjectOrValue } from "./types";
declare const main: <T>(object: GeneralObjectOrValue<T>, existingKey?: string) => [string, GeneralObjectOrValue<T>][];
export = main;
