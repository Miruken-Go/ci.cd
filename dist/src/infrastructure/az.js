"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AZ = void 0;
const bash = __importStar(require("./bash"));
const logging_1 = require("./logging");
class AZ {
    constructor(tenantId, subscriptionId, deploymentPipelineClientId, deploymentPipelineClientSecret) {
        this.loggedInToAZ = false;
        this.loggedInToACR = false;
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
        this.deploymentPipelineClientId = deploymentPipelineClientId;
        this.deploymentPipelineClientSecret = deploymentPipelineClientSecret;
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loggedInToAZ)
                return;
            (0, logging_1.header)('Logging into az');
            yield bash.execute(`az login --service-principal --username ${this.deploymentPipelineClientId} --password ${this.deploymentPipelineClientSecret} --tenant ${this.tenantId}`);
            this.loggedInToAZ = true;
        });
    }
    loginToACR(containerRepositoryName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loggedInToACR)
                return;
            (0, logging_1.header)('Logging into ACR');
            yield this.login();
            yield bash.execute(`
            az acr login -n ${containerRepositoryName}
        `);
            this.loggedInToACR = true;
        });
    }
    createResourceGroup(name, location, tags) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.login();
            yield bash.execute(`az group create --location ${location} --name ${name} --subscription ${this.subscriptionId} --tags ${tags}`);
        });
    }
    // https://learn.microsoft.com/en-us/azure/azure-resource-manager/troubleshooting/error-register-resource-provider?tabs=azure-cli
    registerAzureProvider(providerName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.login();
            (0, logging_1.header)(`Checking ${providerName} Provider Registration`);
            const providers = yield bash.json(`az provider list --query "[?namespace=='${providerName}']" --output json`);
            if (providers.length) {
                const provider = providers[0];
                if (provider.registrationState === "NotRegistered") {
                    (0, logging_1.header)(`Registering ${providerName} Provider`);
                    yield bash.execute(`az provider register --namespace ${providerName} --wait`);
                }
            }
        });
    }
    getAzureContainerRepositoryPassword(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.login();
            const result = yield bash.json(`az acr credential show --name ${name} --subscription ${this.subscriptionId}`, true);
            if (!result.passwords.length)
                throw new Error(`Expected passwords from the Azure Container Registry: ${name}`);
            return result.passwords[0].value;
        });
    }
    getKeyVaultSecret(secretName, keyVaultName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.login();
            try {
                const result = yield bash.json(`az keyvault secret show --name ${secretName} --vault-name ${keyVaultName}`, true);
                console.log(`Secret [${secretName}] found in [${keyVaultName}] keyvault`);
                return result.value;
            }
            catch (error) {
                console.log(`Secret [${secretName}] not found in [${keyVaultName}] keyvault`);
                return null;
            }
        });
    }
    getContainerAppUrl(name, resourceGroup) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.login();
            const result = yield bash.json(`
            az containerapp show -n ${name} --resource-group ${resourceGroup}
        `);
            if (!result)
                throw new Error(`ContainerApp ${name} not found in ${resourceGroup}`);
            return result.properties.configuration.ingress.fqdn;
        });
    }
    deleteOrphanedApplicationSecurityPrincipals(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.login();
            const ids = yield bash.json(`
            az role assignment list --all --query "[?principalName==''].id"    
        `);
            if (ids.length) {
                yield bash.json(`
                az role assignment delete --ids ${ids.join(' ')}
            `);
                console.log(`Deleted ${ids.length} orphaned application security principals`);
            }
        });
    }
}
exports.AZ = AZ;
//# sourceMappingURL=az.js.map