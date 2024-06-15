"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AZ = void 0;
var bash = require("./bash");
var logging_1 = require("./logging");
var AZ = (function () {
    function AZ(options) {
        this.loggedInToAZ = false;
        this.loggedInToACR = false;
        this.options = options;
    }
    AZ.prototype.login = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.loggedInToAZ)
                            return [2];
                        (0, logging_1.header)('Logging into az');
                        return [4, bash.execute("az login --service-principal --username ".concat(this.options.deploymentPipelineClientId, " --password ").concat(this.options.deploymentPipelineClientSecret, " --tenant ").concat(this.options.tenantId))];
                    case 1:
                        _a.sent();
                        this.loggedInToAZ = true;
                        return [2];
                }
            });
        });
    };
    AZ.prototype.loginToACR = function (containerRepositoryName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.loggedInToACR)
                            return [2];
                        (0, logging_1.header)('Logging into ACR');
                        return [4, this.login()];
                    case 1:
                        _a.sent();
                        return [4, bash.execute("\n            az acr login -n ".concat(containerRepositoryName, "\n        "))];
                    case 2:
                        _a.sent();
                        this.loggedInToACR = true;
                        return [2];
                }
            });
        });
    };
    AZ.prototype.createResourceGroup = function (name, location, tags) {
        return __awaiter(this, void 0, void 0, function () {
            var tagsAsString, _i, _a, _b, key, value;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4, this.login()];
                    case 1:
                        _c.sent();
                        tagsAsString = '';
                        for (_i = 0, _a = Object.entries(tags); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            tagsAsString += "".concat(key, "=").concat(value, " ");
                        }
                        return [4, bash.execute("az group create --location ".concat(location, " --name ").concat(name, " --subscription ").concat(this.options.subscriptionId, " --tags ").concat(tagsAsString))];
                    case 2:
                        _c.sent();
                        return [2];
                }
            });
        });
    };
    AZ.prototype.registerAzureProvider = function (providerName) {
        return __awaiter(this, void 0, void 0, function () {
            var providers, provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.login()];
                    case 1:
                        _a.sent();
                        (0, logging_1.header)("Checking ".concat(providerName, " Provider Registration"));
                        return [4, bash.json("az provider list --query \"[?namespace=='".concat(providerName, "']\" --output json"))];
                    case 2:
                        providers = _a.sent();
                        if (!providers.length) return [3, 4];
                        provider = providers[0];
                        if (!(provider.registrationState === "NotRegistered")) return [3, 4];
                        (0, logging_1.header)("Registering ".concat(providerName, " Provider"));
                        return [4, bash.execute("az provider register --namespace ".concat(providerName, " --wait"))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    AZ.prototype.getAzureContainerRepositoryPassword = function (name) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.login()];
                    case 1:
                        _a.sent();
                        return [4, bash.json("az acr credential show --name ".concat(name, " --subscription ").concat(this.options.subscriptionId), true)];
                    case 2:
                        result = _a.sent();
                        if (!result.passwords.length)
                            throw new Error("Expected passwords from the Azure Container Registry: ".concat(name));
                        return [2, result.passwords[0].value];
                }
            });
        });
    };
    AZ.prototype.getKeyVaultSecret = function (secretName, keyVaultName) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.login()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4, bash.json("az keyvault secret show --name ".concat(secretName, " --vault-name ").concat(keyVaultName), true)];
                    case 3:
                        result = _a.sent();
                        console.log("Secret [".concat(secretName, "] found in [").concat(keyVaultName, "] keyvault"));
                        return [2, result.value];
                    case 4:
                        error_1 = _a.sent();
                        console.log("Secret [".concat(secretName, "] not found in [").concat(keyVaultName, "] keyvault"));
                        return [2, null];
                    case 5: return [2];
                }
            });
        });
    };
    AZ.prototype.getContainerAppUrl = function (name, resourceGroup) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.login()];
                    case 1:
                        _a.sent();
                        return [4, bash.json("\n            az containerapp show -n ".concat(name, " --resource-group ").concat(resourceGroup, "\n        "))];
                    case 2:
                        result = _a.sent();
                        if (!result)
                            throw new Error("ContainerApp ".concat(name, " not found in ").concat(resourceGroup));
                        return [2, result.properties.configuration.ingress.fqdn];
                }
            });
        });
    };
    AZ.prototype.deleteOrphanedApplicationSecurityPrincipals = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ids;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.login()];
                    case 1:
                        _a.sent();
                        return [4, bash.json("\n            az role assignment list --all --query \"[?principalName==''].id\"    \n        ")];
                    case 2:
                        ids = _a.sent();
                        if (!ids.length) return [3, 4];
                        return [4, bash.json("\n                az role assignment delete --ids ".concat(ids.join(' '), "\n            "))];
                    case 3:
                        _a.sent();
                        console.log("Deleted ".concat(ids.length, " orphaned application security principals"));
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    return AZ;
}());
exports.AZ = AZ;
//# sourceMappingURL=az.js.map