/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/better-sqlite3/lib/binding.js"
/*!****************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/binding.js ***!
  \****************************************************/
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");

const PREBUILD_PLATFORMS = ['linux', 'darwin', 'win32'];
const PREBUILD_ARCHS = ['x64', 'arm64'];
let DEFAULT_ADDON;

function getBinding(nativeBinding) {
	// If a path was provided, load the binding from the filesystem.
	if (typeof nativeBinding === 'string') {
		// See <https://webpack.js.org/api/module-variables/#__non_webpack_require__-webpack-specific>
		const requireFunc = typeof require === 'function' ? eval("require") : require;
		return requireFunc(path.resolve(nativeBinding).replace(/(\.node)?$/, '.node'));
	}

	// If an object was provided, use it as the binding directly.
	if (typeof nativeBinding === 'object' && nativeBinding !== null) {
		return nativeBinding;
	}

	// If we're using the default binding and it already exists, just return it.
	if (DEFAULT_ADDON) {
		return DEFAULT_ADDON;
	}

	// Otherwise, try to find the binding as a prebuilt binary.
	let filename = getPrebuildPath();
	if (filename) {
		return DEFAULT_ADDON = require(filename);
	}

	// If no prebuilt binary was found, try the default node-gyp locations.
	filename = path.join(__dirname, '..', 'build', 'Debug', 'better_sqlite3.node');
	if (!fs.existsSync(filename)) {
		filename = path.join(__dirname, '..', 'build', 'Release', 'better_sqlite3.node');
	}
	return DEFAULT_ADDON = __webpack_require__(Object(function webpackMissingModule() { const e = new Error("Cannot find module 'C:\\Users\\라희\\OneDrive\\바탕 화면\\ᏊᵕꈊᵕᏊ\\dal-calendar\\node_modules\\better-sqlite3\\build\\Release\\better_sqlite3.node'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
}

function getPrebuildPath() {
	if (PREBUILD_PLATFORMS.includes(process.platform) && PREBUILD_ARCHS.includes(process.arch)) {
		const target = `${isLinuxMusl() ? 'linuxmusl' : process.platform}-${process.arch}`;
		const filename = __webpack_require__.ab + "prebuilds/" + target + '.node';
		if (fs.existsSync(filename)) {
			return filename;
		}
	}
	return null;
}

function isLinuxMusl() {
	return process.platform === 'linux' && !process.report.getReport().header.glibcVersionRuntime;
}

exports.getBinding = getBinding;
exports.getPrebuildPath = getPrebuildPath;

// This script is executed directly by binding.gyp to detect prebuilt binaries.
if (false) // removed by dead control flow
{}


/***/ },

/***/ "./node_modules/better-sqlite3/lib/database.js"
/*!*****************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/database.js ***!
  \*****************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const util = __webpack_require__(/*! ./util */ "./node_modules/better-sqlite3/lib/util.js");
const SqliteError = __webpack_require__(/*! ./sqlite-error */ "./node_modules/better-sqlite3/lib/sqlite-error.js");

module.exports = function createDatabase(getAddon, allowNativeBinding) {
	function Database(filenameGiven, options) {
		if (new.target == null) {
			return new Database(filenameGiven, options);
		}

		// Apply defaults
		let buffer;
		if (Buffer.isBuffer(filenameGiven)) {
			buffer = filenameGiven;
			filenameGiven = ':memory:';
		}
		if (filenameGiven == null) filenameGiven = '';
		if (options == null) options = {};

		// Validate arguments
		if (typeof filenameGiven !== 'string') throw new TypeError('Expected first argument to be a string');
		if (typeof options !== 'object') throw new TypeError('Expected second argument to be an options object');
		if ('readOnly' in options) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
		if ('memory' in options) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');

		// Interpret options
		const filename = filenameGiven.trim();
		const anonymous = filename === '' || filename === ':memory:';
		const readonly = util.getBooleanOption(options, 'readonly');
		const fileMustExist = util.getBooleanOption(options, 'fileMustExist');
		const timeout = 'timeout' in options ? options.timeout : 5000;
		const verbose = 'verbose' in options ? options.verbose : null;
		const nativeBinding = 'nativeBinding' in options ? options.nativeBinding : null;

		// Validate interpreted options
		if (readonly && anonymous && !buffer) throw new TypeError('In-memory/temporary databases cannot be readonly');
		if (!Number.isInteger(timeout) || timeout < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
		if (timeout > 0x7fffffff) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
		if (verbose != null && typeof verbose !== 'function') throw new TypeError('Expected the "verbose" option to be a function');
		if (!allowNativeBinding && 'nativeBinding' in options) throw new TypeError('The "nativeBinding" option is only supported by the default better-sqlite3 entrypoint');
		if (allowNativeBinding && nativeBinding != null && typeof nativeBinding !== 'string' && typeof nativeBinding !== 'object') throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');

		// Load the native addon
		const addon = getAddon(nativeBinding);
		if (!addon.isInitialized) {
			addon.initialize(SqliteError, arrayFactory, arrayAppender, rowFactory, recordFactory);
			addon.isInitialized = true;
		}

		// Make sure the specified directory exists
		if (!anonymous && !filename.startsWith('file:') && !fs.existsSync(path.dirname(filename))) {
			throw new TypeError('Cannot open database because the directory does not exist');
		}

		Object.defineProperties(this, {
			[util.cppdb]: { value: new addon.Database(filename, filenameGiven, anonymous, readonly, fileMustExist, timeout, verbose || null, buffer || null) },
			...wrappers.getters,
		});
	}

	const wrappers = __webpack_require__(/*! ./methods/wrappers */ "./node_modules/better-sqlite3/lib/methods/wrappers.js");
	Database.prototype.prepare = wrappers.prepare;
	Database.prototype.transaction = __webpack_require__(/*! ./methods/transaction */ "./node_modules/better-sqlite3/lib/methods/transaction.js");
	Database.prototype.pragma = __webpack_require__(/*! ./methods/pragma */ "./node_modules/better-sqlite3/lib/methods/pragma.js");
	Database.prototype.explain = __webpack_require__(/*! ./methods/explain */ "./node_modules/better-sqlite3/lib/methods/explain.js");
	Database.prototype.backup = __webpack_require__(/*! ./methods/backup */ "./node_modules/better-sqlite3/lib/methods/backup.js");
	Database.prototype.serialize = __webpack_require__(/*! ./methods/serialize */ "./node_modules/better-sqlite3/lib/methods/serialize.js");
	Database.prototype.function = __webpack_require__(/*! ./methods/function */ "./node_modules/better-sqlite3/lib/methods/function.js");
	Database.prototype.aggregate = __webpack_require__(/*! ./methods/aggregate */ "./node_modules/better-sqlite3/lib/methods/aggregate.js");
	Database.prototype.table = __webpack_require__(/*! ./methods/table */ "./node_modules/better-sqlite3/lib/methods/table.js");
	Database.prototype.loadExtension = wrappers.loadExtension;
	Database.prototype.exec = wrappers.exec;
	Database.prototype.close = wrappers.close;
	Database.prototype.defaultSafeIntegers = wrappers.defaultSafeIntegers;
	Database.prototype.unsafeMode = wrappers.unsafeMode;
	Database.prototype[util.inspect] = __webpack_require__(/*! ./methods/inspect */ "./node_modules/better-sqlite3/lib/methods/inspect.js");

	return Database;
};

function arrayFactory(...values) {
	return values;
}

function arrayAppender(array, ...values) {
	const offset = array.length;
	for (let i = 0; i < values.length; ++i) {
		array[offset + i] = values[i];
	}
}

function rowFactory(...keys) {
	if (!keys.includes('__proto__')) {
		const parameters = keys.map((_, index) => `v${index}`).join(',');
		const properties = keys.map((key, index) => `${JSON.stringify(key)}:v${index}`).join(',');
		return Function(`return (${parameters}) => ({${properties}})`)();
	}
	return (...values) => {
		const row = {};
		for (let i = 0; i < keys.length; ++i) row[keys[i]] = values[i];
		return row;
	};
}

function recordFactory(value) {
	return { value, done: false };
}


/***/ },

/***/ "./node_modules/better-sqlite3/lib/index.js"
/*!**************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/index.js ***!
  \**************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

module.exports = __webpack_require__(/*! ./database */ "./node_modules/better-sqlite3/lib/database.js")((__webpack_require__(/*! ./binding */ "./node_modules/better-sqlite3/lib/binding.js").getBinding), true);
module.exports.SqliteError = __webpack_require__(/*! ./sqlite-error */ "./node_modules/better-sqlite3/lib/sqlite-error.js");


/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/aggregate.js"
/*!**************************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/aggregate.js ***!
  \**************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const { getBooleanOption, cppdb } = __webpack_require__(/*! ../util */ "./node_modules/better-sqlite3/lib/util.js");

