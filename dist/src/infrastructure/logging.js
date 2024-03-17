"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printEnvironmentSecrets = exports.printEnvironmentVariables = exports.printDomain = exports.printObject = exports.header = void 0;
const node_util_1 = require("node:util");
function header(text) {
    const separator = "*********************************************************************";
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
function printEnvironmentVariables(config) {
    header('Environment Variables');
    for (const [key, value] of Object.entries(config)) {
        if (typeof value === 'function') {
            //ignore
        }
        else if (Array.isArray(value)) {
            console.log(`    ${key}:`);
            for (const [_, arrayValue] of Object.entries(value)) {
                console.log(`        ${arrayValue}`);
            }
        }
        else {
            console.log(`    ${key}: ${value}`);
        }
    }
}
exports.printEnvironmentVariables = printEnvironmentVariables;
function printEnvironmentSecrets(config) {
    header('Environment Secrets');
    for (const [key, value] of Object.entries(config)) {
        if (typeof value === 'function') {
            //ignore
        }
        else {
            console.log(`    ${key}: length ${value.length}`);
        }
    }
}
exports.printEnvironmentSecrets = printEnvironmentSecrets;
//# sourceMappingURL=logging.js.map