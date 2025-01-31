# js-object-utilities

This package has a bunch of helper methods to work with nested objects in JavaScript.

## Install

```
npm i js-object-utilities
```

## API

### objectutils.get(obj, key)

This function takes in an object (`obj`) and a key (`key`) and returns the value for the given key.

```js
const objectutils = require("js-object-utilities");
console.log(objectutils.get({
	"data": {
		"hello": "world"
	}
}, "data.hello"));

// Will print "world"
```

### objectutils.set(obj, key, value)

This function takes in an object (`obj`), key (`key`), and a value (`value`) and mutates the object setting the value for the given key.

```js
const objectutils = require("js-object-utilities");
const object = {
	"data": {
		"hello": "world"
	}
};
objectutils.set(object, "data.hello", "universe");
console.log(object); // {"data": {"hello": "universe"}}
```

### objectutils.delete(obj, key)

This function takes in an object (`obj`), and key (`key`), and deletes the given value for the key you passed in.

```js
const objectutils = require("js-object-utilities");
const object = {
	"data": {
		"hello": "world"
	}
};
objectutils.delete(object, "data.hello");
console.log(object); // {"data": {}}
```

### objectutils.pick(obj, keys)

This function takes in an object (`obj`), and array of keys (`keys`), and returns an object for the given keys you passed in.

```js
const objectutils = require("js-object-utilities");
const object = {
	"data": {
		"hello": "world",
		"space": "travel",
		"node": "npm"
	}
};
objectutils.delete(object, ["data.hello", "data.space"]);
console.log(object); // {"data": {"hello": "world", "space": "travel"}}
```

### objectutils.keys(obj)

This function takes in an object (`obj`), and returns an array of keys included in that object.

```js
const objectutils = require("js-object-utilities");
const object = {
	"data": {
		"hello": "world",
		"space": "travel",
		"node": "npm"
	}
};
console.log(objectutils.keys(object)); // ["data", "data.hello", "data.space", "data.node"]
```

### objectutils.entries(obj)

This function takes in an object (`obj`), and returns an array of entries included in that object.

```js
const objectutils = require("js-object-utilities");
const object = {
	"data": {
		"hello": "world",
		"space": "travel",
		"node": "npm"
	}
};
console.log(objectutils.keys(object)); // [["data", {"hello": "world", "space": "travel", "node": "npm"}], ["data.hello", "world"], ["data.space", "travel"], ["data.node", "npm]]
```

### objectutils.equals(obj)

This function takes in two values, and returns a boolean representing if they are equal. If objects as passed in it will check to ensure the entire object is identical.

```js
const objectutils = require("js-object-utilities");
const object = {
	"data": {
		"hello": "world",
		"space": "travel",
		"node": "npm"
	}
};
console.log(objectutils.equals(object, {
	"data": {
		"hello": "world",
		"space": "travel",
		"node": "npm"
	}
})); // true

console.log(objectutils.equals(object, {
	"data": {
		"hello": "universe",
		"space": "travel",
		"node": "npm"
	}
})); // false
```

### objectutils.clearEmpties(obj)

This function takes in an object and mutates it to remove all objects with a length of 0.

```js
const objectutils = require("js-object-utilities");
const object = {
	"data": {
		"hello": "world",
		"space": "travel",
		"node": "npm",
		"otherData": {}
	}
};
objectutils.clearEmpties(object);
console.log(object);
// {
// 	"data": {
// 		"hello": "world",
// 		"space": "travel",
// 		"node": "npm",
// 	}
// }
```

### objectutils.isCircular(obj[, searchKey])

This function checks to see if an object is circular. If a search key is passed in it will only return `true` if the object is circular and the search key is the key that caused the circularity.

This function will also check all nested objects for circularity.

```js
const objectutils = require("js-object-utilities");

let object = {};
object.array = {"first": 1};
object.array2 = object;

const isCircular = objectutils.isCircular(object);
console.log(isCircular); // true

const isRandomKeyCircular = objectutils.isCircular(object, "random");
console.log(isRandomKeyCircular); // false

const isArray2KeyCircular = objectutils.isCircular(object, "array2");
console.log(isArray2KeyCircular); // true
```

### objectutils.circularKeys(obj[, searchKey])

This function is identical to `objectutils.isCircular` except it returns an array of keys that are circular.

```js
const objectutils = require("js-object-utilities");

let object = {};
object.array = {"first": 1};
object.array2 = object;

const circularKeys = objectutils.circularKeys(object);
console.log(circularKeys); // ["array2"]

const randomKeyCircular = objectutils.circularKeys(object, "random");
console.log(randomKeyCircular); // []

const array2KeyCircular = objectutils.circularKeys(object, "array2");
console.log(array2KeyCircular); // ["array2"]
```
