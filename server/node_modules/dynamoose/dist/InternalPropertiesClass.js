"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _InternalPropertiesClass_internalProperties;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalPropertiesClass = void 0;
const Error_1 = require("./Error");
const Internal_1 = require("./Internal");
const { internalProperties } = Internal_1.default.General;
class InternalPropertiesClass {
    constructor() {
        _InternalPropertiesClass_internalProperties.set(this, void 0);
    }
    getInternalProperties(key) {
        if (key !== internalProperties) {
            throw new Error_1.default.InvalidParameter("You can not access internal properties without a valid key.");
        }
        else {
            return __classPrivateFieldGet(this, _InternalPropertiesClass_internalProperties, "f");
        }
    }
    setInternalProperties(key, value) {
        if (key !== internalProperties) {
            throw new Error_1.default.InvalidParameter("You can not set internal properties without a valid key.");
        }
        else {
            __classPrivateFieldSet(this, _InternalPropertiesClass_internalProperties, value, "f");
        }
    }
}
exports.InternalPropertiesClass = InternalPropertiesClass;
_InternalPropertiesClass_internalProperties = new WeakMap();