module.exports = function defineAggregate(name, options) {
	// Validate arguments
	if (typeof name !== 'string') throw new TypeError('Expected first argument to be a string');
	if (typeof options !== 'object' || options === null) throw new TypeError('Expected second argument to be an options object');
	if (!name) throw new TypeError('User-defined function name cannot be an empty string');

	// Interpret options
	const start = 'start' in options ? options.start : null;
	const step = getFunctionOption(options, 'step', true);
	const inverse = getFunctionOption(options, 'inverse', false);
	const result = getFunctionOption(options, 'result', false);
	const safeIntegers = 'safeIntegers' in options ? +getBooleanOption(options, 'safeIntegers') : 2;
	const deterministic = getBooleanOption(options, 'deterministic');
	const directOnly = getBooleanOption(options, 'directOnly');
	const varargs = getBooleanOption(options, 'varargs');
	let argCount = -1;

	// Determine argument count
	if (!varargs) {
		argCount = Math.max(getLength(step), inverse ? getLength(inverse) : 0);
		if (argCount > 0) argCount -= 1;
		if (argCount > 100) throw new RangeError('User-defined functions cannot have more than 100 arguments');
	}

	this[cppdb].aggregate(start, step, inverse, result, name, argCount, safeIntegers, deterministic, directOnly);
	return this;
};

const getFunctionOption = (options, key, required) => {
	const value = key in options ? options[key] : null;
	if (typeof value === 'function') return value;
	if (value != null) throw new TypeError(`Expected the "${key}" option to be a function`);
	if (required) throw new TypeError(`Missing required option "${key}"`);
	return null;
};

const getLength = ({ length }) => {
	if (Number.isInteger(length) && length >= 0) return length;
	throw new TypeError('Expected function.length to be a positive integer');
};


/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/backup.js"
/*!***********************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/backup.js ***!
  \***********************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
const { promisify } = __webpack_require__(/*! util */ "util");
const { cppdb } = __webpack_require__(/*! ../util */ "./node_modules/better-sqlite3/lib/util.js");
const fsAccess = promisify(fs.access);

module.exports = async function backup(filename, options) {
	if (options == null) options = {};

	// Validate arguments
	if (typeof filename !== 'string') throw new TypeError('Expected first argument to be a string');
	if (typeof options !== 'object') throw new TypeError('Expected second argument to be an options object');

	// Interpret options
	filename = filename.trim();
	const attachedName = 'attached' in options ? options.attached : 'main';
	const handler = 'progress' in options ? options.progress : null;

	// Validate interpreted options
	if (!filename) throw new TypeError('Backup filename cannot be an empty string');
	if (filename === ':memory:') throw new TypeError('Invalid backup filename ":memory:"');
	if (typeof attachedName !== 'string') throw new TypeError('Expected the "attached" option to be a string');
	if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
	if (handler != null && typeof handler !== 'function') throw new TypeError('Expected the "progress" option to be a function');

	// Make sure the specified directory exists
	await fsAccess(path.dirname(filename)).catch(() => {
		throw new TypeError('Cannot save backup because the directory does not exist');
	});

	const isNewFile = await fsAccess(filename).then(() => false, () => true);
	return runBackup(this[cppdb].backup(this, attachedName, filename, isNewFile), handler || null);
};

const runBackup = (backup, handler) => {
	let rate = 0;
	let useDefault = true;

	return new Promise((resolve, reject) => {
		setImmediate(function step() {
			try {
				const progress = backup.transfer(rate);
				if (!progress.remainingPages) {
					backup.close();
					resolve(progress);
					return;
				}
				if (useDefault) {
					useDefault = false;
					rate = 100;
				}
				if (handler) {
					const ret = handler(progress);
					if (ret !== undefined) {
						if (typeof ret === 'number' && ret === ret) rate = Math.max(0, Math.min(0x7fffffff, Math.round(ret)));
						else throw new TypeError('Expected progress callback to return a number or undefined');
					}
				}
				setImmediate(step);
			} catch (err) {
				backup.close();
				reject(err);
			}
		});
	});
};


/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/explain.js"
/*!************************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/explain.js ***!
  \************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const { cppdb } = __webpack_require__(/*! ../util */ "./node_modules/better-sqlite3/lib/util.js");

module.exports = function explain(source) {
	if (typeof source !== 'string') throw new TypeError('Expected first argument to be a string');

	const stmt = this[cppdb].prepare(`EXPLAIN ${source}`, this, false, true);
	return stmt.all();
};


