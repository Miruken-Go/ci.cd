import { inspect } from 'node:util';
export function header(text) {
    var separator = "*********************************************************************";
    console.log(separator);
    console.log(text);
    console.log(separator);
}
export function printObject(text, object) {
    header(text);
    console.log(inspect(object, { depth: null }));
}
export function printDomain(object) {
    printObject("Domain Configuration", object);
}
export function printVariables(config) {
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
export function printSecrets(config) {
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
//# sourceMappingURL=logging.js.map