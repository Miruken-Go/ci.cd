var EnvSecrets = (function () {
    function EnvSecrets() {
        this.secrets = {};
    }
    EnvSecrets.prototype.require = function (names) {
        for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
            var name_1 = names_1[_i];
            if (this.secrets[name_1])
                return this;
            var secret = process.env[name_1];
            if (!secret) {
                throw "Environment secret required: ".concat(name_1);
            }
            this.secrets[name_1] = secret.trim();
        }
        return this;
    };
    return EnvSecrets;
}());
export { EnvSecrets };
//# sourceMappingURL=envSecrets.js.map