/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/function.js"
/*!*************************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/function.js ***!
  \*************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const { getBooleanOption, cppdb } = __webpack_require__(/*! ../util */ "./node_modules/better-sqlite3/lib/util.js");

module.exports = function defineFunction(name, options, fn) {
	// Apply defaults
	if (options == null) options = {};
	if (typeof options === 'function') { fn = options; options = {}; }

	// Validate arguments
	if (typeof name !== 'string') throw new TypeError('Expected first argument to be a string');
	if (typeof fn !== 'function') throw new TypeError('Expected last argument to be a function');
	if (typeof options !== 'object') throw new TypeError('Expected second argument to be an options object');
	if (!name) throw new TypeError('User-defined function name cannot be an empty string');

	// Interpret options
	const safeIntegers = 'safeIntegers' in options ? +getBooleanOption(options, 'safeIntegers') : 2;
	const deterministic = getBooleanOption(options, 'deterministic');
	const directOnly = getBooleanOption(options, 'directOnly');
	const varargs = getBooleanOption(options, 'varargs');
	let argCount = -1;

	// Determine argument count
	if (!varargs) {
		argCount = fn.length;
		if (!Number.isInteger(argCount) || argCount < 0) throw new TypeError('Expected function.length to be a positive integer');
		if (argCount > 100) throw new RangeError('User-defined functions cannot have more than 100 arguments');
	}

	this[cppdb].function(fn, name, argCount, safeIntegers, deterministic, directOnly);
	return this;
};


/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/inspect.js"
/*!************************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/inspect.js ***!
  \************************************************************/
(module) {

"use strict";

const DatabaseInspection = function Database() {};

module.exports = function inspect(depth, opts) {
	return Object.assign(new DatabaseInspection(), this);
};



/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/pragma.js"
/*!***********************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/pragma.js ***!
  \***********************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const { getBooleanOption, cppdb } = __webpack_require__(/*! ../util */ "./node_modules/better-sqlite3/lib/util.js");

module.exports = function pragma(source, options) {
	if (options == null) options = {};
	if (typeof source !== 'string') throw new TypeError('Expected first argument to be a string');
	if (typeof options !== 'object') throw new TypeError('Expected second argument to be an options object');
	const simple = getBooleanOption(options, 'simple');

	const stmt = this[cppdb].prepare(`PRAGMA ${source}`, this, true, false);
	return simple ? stmt.pluck().get() : stmt.all();
};


/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/serialize.js"
/*!**************************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/serialize.js ***!
  \**************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const { cppdb } = __webpack_require__(/*! ../util */ "./node_modules/better-sqlite3/lib/util.js");

module.exports = function serialize(options) {
	if (options == null) options = {};

	// Validate arguments
	if (typeof options !== 'object') throw new TypeError('Expected first argument to be an options object');

	// Interpret and validate options
	const attachedName = 'attached' in options ? options.attached : 'main';
	if (typeof attachedName !== 'string') throw new TypeError('Expected the "attached" option to be a string');
	if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');

	return this[cppdb].serialize(attachedName);
};


/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/table.js"
/*!**********************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/table.js ***!
  \**********************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const { cppdb } = __webpack_require__(/*! ../util */ "./node_modules/better-sqlite3/lib/util.js");

module.exports = function defineTable(name, factory) {
	// Validate arguments
	if (typeof name !== 'string') throw new TypeError('Expected first argument to be a string');
	if (!name) throw new TypeError('Virtual table module name cannot be an empty string');

	// Determine whether the module is eponymous-only or not
	let eponymous = false;
	if (typeof factory === 'object' && factory !== null) {
		eponymous = true;
		factory = defer(parseTableDefinition(factory, 'used', name));
	} else {
		if (typeof factory !== 'function') throw new TypeError('Expected second argument to be a function or a table definition object');
		factory = wrapFactory(factory);
	}

	this[cppdb].table(factory, name, eponymous);
	return this;
};

function wrapFactory(factory) {
	return function virtualTableFactory(moduleName, databaseName, tableName, ...args) {
		const thisObject = {
			module: moduleName,
			database: databaseName,
			table: tableName,
		};

		// Generate a new table definition by invoking the factory
		const def = apply.call(factory, thisObject, args);
		if (typeof def !== 'object' || def === null) {
			throw new TypeError(`Virtual table module "${moduleName}" did not return a table definition object`);
		}

		return parseTableDefinition(def, 'returned', moduleName);
	};
}

function parseTableDefinition(def, verb, moduleName) {
	// Validate required properties
	if (!hasOwnProperty.call(def, 'rows')) {
		throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "rows" property`);
	}
	if (!hasOwnProperty.call(def, 'columns')) {
		throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "columns" property`);
	}

	// Validate "rows" property
	const rows = def.rows;
	if (typeof rows !== 'function' || Object.getPrototypeOf(rows) !== GeneratorFunctionPrototype) {
		throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "rows" property (should be a generator function)`);
	}

	// Validate "columns" property
	let columns = def.columns;
	if (!Array.isArray(columns) || !isStringArray(columns = [...columns])) {
		throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "columns" property (should be an array of strings)`);
	}
	if (columns.length !== new Set(columns).size) {
		throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate column names`);
	}
	if (!columns.length) {
		throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with zero columns`);
	}

	// Validate "parameters" property
	let parameters;
	if (hasOwnProperty.call(def, 'parameters')) {
		parameters = def.parameters;
		if (!Array.isArray(parameters) || !isStringArray(parameters = [...parameters])) {
			throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "parameters" property (should be an array of strings)`);
		}
	} else {
		parameters = inferParameters(rows);
	}
	if (parameters.length !== new Set(parameters).size) {
		throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate parameter names`);
	}
	if (parameters.length > 32) {
		throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with more than the maximum number of 32 parameters`);
	}
	for (const parameter of parameters) {
		if (columns.includes(parameter)) {
			throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with column "${parameter}" which was ambiguously defined as both a column and parameter`);
		}
	}

	// Validate "safeIntegers" option
	let safeIntegers = 2;
	if (hasOwnProperty.call(def, 'safeIntegers')) {
		const bool = def.safeIntegers;
		if (typeof bool !== 'boolean') {
			throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
		}
		safeIntegers = +bool;
	}

	// Validate "directOnly" option
	let directOnly = false;
	if (hasOwnProperty.call(def, 'directOnly')) {
		directOnly = def.directOnly;
		if (typeof directOnly !== 'boolean') {
			throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "directOnly" property (should be a boolean)`);
		}
	}

	// Generate SQL for the virtual table definition
	const columnDefinitions = [
		...parameters.map(identifier).map(str => `${str} HIDDEN`),
		...columns.map(identifier),
	];
	return [
		`CREATE TABLE x(${columnDefinitions.join(', ')});`,
		wrapGenerator(rows, new Map(columns.map((x, i) => [x, parameters.length + i])), moduleName),
		parameters,
		safeIntegers,
		directOnly,
	];
}

function wrapGenerator(generator, columnMap, moduleName) {
	return function* virtualTable(...args) {
		/*
			We must defensively clone any buffers in the arguments, because
			otherwise the generator could mutate one of them, which would cause
			us to return incorrect values for hidden columns, potentially
			corrupting the database.
		 */
		const output = args.map(x => Buffer.isBuffer(x) ? Buffer.from(x) : x);
		for (let i = 0; i < columnMap.size; ++i) {
			output.push(null); // Fill with nulls to prevent gaps in array (v8 optimization)
		}
		for (const row of generator(...args)) {
			if (Array.isArray(row)) {
				extractRowArray(row, output, columnMap.size, moduleName);
				yield output;
			} else if (typeof row === 'object' && row !== null) {
				extractRowObject(row, output, columnMap, moduleName);
				yield output;
			} else {
				throw new TypeError(`Virtual table module "${moduleName}" yielded something that isn't a valid row object`);
			}
		}
	};
}

