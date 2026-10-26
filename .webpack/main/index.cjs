/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

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

/***/ "better-sqlite3"
/*!*********************************!*\
  !*** external "better-sqlite3" ***!
  \*********************************/
(module) {

"use strict";
module.exports = require("better-sqlite3");

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

/***/ "util"
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
(module) {

"use strict";
module.exports = require("util");

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
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
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
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
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
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var electron_squirrel_startup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! electron-squirrel-startup */ "./node_modules/electron-squirrel-startup/index.js");
/* harmony import */ var electron_squirrel_startup__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(electron_squirrel_startup__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var better_sqlite3__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! better-sqlite3 */ "better-sqlite3");
/* harmony import */ var better_sqlite3__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(better_sqlite3__WEBPACK_IMPORTED_MODULE_4__);





let db;
let mainWindow = null;
let isWindowLocked = false;
let isEditingSchedule = false;
// 이미 울린 알람을 중복해서 표시하지 않기 위한 목록
const firedAlarms = new Set();
// 날짜를 YYYY-MM-DD 형식으로 변환
const getDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
// 알람 확인
const checkAlarms = () => {
    if (!electron__WEBPACK_IMPORTED_MODULE_0__.Notification.isSupported())
        return;
    const now = new Date();
    const schedules = db.prepare(`
    SELECT * FROM schedules
    WHERE completed = 0
      AND alarm != '없음'
      AND alarm != ''
  `).all();
    // 각 알람 설정에 따른 시간 차이
    const offsets = {
        '마감 시간에 알림': 0,
        '10분 전': 10 * 60 * 1000,
        '1시간 전': 60 * 60 * 1000,
        '하루 전': 24 * 60 * 60 * 1000,
    };
    for (const schedule of schedules) {
        if (!schedule.time)
            continue;
        const offset = offsets[schedule.alarm];
        if (offset === undefined)
            continue;
        // 알람 시각으로부터 일정 실행 날짜를 계산
        const occurrenceDate = new Date(now.getTime() + offset);
        const [hour, minute] = schedule.time
            .split(':')
            .map(Number);
        if (!Number.isInteger(hour) ||
            !Number.isInteger(minute) ||
            hour < 0 ||
            hour > 23 ||
            minute < 0 ||
            minute > 59) {
            continue;
        }
        // 일정 실행 시각
        const target = new Date(occurrenceDate);
        target.setHours(hour, minute, 0, 0);
        // 실제 알람이 울려야 하는 시각
        const alarmTime = target.getTime() - offset;
        const difference = now.getTime() - alarmTime;
        // 15초 간격 확인을 고려한 허용 범위
        if (difference < 0 || difference > 20_000) {
            continue;
        }
        // 동일한 일정의 알람이 중복 표시되지 않도록 확인
        const alarmKey = `${schedule.id}:${getDateKey(target)}:${schedule.alarm}`;
        if (firedAlarms.has(alarmKey))
            continue;
        firedAlarms.add(alarmKey);
        const notification = new electron__WEBPACK_IMPORTED_MODULE_0__.Notification({
            title: '📅 일정 알림 📅',
            body: `${schedule.title}`,
        });
        notification.on('click', () => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.show();
                mainWindow.focus();
            }
        });
        notification.show();
    }
};
// 설치 및 제거 처리
if ((electron_squirrel_startup__WEBPACK_IMPORTED_MODULE_2___default())) {
    electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();
}
// 데이터베이스 초기화
const initDatabase = () => {
    const dbPath = path__WEBPACK_IMPORTED_MODULE_3___default().join(electron__WEBPACK_IMPORTED_MODULE_0__.app.getPath('userData'), 'calendar.db');
    db = new (better_sqlite3__WEBPACK_IMPORTED_MODULE_4___default())(dbPath);
    db.pragma('foreign_keys = ON');
    // 일정 테이블 생성
    db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '',
      alarm INTEGER NOT NULL DEFAULT 0,
      memo TEXT NOT NULL DEFAULT '',
      completed INTEGER NOT NULL DEFAULT 0
    )
  `);
    // 기존 데이터베이스에 endDate 열이 없으면 추가
    const columns = db.prepare(`PRAGMA table_info(schedules)`).all();
    if (!columns.some((column) => column.name === 'endDate')) {
        db.exec(`
      ALTER TABLE schedules
      ADD COLUMN endDate TEXT NOT NULL DEFAULT ''
    `);
    }
    db.exec(`
  CREATE TABLE IF NOT EXISTS schedule_occurrences (
    schedule_id INTEGER NOT NULL,
    occurrence_date TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (schedule_id, occurrence_date),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id)
      ON DELETE CASCADE
  )
