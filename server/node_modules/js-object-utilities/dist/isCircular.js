"use strict";
const circularKeys = require("./circularKeys");
module.exports = (object, searchKey) => {
    return circularKeys(object, searchKey).length > 0;
};
