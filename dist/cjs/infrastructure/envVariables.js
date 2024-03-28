"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvVariables = void 0;
var fs = require("node:fs");
var path = require("node:path");
var EnvVariables = (function () {
    function EnvVariables() {
        this.variables = {};
    }
    EnvVariables.prototype.optional = function (names) {
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var name_1 = names_1[_i];
            if (this.variables[name_1])
                return this;
            var variable = process.env[name_1];
            if (variable) {
                this.variables[name_1] = variable.trim();
            }
        }
        return this;
    };
    EnvVariables.prototype.required = function (names) {
        for (var _i = 0, names_2 = names; _i < names_2.length; _i++) {
            var name_2 = names_2[_i];
            if (this.variables[name_2])
                return this;
            var variable = process.env[name_2];
            if (!variable) {
                throw "Environment variable required: ".concat(name_2);
            }
            this.variables[name_2] = variable.trim();
        }
        return this;
    };
    EnvVariables.prototype.requireFromEnvFile = function (directory, names) {
        var env = process.env['env'];
        if (!env) {
            throw 'Environment variable required: env';
        }
        var filePath = path.join(directory, "".concat(env, "on"));
        if (!fs.existsSync(filePath)) {
            throw new Error("Config file does not exist: ".concat(filePath));
        }
        var envSpecific = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }));
        for (var _i = 0, names_3 = names; _i < names_3.length; _i++) {
            var name_3 = names_3[_i];
            var variable = envSpecific[name_3];
            if (!variable) {
                throw "Variable required from ".concat(filePath, ": ").concat(name_3);
            }
            this.variables[name_3] = variable.trim();
        }
        return this;
    };
    return EnvVariables;
}());
exports.EnvVariables = EnvVariables;
//# sourceMappingURL=envVariables.js.map