`);
};
// 창 위치 저장 파일
const boundsPath = path__WEBPACK_IMPORTED_MODULE_3___default().join(electron__WEBPACK_IMPORTED_MODULE_0__.app.getPath('userData'), 'window-bounds.json');
// 창 고정 상태 저장 파일
const lockPath = path__WEBPACK_IMPORTED_MODULE_3___default().join(electron__WEBPACK_IMPORTED_MODULE_0__.app.getPath('userData'), 'window-lock.json');
// 저장된 창 고정 상태 불러오기
const getSavedLockState = () => {
    try {
        if (!fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(lockPath)) {
            return false;
        }
        const saved = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(lockPath, 'utf-8'));
        return saved.locked === true;
    }
    catch {
        return false;
    }
};
// 창 고정 상태 저장하기
const saveLockState = (locked) => {
    try {
        fs__WEBPACK_IMPORTED_MODULE_1__.writeFileSync(lockPath, JSON.stringify({ locked }, null, 2), 'utf-8');
    }
    catch (error) {
        console.error('창 고정 상태 저장 실패:', error);
    }
};
// 저장된 창 위치 불러오기
const getSavedBounds = () => {
    try {
        if (!fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(boundsPath)) {
            return { width: 580, height: 440 };
        }
        const saved = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(boundsPath, 'utf-8'));
        if (!Number.isFinite(saved.x) ||
            !Number.isFinite(saved.y) ||
            !Number.isFinite(saved.width) ||
            !Number.isFinite(saved.height)) {
            return { width: 580, height: 440 };
        }
        // 저장된 위치가 현재 모니터에 보이는지 확인
        const displays = electron__WEBPACK_IMPORTED_MODULE_0__.screen.getAllDisplays();
        const isVisible = displays.some((display) => {
            const area = display.workArea;
            return (saved.x < area.x + area.width &&
                saved.x + saved.width > area.x &&
                saved.y < area.y + area.height &&
                saved.y + saved.height > area.y);
        });
        if (!isVisible) {
            return { width: saved.width, height: saved.height };
        }
        return saved;
    }
    catch {
        return { width: 580, height: 440 };
    }
};
// 현재 창 위치 저장
const saveWindowBounds = () => {
    if (!mainWindow || mainWindow.isDestroyed())
        return;
    if (mainWindow.isMinimized() || mainWindow.isMaximized())
        return;
    try {
        const bounds = mainWindow.getBounds();
        fs__WEBPACK_IMPORTED_MODULE_1__.writeFileSync(boundsPath, JSON.stringify(bounds, null, 2), 'utf-8');
    }
    catch (error) {
        console.error('창 위치 저장 실패:', error);
    }
};
// 창 생성
const createWindow = () => {
    const savedBounds = getSavedBounds();
    isWindowLocked = getSavedLockState();
    mainWindow = new electron__WEBPACK_IMPORTED_MODULE_0__.BrowserWindow({
        ...savedBounds,
        transparent: true,
        frame: false,
        resizable: true,
        hasShadow: false,
        backgroundColor: '#00000000',
        alwaysOnTop: false,
        skipTaskbar: true,
        webPreferences: {
            preload: 'C:\\dal-calendar\\.webpack\\renderer\\main_window\\preload.cjs',
        },
    });
    mainWindow.loadURL('http://localhost:3000/main_window/index.html');
    // 창 위치 저장 이벤트
    mainWindow.on('move', () => {
        saveWindowBounds();
    });
    //창 크기 변경 감지
    mainWindow.on('resize', () => {
        saveWindowBounds();
    });
    //창 닫기 감지
    mainWindow.on('close', () => {
        saveWindowBounds();
    });
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('app:quit', () => {
    electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();
});
// 창 이동 잠금 상태 변경
// 창 이동 잠금 상태 변경
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('window:set-locked', (_event, locked) => {
    isWindowLocked = Boolean(locked);
    // 고정 상태 저장
    saveLockState(isWindowLocked);
    if (mainWindow && !mainWindow.isDestroyed()) {
        const canFocus = !isWindowLocked || isEditingSchedule;
        // 고정 상태에서는 일반 클릭으로 창이 활성화되지 않도록 설정
        mainWindow.setFocusable(canFocus);
        // 고정할 때 현재 창이 활성화되어 있다면 포커스 해제
        if (isWindowLocked && !isEditingSchedule) {
            mainWindow.blur();
        }
    }
    return isWindowLocked;
});
// 일정 편집 상태 변경
// 일정 편집 상태 변경
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('window:set-editing', (_event, editing) => {
    if (!mainWindow || mainWindow.isDestroyed()) {
        return false;
    }
    isEditingSchedule = Boolean(editing);
    // 고정 해제 상태이거나 일정 편집 중일 때만 포커스 허용
    const canFocus = !isWindowLocked || isEditingSchedule;
    mainWindow.setFocusable(canFocus);
    if (isEditingSchedule) {
        mainWindow.show();
        mainWindow.setSkipTaskbar(true);
        // 포커스 설정이 반영된 후 창 활성화
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.focus();
            }
        }, 50);
    }
    return true;
});
// 창 이동 잠금 상태 조회
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('window:get-locked', () => {
    return isWindowLocked;
});
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
      (title, date, endDate, time, color, alarm, memo, completed)
    VALUES
      (@title, @date, @endDate, @time, @color, @alarm, @memo, @completed)
  `).run({
        title: schedule.title,
        date: schedule.date,
        endDate: schedule.endDate || schedule.date,
        time: schedule.time ?? '',
        color: schedule.color ?? '',
        alarm: schedule.alarm ?? '없음',
        memo: schedule.memo ?? '',
        completed: schedule.completed ? 1 : 0,
    });
    return Number(result.lastInsertRowid);
});
// 일정 수정하기
// 일정 수정하기
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('schedules:update', (_event, schedule) => {
    db.prepare(`
    UPDATE schedules
    SET title = @title,
        date = @date,
        endDate = @endDate,
        time = @time,
        color = @color,
        alarm = @alarm,
        memo = @memo,
        completed = @completed
    WHERE id = @id
  `).run({
        ...schedule,
        endDate: schedule.endDate || schedule.date,
        time: schedule.time ?? '',
        color: schedule.color ?? '',
        alarm: schedule.alarm ?? '없음',
        memo: schedule.memo ?? '',
        completed: schedule.completed ? 1 : 0,
    });
    return true;
});
// 일정 삭제하기
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('schedules:delete', (_event, id) => {
    db.prepare(`
    DELETE FROM schedules WHERE id = ?
  `).run(id);
    return true;
});
// 일정 완료 상태 변경하기
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('schedules:toggle-completed', (_event, id, completed) => {
    db.prepare(`
      UPDATE schedules SET completed = ? WHERE id = ?
    `).run(completed ? 1 : 0, id);
    return true;
});
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('schedules:get-occurrence-completions', () => {
    return db.prepare(`
    SELECT schedule_id, occurrence_date, completed
    FROM schedule_occurrences
  `).all();
});
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('schedules:toggle-occurrence-completed', (_event, id, date, completed) => {
    db.prepare(`
      INSERT INTO schedule_occurrences
        (schedule_id, occurrence_date, completed)
      VALUES (?, ?, ?)
      ON CONFLICT(schedule_id, occurrence_date)
      DO UPDATE SET completed = excluded.completed
    `).run(id, date, completed ? 1 : 0);
    return true;
});
/** 공휴일 API 키 저장 파일 */
const holidayKeyPath = path__WEBPACK_IMPORTED_MODULE_3___default().join(electron__WEBPACK_IMPORTED_MODULE_0__.app.getPath('userData'), 'holiday-api-key.json');
/** 저장된 API 키 읽기 */
const readHolidayApiKey = () => {
    try {
        if (!fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(holidayKeyPath)) {
            return '';
        }
        const saved = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(holidayKeyPath, 'utf-8'));
        return typeof saved.apiKey === 'string'
            ? saved.apiKey.trim()
            : '';
    }
    catch (error) {
        console.error('공휴일 API 키 읽기 실패:', error);
        return '';
    }
};
/** API 키 저장 */
const saveHolidayApiKey = (apiKey) => {
    const key = apiKey.trim();
    if (!key) {
        throw new Error('API 키를 입력해 주세요.');
    }
    fs__WEBPACK_IMPORTED_MODULE_1__.writeFileSync(holidayKeyPath, JSON.stringify({ apiKey: key }, null, 2), 'utf-8');
    return true;
};
/** API 키가 이미 저장되어 있는지 확인 */
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('holiday-key:exists', () => {
    return readHolidayApiKey().length > 0;
});
/** API 키 저장 요청 */
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('holiday-key:save', (_event, apiKey) => {
    return saveHolidayApiKey(apiKey);
});
/** 공휴일 API */
electron__WEBPACK_IMPORTED_MODULE_0__.ipcMain.handle('get-holidays', async (_event, year, month) => {
    const serviceKey = readHolidayApiKey();
    if (!serviceKey) {
        throw new Error('공휴일 API 키를 먼저 설정해 주세요.');
    }
    const params = new URLSearchParams({
        serviceKey,
        solYear: String(year),
        solMonth: String(month).padStart(2, '0'),
        _type: 'json',
        numOfRows: '100',
    });
    const response = await fetch('https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?' +
        params.toString());
    if (!response.ok) {
        throw new Error(`공휴일 API 요청 실패: ${response.status}`);
    }
    const data = await response.json();
    if (data?.response?.header?.resultCode !== '00') {
        throw new Error(data?.response?.header?.resultMsg ??
            '공휴일 API에서 오류가 발생했습니다.');
    }
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
// 앱 초기화 완료 후 실행
electron__WEBPACK_IMPORTED_MODULE_0__.app.whenReady().then(() => {
    initDatabase();
    // 설치된 프로그램만 윈도우 로그인 시 자동 실행
    if (electron__WEBPACK_IMPORTED_MODULE_0__.app.isPackaged && process.platform === 'win32') {
        electron__WEBPACK_IMPORTED_MODULE_0__.app.setLoginItemSettings({
            openAtLogin: true,
            path: process.execPath,
        });
    }
    createWindow();
    // 앱 실행 직후 알람 확인
    checkAlarms();
    // 이후 15초마다 알람 확인
    setInterval(checkAlarms, 15_000);
    electron__WEBPACK_IMPORTED_MODULE_0__.app.on('activate', () => {
        if (electron__WEBPACK_IMPORTED_MODULE_0__.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
// 모든 창이 닫혔을 때 처리
electron__WEBPACK_IMPORTED_MODULE_0__.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();
    }
});

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.cjs.map