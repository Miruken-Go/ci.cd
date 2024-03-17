"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvVariables = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
class EnvVariables {
    constructor() {
        this.variables = {};
    }
    optional(names) {
        for (const name of names) {
            if (this.variables[name])
                return this;
            const variable = process.env[name];
            if (variable) {
                this.variables[name] = variable.trim();
            }
        }
        return this;
    }
    required(names) {
        for (const name of names) {
            if (this.variables[name])
                return this;
            const variable = process.env[name];
            if (!variable) {
                throw `Environment variable required: ${name}`;
            }
            this.variables[name] = variable.trim();
        }
        return this;
    }
    requireFromEnvFile(directory, names) {
        const env = process.env['env'];
        if (!env) {
            throw 'Environment variable required: env';
        }
        const filePath = node_path_1.default.join(directory, `${env}on`);
        if (!node_fs_1.default.existsSync(filePath)) {
            throw new Error(`Config file does not exist: ${filePath}`);
        }
        const envSpecific = JSON.parse(node_fs_1.default.readFileSync(filePath, { encoding: 'utf8' }));
        for (const name of names) {
            const variable = envSpecific[name];
            if (!variable) {
                throw `Variable required from ${filePath}: ${name}`;
            }
            this.variables[name] = variable.trim();
        }
        return this;
    }
}
exports.EnvVariables = EnvVariables;
//# sourceMappingURL=envVariables.js.map