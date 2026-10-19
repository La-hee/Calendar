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


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if ((electron_squirrel_startup__WEBPACK_IMPORTED_MODULE_1___default())) {
    electron__WEBPACK_IMPORTED_MODULE_0__.app.quit();
}
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
//API 처리


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