function extractRowArray(row, output, columnCount, moduleName) {
	if (row.length !== columnCount) {
		throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an incorrect number of columns`);
	}
	const offset = output.length - columnCount;
	for (let i = 0; i < columnCount; ++i) {
		output[i + offset] = row[i];
	}
}

function extractRowObject(row, output, columnMap, moduleName) {
	let count = 0;
	for (const key of Object.keys(row)) {
		const index = columnMap.get(key);
		if (index === undefined) {
			throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an undeclared column "${key}"`);
		}
		output[index] = row[key];
		count += 1;
	}
	if (count !== columnMap.size) {
		throw new TypeError(`Virtual table module "${moduleName}" yielded a row with missing columns`);
	}
}

function inferParameters({ length }) {
	if (!Number.isInteger(length) || length < 0) {
		throw new TypeError('Expected function.length to be a positive integer');
	}
	const params = [];
	for (let i = 0; i < length; ++i) {
		params.push(`$${i + 1}`);
	}
	return params;
}

const { hasOwnProperty } = Object.prototype;
const { apply } = Function.prototype;
const GeneratorFunctionPrototype = Object.getPrototypeOf(function*(){});
const identifier = str => `"${str.replace(/"/g, '""')}"`;
const defer = x => () => x;
const isStringArray = (arr) => {
	for (let i = 0; i < arr.length; ++i) {
		if (typeof arr[i] !== 'string') return false;
	}
	return true;
};


/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/transaction.js"
/*!****************************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/transaction.js ***!
  \****************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

const { cppdb } = __webpack_require__(/*! ../util */ "./node_modules/better-sqlite3/lib/util.js");
const controllers = new WeakMap();

module.exports = function transaction(fn) {
	if (typeof fn !== 'function') throw new TypeError('Expected first argument to be a function');

	const db = this[cppdb];
	const controller = getController(db, this);
	const { apply } = Function.prototype;

	// Each version of the transaction function has these same properties
	const properties = {
		default: { value: wrapTransaction(apply, fn, db, controller.default) },
		deferred: { value: wrapTransaction(apply, fn, db, controller.deferred) },
		immediate: { value: wrapTransaction(apply, fn, db, controller.immediate) },
		exclusive: { value: wrapTransaction(apply, fn, db, controller.exclusive) },
		database: { value: this, enumerable: true },
	};

	Object.defineProperties(properties.default.value, properties);
	Object.defineProperties(properties.deferred.value, properties);
	Object.defineProperties(properties.immediate.value, properties);
	Object.defineProperties(properties.exclusive.value, properties);

	// Return the default version of the transaction function
	return properties.default.value;
};

// Return the database's cached transaction controller, or create a new one
const getController = (db, self) => {
	let controller = controllers.get(db);
	if (!controller) {
		const shared = {
			commit: db.prepare('COMMIT', self, false, false),
			rollback: db.prepare('ROLLBACK', self, false, false),
			savepoint: db.prepare('SAVEPOINT `\t_bs3.\t`', self, false, false),
			release: db.prepare('RELEASE `\t_bs3.\t`', self, false, false),
			rollbackTo: db.prepare('ROLLBACK TO `\t_bs3.\t`', self, false, false),
		};
		controllers.set(db, controller = {
			default: Object.assign({ begin: db.prepare('BEGIN', self, false, false) }, shared),
			deferred: Object.assign({ begin: db.prepare('BEGIN DEFERRED', self, false, false) }, shared),
			immediate: Object.assign({ begin: db.prepare('BEGIN IMMEDIATE', self, false, false) }, shared),
			exclusive: Object.assign({ begin: db.prepare('BEGIN EXCLUSIVE', self, false, false) }, shared),
		});
	}
	return controller;
};

// Return a new transaction function by wrapping the given function
const wrapTransaction = (apply, fn, db, { begin, commit, rollback, savepoint, release, rollbackTo }) => function sqliteTransaction() {
	let before, after, undo;
	if (db.inTransaction) {
		before = savepoint;
		after = release;
		undo = rollbackTo;
	} else {
		before = begin;
		after = commit;
		undo = rollback;
	}
	before.run();
	try {
		const result = apply.call(fn, this, arguments);
		if (result && typeof result.then === 'function') {
			throw new TypeError('Transaction function cannot return a promise');
		}
		after.run();
		return result;
	} catch (ex) {
		if (db.inTransaction) {
			undo.run();
			if (undo !== rollback) after.run();
		}
		throw ex;
	}
};


/***/ },

/***/ "./node_modules/better-sqlite3/lib/methods/wrappers.js"
/*!*************************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/methods/wrappers.js ***!
  \*************************************************************/
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

const { cppdb } = __webpack_require__(/*! ../util */ "./node_modules/better-sqlite3/lib/util.js");

exports.prepare = function prepare(sql) {
	return this[cppdb].prepare(sql, this, false, false);
};

exports.exec = function exec(sql) {
	this[cppdb].exec(sql);
	return this;
};

exports.close = function close() {
	this[cppdb].close();
	return this;
};

exports.loadExtension = function loadExtension(...args) {
	this[cppdb].loadExtension(...args);
	return this;
};

exports.defaultSafeIntegers = function defaultSafeIntegers(...args) {
	this[cppdb].defaultSafeIntegers(...args);
	return this;
};

