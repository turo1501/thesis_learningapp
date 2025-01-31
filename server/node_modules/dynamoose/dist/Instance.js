"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instance = void 0;
const aws_1 = require("./aws");
const Table_1 = require("./Table");
class Instance {
    /**
     * This class allows you to create a new instance of Dynamoose, allowing for easy multi-region AWS requests.
     *
     * By default Dynamoose will create a default instance for you automatically. This both ensures backwards compatibility, and allows for an easy to use API for users not using this feature.
     *
     * ```js
     * const otherDynamooseInstance = new dynamoose.Instance();
     * ```
     */
    constructor() {
        this.aws = new aws_1.AWS();
        this.Table = getInstanceTable(this);
    }
}
exports.Instance = Instance;
Instance.default = new Instance();
function getInstanceTable(instance) {
    class Table extends Table_1.Table {
        constructor(name, models, options) {
            super(instance, name, models, options);
        }
    }
    return Table;
}
