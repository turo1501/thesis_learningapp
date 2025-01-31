declare const _default: {
    /**
     * Setting an attribute value to this will cause it to bypass the `default` value, and set it to `undefined` in the database.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const User = dynamoose.model("User", {"id": String, "name": {"type": String, "default": "Bob"}});
     * const user = new User({"id": 1, "name": dynamoose.type.UNDEFINED});
     * await user.save();
     * // {"id": 1}
     * // will be saved to the database (notice the `name` property is undefined and did not use the `default` property)
     * ```
     */
    UNDEFINED: symbol;
    /**
     * Setting a schema attribute to this will cause it to reference itself for populating objects.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const User = dynamoose.model("User", {"id": String, "parent": dynamoose.type.THIS});
     * ```
     *
     * :::note
     * This property might be used for other things in the future.
     * :::
     */
    THIS: symbol;
    /**
     * Setting a schema attribute to this will cause it to use the DynamoDB `null` type.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const User = dynamoose.model("User", {"id": String, "parent": dynamoose.type.NULL});
     * ```
     *
     * :::note
     * This property might be used for other things in the future.
     * :::
     */
    NULL: symbol;
    /**
     * Setting a schema type attribute to this will allow it to be any type.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const User = dynamoose.model("User", {"id": String, "value": dynamoose.type.ANY});
     * ```
     *
     * Keep in mind the above code won't allow for nested attributes (attributes within objects or arrays). You must use the [`schema`](/guide/Schema#schema-object--array) attribute to define the nested time of the attribute.
     *
     * You can also set the [`schema`](/guide/Schema#schema-object--array) attribute to this to allow the schema to be any type.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const User = dynamoose.model("User", {"id": String, "value": {"type": Object, "schema": dynamoose.type.ANY}});
     * ```
     *
     * If you want to allow for the value to be anything as well as all nested attributes to be anything, you can use the following code.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const User = dynamoose.model("User", {"id": String, "value": {"type": dynamoose.type.ANY, "schema": dynamoose.type.ANY}});
     * ```
     *
     * :::note
     * This property might be used for other things in the future.
     * :::
     */
    ANY: symbol;
    /**
     * Setting a schema attribute to this type will act as a constant type based on the value you pass in.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const User = dynamoose.model("User", {"id": String, "type": dynamoose.type.CONSTANT("user")});
     * ```
     * @param value The value you wish to use as the constant.
     * @returns An object that can be used as a schema value for a constant.
     */
    CONSTANT: (value: string | number | boolean) => {
        value: string;
        settings: {
            value: string | number | boolean;
        };
    };
    /**
     * Setting a schema attribute to this type will act as a combine type based on the attribute array you pass in along with the separator string.
     *
     * ```js
     * const dynamoose = require("dynamoose");
     *
     * const User = dynamoose.model("User", {"id": String, "firstName": String, "lastName": String, "fullName": dynamoose.type.COMBINE(["firstName", "lastName"], " ")});
     * ```
     * @param attributes An array of strings representing the names of the attributes you wish to combine.
     * @param separator The separator string you wish to use between the attributes. Default: `","`.
     * @returns An object that can be used as a schema value for a combine.
     */
    COMBINE: (attributes: string[], separator?: string | undefined) => {
        value: string;
        settings: {
            attributes: string[];
            separator?: string | undefined;
        };
    };
};
export default _default;