exports.unsafeMode = function unsafeMode(...args) {
	this[cppdb].unsafeMode(...args);
	return this;
};

exports.getters = {
	name: {
		get: function name() { return this[cppdb].name; },
		enumerable: true,
	},
	open: {
		get: function open() { return this[cppdb].open; },
		enumerable: true,
	},
	inTransaction: {
		get: function inTransaction() { return this[cppdb].inTransaction; },
		enumerable: true,
	},
	readonly: {
		get: function readonly() { return this[cppdb].readonly; },
		enumerable: true,
	},
	memory: {
		get: function memory() { return this[cppdb].memory; },
		enumerable: true,
	},
};


/***/ },

/***/ "./node_modules/better-sqlite3/lib/sqlite-error.js"
/*!*********************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/sqlite-error.js ***!
  \*********************************************************/
(module) {

"use strict";


class SqliteError extends Error {
	constructor(message, code) {
		if (typeof code !== 'string') {
			throw new TypeError('Expected second argument to be a string');
		}

		super('' + message);
		this.code = code;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, SqliteError);
		}
	}
}

Object.defineProperty(SqliteError.prototype, 'name', {
	value: 'SqliteError',
	writable: true,
	enumerable: false,
	configurable: true,
});

module.exports = SqliteError;


/***/ },

/***/ "./node_modules/better-sqlite3/lib/util.js"
/*!*************************************************!*\
  !*** ./node_modules/better-sqlite3/lib/util.js ***!
  \*************************************************/
(__unused_webpack_module, exports) {

"use strict";


exports.getBooleanOption = (options, key) => {
	let value = false;
	if (key in options && typeof (value = options[key]) !== 'boolean') {
		throw new TypeError(`Expected the "${key}" option to be a boolean`);
	}
	return value;
};

exports.cppdb = Symbol();
exports.inspect = Symbol.for('nodejs.util.inspect.custom');


/***/ },

/***/ "./node_modules/electron-squirrel-startup/index.js"
/*!*********************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/index.js ***!
  \*********************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

var path = __webpack_require__(/*! path */ "path");
var spawn = (__webpack_require__(/*! child_process */ "child_process").spawn);
var debug = __webpack_require__(/*! debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js")('electron-squirrel-startup');
var app = (__webpack_require__(/*! electron */ "electron").app);

var run = function(args, done) {
  var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
  debug('Spawning `%s` with args `%s`', updateExe, args);
  spawn(updateExe, args, {
    detached: true
  }).on('close', done);
};

var check = function() {
  if (process.platform === 'win32') {
    var cmd = process.argv[1];
    debug('processing squirrel command `%s`', cmd);
    var target = path.basename(process.execPath);

    if (cmd === '--squirrel-install' || cmd === '--squirrel-updated') {
      run(['--createShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-uninstall') {
      run(['--removeShortcut=' + target + ''], app.quit);
      return true;
    }
    if (cmd === '--squirrel-obsolete') {
      app.quit();
      return true;
    }
  }
  return false;
};

module.exports = check();


/***/ },

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js"
/*!**********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js ***!
  \**********************************************************************************/
(module, exports, __webpack_require__) {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js");
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ },

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js"
/*!********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js ***!
  \********************************************************************************/
(module, exports, __webpack_require__) {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(/*! ms */ "./node_modules/electron-squirrel-startup/node_modules/ms/index.js");

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ },

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js"
/*!********************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/index.js ***!
  \********************************************************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(/*! ./browser.js */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/browser.js");
} else {
  module.exports = __webpack_require__(/*! ./node.js */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js");
}


/***/ },

/***/ "./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js"
/*!*******************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/debug/src/node.js ***!
  \*******************************************************************************/
(module, exports, __webpack_require__) {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(/*! tty */ "tty");
var util = __webpack_require__(/*! util */ "util");

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(/*! ./debug */ "./node_modules/electron-squirrel-startup/node_modules/debug/src/debug.js");
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(/*! fs */ "fs");
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(/*! net */ "net");
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());


/***/ },

/***/ "./node_modules/electron-squirrel-startup/node_modules/ms/index.js"
/*!*************************************************************************!*\
  !*** ./node_modules/electron-squirrel-startup/node_modules/ms/index.js ***!
  \*************************************************************************/
(module) {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ },

/***/ "./src/main.ts"
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var electron_squirrel_startup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! electron-squirrel-startup */ "./node_modules/electron-squirrel-startup/index.js");
/* harmony import */ var electron_squirrel_startup__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(electron_squirrel_startup__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var dotenv__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! dotenv */ "./node_modules/dotenv/dist/index.cjs");
/* harmony import */ var dotenv__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(dotenv__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var better_sqlite3__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! better-sqlite3 */ "./node_modules/better-sqlite3/lib/index.js");
/* harmony import */ var better_sqlite3__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(better_sqlite3__WEBPACK_IMPORTED_MODULE_4__);





let db;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if ((electron_squirrel_startup__WEBPACK_IMPORTED_MODULE_1___default())) {
    electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();
}
const initDatabase = () => {
    const dbPath = path__WEBPACK_IMPORTED_MODULE_3___default().join(electron__WEBPACK_IMPORTED_MODULE_0__.app.getPath('userData'), 'calendar.db');
    db = new (better_sqlite3__WEBPACK_IMPORTED_MODULE_4___default())(dbPath);
    db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '',
      alarm INTEGER NOT NULL DEFAULT 0,
      repeat TEXT NOT NULL DEFAULT '',
      memo TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);
};
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new electron__WEBPACK_IMPORTED_MODULE_0__.BrowserWindow({
        width: 580,
        height: 440,
        transparent: true,
        frame: false,
        resizable: true,
        hasShadow: false,
        backgroundColor: '#00000000',
        webPreferences: {
            preload: 'C:\\Users\\라희\\OneDrive\\바탕 화면\\ᏊᵕꈊᵕᏊ\\dal-calendar\\.webpack\\renderer\\main_window\\preload.cjs',
        },
    });
    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:3000/main_window/index.html');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};
