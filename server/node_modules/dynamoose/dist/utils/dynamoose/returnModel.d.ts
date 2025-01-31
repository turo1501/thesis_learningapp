import { ModelType } from "../../General";
import { AnyItem, Item } from "../../Item";
import { Model } from "../../Model";
declare const _default: <T extends Item = AnyItem>(model: Model<T>) => ModelType<T>;
export default _default;
