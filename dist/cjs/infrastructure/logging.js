"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printSecrets = exports.printVariables = exports.printDomain = exports.printObject = exports.header = void 0;
var node_util_1 = require("node:util");
function header(text) {
    var separator = "*********************************************************************";
    console.log(separator);
    console.log(text);
    console.log(separator);
}
exports.header = header;
function printObject(text, object) {
    header(text);
    console.log((0, node_util_1.inspect)(object, { depth: null }));
}
exports.printObject = printObject;
function printDomain(object) {
    printObject("Domain Configuration", object);
}
exports.printDomain = printDomain;
function printVariables(config) {
    header('Environment Variables');
    for (var _i = 0, _a = Object.entries(config); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (typeof value === 'function') {
        }
        else if (Array.isArray(value)) {
            console.log("    ".concat(key, ":"));
            for (var _c = 0, _d = Object.entries(value); _c < _d.length; _c++) {
                var _e = _d[_c], _ = _e[0], arrayValue = _e[1];
                console.log("        ".concat(arrayValue));
            }
        }
        else {
            console.log("    ".concat(key, ": ").concat(value));
        }
    }
}
exports.printVariables = printVariables;
function printSecrets(config) {
    header('Environment Secrets');
    for (var _i = 0, _a = Object.entries(config); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (typeof value === 'function') {
        }
        else {
            console.log("    ".concat(key, ": length ").concat(value.length));
        }
    }
}
exports.printSecrets = printSecrets;
//# sourceMappingURL=logging.js.map