// 일정 목록 불러오기
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('schedules:get-all', () => {
    return db.prepare(`
    SELECT * FROM schedules ORDER BY date, time
  `).all();
});
// 일정 추가하기
// 일정 추가하기
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('schedules:add', (_event, schedule) => {
    const result = db.prepare(`
    INSERT INTO schedules
      (title, date, time, color, alarm, repeat, memo, completed)
    VALUES
      (@title, @date, @time, @color, @alarm, @repeat, @memo, @completed)
  `).run({
        title: schedule.title,
        date: schedule.date,
        time: schedule.time ?? '',
        color: schedule.color ?? '',
        alarm: schedule.alarm ?? '없음',
        repeat: schedule.repeat ?? '반복 안 함',
        memo: schedule.memo ?? '',
        completed: schedule.completed ? 1 : 0,
    });
    return Number(result.lastInsertRowid);
});
// 일정 수정하기
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('schedules:update', (_event, schedule) => {
    db.prepare(`
    UPDATE schedules
    SET title = @title,
        date = @date,
        time = @time,
        color = @color,
        alarm = @alarm,
        repeat = @repeat,
        memo = @memo,
        completed = @completed
    WHERE id = @id
  `).run({
        ...schedule,
        time: schedule.time ?? '',
        color: schedule.color ?? '',
        alarm: schedule.alarm ?? '없음',
        repeat: schedule.repeat ?? '반복 안 함',
        memo: schedule.memo ?? '',
        completed: schedule.completed ? 1 : 0,
    });
    return true;
});
// 완료 상태 변경하기
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('schedules:toggle-completed', (_event, id, completed) => {
    db.prepare(`
      UPDATE schedules SET completed = ? WHERE id = ?
    `).run(completed ? 1 : 0, id);
    return true;
});
// API 처리
dotenv__WEBPACK_IMPORTED_MODULE_2___default().config({ path: path__WEBPACK_IMPORTED_MODULE_3___default().join(electron__WEBPACK_IMPORTED_MODULE_0__.app.getAppPath(), '.env') });
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('get-holidays', async (_event, year, month) => {
    const serviceKey = process.env.HOLIDAY_API_KEY;
    if (!serviceKey) {
        throw new Error('.env 파일에서 HOLIDAY_API_KEY를 찾을 수 없습니다.');
    }
    const response = await fetch('https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?' +
        new URLSearchParams({
            serviceKey,
            solYear: String(year),
            solMonth: String(month).padStart(2, '0'),
            _type: 'json',
            numOfRows: '100',
        }));
    if (!response.ok) {
        throw new Error(`공휴일 API 요청 실패: ${response.status}`);
    }
    const data = await response.json();
    const items = data?.response?.body?.items?.item;
    if (!items)
        return [];
    return (Array.isArray(items) ? items : [items])
        .filter((item) => item.isHoliday === 'Y')
        .map((item) => ({
        date: String(item.locdate),
        name: item.dateName,
    }));
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron__WEBPACK_IMPORTED_MODULE_0__.app.whenReady().then(() => {
    initDatabase();
    createWindow();
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    electron__WEBPACK_IMPORTED_MODULE_0__.app.on('activate', () => {
        if (electron__WEBPACK_IMPORTED_MODULE_0__.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron__WEBPACK_IMPORTED_MODULE_0__.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


/***/ },

/***/ "child_process"
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
(module) {

"use strict";
module.exports = require("child_process");

/***/ },

/***/ "electron"
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
(module) {

"use strict";
module.exports = require("electron");

/***/ },

/***/ "fs"
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
(module) {

"use strict";
module.exports = require("fs");

/***/ },

/***/ "net"
/*!**********************!*\
  !*** external "net" ***!
  \**********************/
(module) {

"use strict";
module.exports = require("net");

/***/ },

/***/ "os"
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
(module) {

"use strict";
module.exports = require("os");

/***/ },

/***/ "path"
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
(module) {

"use strict";
module.exports = require("path");

/***/ },

/***/ "tty"
/*!**********************!*\
  !*** external "tty" ***!
  \**********************/
(module) {

"use strict";
module.exports = require("tty");

/***/ },

/***/ "url"
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
(module) {

"use strict";
module.exports = require("url");

/***/ },

/***/ "util"
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
(module) {

"use strict";
module.exports = require("util");

/***/ },

/***/ "./node_modules/dotenv/dist/index.cjs"
/*!********************************************!*\
  !*** ./node_modules/dotenv/dist/index.cjs ***!
  \********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
//#!/usr/bin/env node
var j=(e,n)=>()=>{try{return n||e((n={exports:{}}).exports,n),n.exports}catch(t){throw n=0,t}};var k=j((xe,U)=>{function G(e){return typeof e=="string"?!["false","0","no","off",""].includes(e.toLowerCase()):!!e}function Y(e=process.env){let n={};for(let t of["ENCODING","PATH","QUIET","DEBUG","OVERRIDE","FAST"]){let o=e[`DOTENV_${t}`]!=null?e[`DOTENV_${t}`]:e[`DOTENV_CONFIG_${t}`];o!=null&&(n[t.toLowerCase()]=t==="ENCODING"||t==="PATH"?o:G(o))}return n}U.exports={parseBoolean:G,optionsFromEnv:Y}});var N=j((ye,x)=>{var z=__webpack_require__(/*! fs */ "fs"),I=__webpack_require__(/*! path */ "path"),Z=__webpack_require__(/*! os */ "os"),{URL:ee,fileURLToPath:te}=__webpack_require__(/*! url */ "url"),{parseBoolean:$,optionsFromEnv:B}=k(),re=/(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg,b=new Uint8Array(256);for(let e=48;e<=57;e++)b[e]=1;for(let e=65;e<=90;e++)b[e]=1;for(let e=97;e<=122;e++)b[e]=1;b[45]=1;b[46]=1;b[95]=1;function ne(e){let n={},t=e.toString();t=t.replace(/\r\n?/mg,`
`);let o;for(;(o=re.exec(t))!=null;){let r=o[1],s=o[2]||"";s=s.trim();let i=s[0];s=s.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"),i==='"'&&(s=s.replace(/\\n/g,`
`),s=s.replace(/\\r/g,"\r")),n[r]=s}return n}function w(e){return e<=32?e===32||e>=9&&e<=13:e>=160&&(e===160||e===5760||e>=8192&&e<=8202||e===8232||e===8233||e===8239||e===8287||e===12288||e===65279)}function q(e){return e===10||e===8232||e===8233}function oe(e){let n={},t=typeof e=="string"?e:e.toString();t.indexOf("\r")!==-1&&(t=t.replace(/\r\n?/g,`
`));let o=t.length,r=0;for(;r<o;){let s=t.charCodeAt(r);for(;r<o&&w(s);)r++,s=t.charCodeAt(r);if(r>=o)break;if(s===35){for(;r<o&&!q(t.charCodeAt(r));)r++;continue}let i=-1;if(s===101&&r+6<o&&t.charCodeAt(r+1)===120&&t.charCodeAt(r+2)===112&&t.charCodeAt(r+3)===111&&t.charCodeAt(r+4)===114&&t.charCodeAt(r+5)===116){let v=t.charCodeAt(r+6);if(w(v)){let u=r+7;for(;u<o&&w(t.charCodeAt(u));)u++;b[t.charCodeAt(u)]&&(i=r+6,r=u)}else s=t.charCodeAt(r)}let l=r,d=0;for(;r<o&&(d=t.charCodeAt(r),b[d]);)r++;if(r===l){for(;r<o&&!q(t.charCodeAt(r));)r++;continue}let h=t.slice(l,r),f=r;if(r>=o&&(d=0),w(d))do r++,d=r<o?t.charCodeAt(r):0;while(w(d));if(d===61)r++;else if(d===58&&r===f&&r+1<o&&w(t.charCodeAt(r+1)))r+=2;else{for(r=i===-1?f:i;r<o&&!q(t.charCodeAt(r));)r++;continue}let c=r,a=r;for(;a<o&&w(t.charCodeAt(a));)a++;let g=t.charCodeAt(a),p,y=!1;if(g===39||g===34||g===96){let v=t[a],u=t.indexOf(v,a+1),m=-1,C=-1;for(;u!==-1;){let O=t.charCodeAt(u-1)===92,E=u+1;for(;E<o&&!q(t.charCodeAt(E))&&w(t.charCodeAt(E));)E++;if((E===o||q(t.charCodeAt(E))||t.charCodeAt(E)===35)&&(m=u,C=E),!O)break;u=t.indexOf(v,u+1)}if(m!==-1){if(p=t.slice(a+1,m),r=C,t.charCodeAt(r)===35)for(;r<o&&!q(t.charCodeAt(r));)r++;y=!0}}if(!y){let v=t.indexOf(`
`,c);v===-1&&(v=o);let u;if(o<4096)u=t.indexOf("#",c),(u===-1||u>v)&&(u=v);else for(u=c;u<v&&t.charCodeAt(u)!==35;)u++;let m=c,C=u;for(;m<C&&w(t.charCodeAt(m));)m++;for(;C>m&&w(t.charCodeAt(C-1));)C--;let O=t.charCodeAt(m);if(p=t.slice(m,C),p.includes("\u2028")||p.includes("\u2029")?p=p.replace(/^(['"`])([\s\S]*)\1$/mg,"$2"):C-m>=2&&(O===39||O===34||O===96)&&t.charCodeAt(C-1)===O&&(p=t.slice(m+1,C-1)),r=u,u<v)for(;r<o&&!q(t.charCodeAt(r));)r++}g===34&&(y||a<r)&&p.indexOf("\\")!==-1&&(p=p.replace(/\\n/g,`
`).replace(/\\r/g,"\r")),n[h]=p}return n}function se(e,n){return n&&$(n.fast)?oe(e):ne(e)}function T(e){console.log(`\u2506 ${e}`)}function ie(e){console.error(`\u25C7 ${e}`)}function V(e){return e[0]==="~"?I.join(Z.homedir(),e.slice(1)):e}function ce(e={}){let n={...e};for(let t of Object.keys(n))n[t]===void 0&&delete n[t];return{...B(),...n}}function ae(e){e=ce(e);let n=I.resolve(process.cwd(),".env"),t="utf8",o=process.env;e&&e.processEnv!=null&&(o=e.processEnv);let r=$(e&&e.debug);e&&e.encoding?t=e.encoding:r&&T("no encoding is specified (UTF-8 is used by default)");let s=[n];if(e&&e.path)if(!Array.isArray(e.path))s=[V(e.path)];else{s=[];for(let c of e.path)s.push(V(c))}let i,l={},d={fast:e.fast};for(let c of s)try{let a=A.parse(z.readFileSync(c,{encoding:t}),d);A.populate(l,a,e)}catch(a){r&&T(`failed to load ${c} ${a.message}`),i=a}let h=A.populate(o,l,e),f=$(Object.prototype.hasOwnProperty.call(e,"quiet")?e.quiet:B(o).quiet);if(r||!f){let c=Object.keys(h).length,a=[];for(let g of s)try{let p=I.relative(process.cwd(),g instanceof ee?te(g):g);a.push(p)}catch(p){r&&T(`failed to load ${g} ${p.message}`),i=p}ie(`injected env (${c}) from ${a.join(",")}`)}return i?{parsed:l,error:i}:{parsed:l}}function le(e){return A.configDotenv(e)}function fe(e,n,t={}){let o=$(t&&t.debug),r=$(t&&t.override),s={};if(e===null||typeof e!="object"||n===null||typeof n!="object"){let i=new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");throw i.code="OBJECT_REQUIRED",i}for(let i of Object.keys(n))Object.prototype.hasOwnProperty.call(e,i)?(r===!0&&(e[i]=n[i],s[i]=n[i]),o&&T(r===!0?`"${i}" is already defined and WAS overwritten`:`"${i}" is already defined and was NOT overwritten`)):(e[i]=n[i],s[i]=n[i]);return s}var A={configDotenv:ae,config:le,parse:se,populate:fe};x.exports.configDotenv=A.configDotenv;x.exports.config=A.config;x.exports.parse=A.parse;x.exports.populate=A.populate;x.exports=A});var M=j((Te,W)=>{var _=__webpack_require__(/*! child_process */ "child_process"),ue=__webpack_require__(/*! fs */ "fs"),L=__webpack_require__(/*! path */ "path");function de(e){let n=['"'],t=0;for(let o of e){if(o==="\\"){t++;continue}o==='"'?n.push("\\".repeat(t*2+1),'"'):n.push("\\".repeat(t),o),t=0}return n.push("\\".repeat(t*2),'"'),n.join("")}function H(e,n=1){for(let t=0;t<n;t++){let o=[];for(let r of e){let s=r.charCodeAt(0),i=s>=48&&s<=57||s>=65&&s<=90||s>=97&&s<=122,l="\\/:._-".includes(r);!i&&!l&&s<128&&o.push("^"),o.push(r)}e=o.join("")}return e}function P(e,n){let t=Object.keys(e).reverse().find(o=>o.toUpperCase()===n);return t===void 0?void 0:e[t]}function pe(e,n,t){let o=(P(n,"PATHEXT")||".COM;.EXE;.BAT;.CMD").split(";").filter(Boolean),s=o.some(l=>e.toLowerCase().endsWith(l.toLowerCase()))?["",...o]:[...o,""],i=/[\\/]/.test(e)?[t]:[t,...(P(n,"PATH")||"").split(";")];for(let l of i)for(let d of s){let h=L.resolve(t,l.replace(/^"|"$/g,""),e+d);try{if(ue.statSync(h).isFile())return h}catch{}}}function he(e,n,t){if(process.platform!=="win32")return _.spawn(e,n,t);let o=t.env||process.env,r=pe(e,o,t.cwd||process.cwd());if(r&&/\.(?:exe|com)$/i.test(r))return _.spawn(r,n,t);let s=/\.(?:bat|cmd)$/i.test(r||e),i=[H(L.normalize(r||e))];for(let d of n)i.push(H(de(d),s?2:1));let l=i.join(" ");return _.spawn(P(o,"COMSPEC")||"cmd.exe",["/d","/v:off","/s","/c",`"${l}"`],{...t,windowsVerbatimArguments:!0})}W.exports=he});var X=j(($e,F)=>{var ge=__webpack_require__(/*! fs */ "fs"),me=__webpack_require__(/*! os */ "os"),Q=__webpack_require__(/*! path */ "path"),ve=__webpack_require__(/*! child_process */ "child_process"),Ce=M(),R=N(),{optionsFromEnv:J}=k();function D(){console.log(["Usage: dotenv run [--help] [-q|--quiet] [--debug] [--override] [--fast] [-f|--file <paths>] [--] <command> [args...]","","Run a command with environment variables from a .env file.","Place dotenv options before the command; all following arguments go to the command.","","Options:","  -f, --file <paths>  .env paths, comma-separated or repeated (default: .env)","  -q, --quiet suppress the injected env message","  --debug     enable debug logging","  --override  override existing environment variables","  --fast      use the faster character-scanner parser","","Environment variables (DOTENV_CONFIG_* names remain as fallbacks):","  DOTENV_PATH, DOTENV_ENCODING, DOTENV_QUIET,","  DOTENV_DEBUG, DOTENV_OVERRIDE,","  DOTENV_FAST"].join(`
`))}function we(e){let n=[],t=!1,o,r,s,i,l=-1;for(let h=0;h<e.length;h++){let f=e[h];if(f==="--"){l=h+1;break}if(f==="--help"||f==="-h")return{help:!0};if(f==="--quiet"||f==="-q"){o=!0;continue}if(f==="--debug"){r=!0;continue}if(f==="--override"){s=!0;continue}if(f==="--fast"){i=!0;continue}if(f==="-f"||f==="--file"||f.startsWith("-f=")||f.startsWith("--file=")){let c=f.indexOf("="),a=c===-1?f:f.slice(0,c),g=c===-1?e[++h]:f.slice(c+1);if(!g||g==="--")return{error:`${a} requires a path`};let p=g.split(",").map(y=>y.trim()).filter(Boolean);if(p.length===0)return{error:`${a} requires a path`};n.push(...p),t=!0;continue}if(f.startsWith("-"))return{error:`unknown option: ${f}`};l=h;break}let d=l===-1?[]:e.slice(l);return{paths:n,pathSet:t,quiet:o,debug:r,override:s,fast:i,command:d}}function Ae(e){return e[0]==="~"?Q.join(me.homedir(),e.slice(1)):e}function Ee(e){let n=J(),t={encoding:n.encoding||"utf8",quiet:n.quiet,debug:n.debug===!0,override:n.override===!0,fast:n.fast===!0,paths:[".env"],defaultPath:!0};return n.path!=null&&(t.paths=[n.path],t.defaultPath=!1),e.pathSet&&(t.paths=e.paths,t.defaultPath=!1),e.quiet!=null&&(t.quiet=e.quiet),e.debug!=null&&(t.debug=e.debug),e.override!=null&&(t.override=e.override),e.fast!=null&&(t.fast=e.fast),t}function be(e){let n={},t=[],o={override:e.override,debug:e.debug};for(let s of e.paths){let i=Q.resolve(process.cwd(),Ae(s));try{let l=R.parse(ge.readFileSync(i,{encoding:e.encoding}),{fast:e.fast});R.populate(n,l,o),t.push(s)}catch(l){if(e.debug&&console.log(`\u2506 failed to load ${s} ${l.message}`),!(e.defaultPath&&l.code==="ENOENT"))throw l}}return{injected:R.populate(process.env,n,o),loadedPaths:t}}function K(e){let n=e[0];if(n==="--help"||n==="-h"){D();return}if(n!=="run"){D(),process.exitCode=1;return}let t=we(e.slice(1));if(t.help){D();return}if(t.error){console.error(`dotenv: ${t.error}`),D(),process.exitCode=1;return}if(t.command.length===0){D(),process.exitCode=1;return}let o=Ee(t);try{let c=be(o);if(!(o.quiet==null?J().quiet:o.quiet)){let g=`\u25C7 injected env (${Object.keys(c.injected).length})`;c.loadedPaths.length>0&&(g+=` from ${c.loadedPaths.join(", ")}`),console.error(g)}}catch(c){console.error(`dotenv: ${c.message}`),process.exitCode=1;return}let r=!!process.stdin.isTTY,s=process.platform!=="win32"&&!r,i=Ce(t.command[0],t.command.slice(1),{stdio:"inherit",detached:s}),l=new Map,d=0;function h(c){if(!(!i.pid||i.exitCode!==null||i.signalCode!==null)){if(process.platform==="win32"){ve.spawnSync("taskkill",["/pid",String(i.pid),"/T","/F"],{stdio:"ignore"});return}try{process.kill(s?-i.pid:i.pid,c)}catch(a){if(a.code!=="ESRCH")throw a}}}function f(){for(let[c,a]of l)process.removeListener(c,a)}for(let c of["SIGINT","SIGTERM","SIGHUP","SIGQUIT"]){let a=()=>{if(c==="SIGINT"){if(d++,r&&process.platform!=="win32"&&d===1)return;if(d>1){h(d===2?"SIGTERM":"SIGKILL");return}}h(c)};l.set(c,a),process.on(c,a)}i.on("error",function(c){f(),console.error(`dotenv: ${c.message}`),process.exitCode=1}),i.on("exit",function(c,a){f(),typeof c=="number"?process.exit(c):(setInterval(()=>{},1e3),process.kill(process.pid,a))})}F.exports=K;__webpack_require__.c[__webpack_require__.s]===F&&K(process.argv.slice(2))});var S=N(),qe=X();module.exports=S;module.exports.config=S.config;module.exports.configDotenv=S.configDotenv;module.exports.parse=S.parse;module.exports.populate=S.populate;__webpack_require__.c[__webpack_require__.s]===module&&qe(process.argv.slice(2));


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		const getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	__webpack_require__.nmd = (module) => {
/******/ 		module.paths = [];
/******/ 		if (!module.children) module.children = [];
/******/ 		return module;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	let __webpack_exports__ = __webpack_require__(__webpack_require__.s = "./src/main.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.cjs.map