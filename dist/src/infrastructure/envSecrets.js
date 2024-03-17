"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvSecrets = void 0;
class EnvSecrets {
    constructor() {
        this.secrets = {};
    }
    require(names) {
        for (const name of names) {
            if (this.secrets[name])
                return this;
            const secret = process.env[name];
            if (!secret) {
                throw `Environment secret required: ${name}`;
            }
            this.secrets[name] = secret.trim();
        }
        return this;
    }
}
exports.EnvSecrets = EnvSecrets;
//# sourceMappingURL=envSecrets.js.map