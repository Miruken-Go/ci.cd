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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.B2C = void 0;
const logging = __importStar(require("./logging"));
const az_1 = require("./az");
const graph_1 = require("./graph");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const axios_1 = __importDefault(require("axios"));
class B2C {
    constructor(domain, b2cNames, tenantId, subscriptionId, deploymentPipelineClientId, deploymentPipelineClientSecret, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret) {
        if (!domain)
            throw new Error('domain is required');
        if (!b2cDeploymentPipelineClientId)
            throw new Error('b2cDeploymentPipelineClientId is required');
        this.domain = domain;
        this.b2cNames = b2cNames;
        this.graph = new graph_1.Graph(domain, b2cNames, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret);
        this.az = new az_1.AZ(tenantId, subscriptionId, deploymentPipelineClientId, deploymentPipelineClientSecret);
    }
    getWellKnownOpenIdConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = this.b2cNames.openIdConfigurationUrl;
            console.log(`Getting: ${uri}`);
            const result = yield axios_1.default.get(uri)
                .catch((error) => {
                console.log(`Failed to Get: ${uri}`);
                this.logError(error);
                throw error;
            });
            console.log(result.data);
            return result.data;
        });
    }
    getApplications() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.graph.get("/applications");
            return result.data.value;
        });
    }
    getApplicationById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.graph.get(`/applications/${id}`);
            return result.data;
        });
    }
    getApplicationByName(displayName) {
        return __awaiter(this, void 0, void 0, function* () {
            const applications = yield this.getApplications();
            const application = applications.find(a => a.displayName === displayName);
            console.log(application);
            return application;
        });
    }
    updateApplication(id, manifest) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Updating existing application appId [${id}]`);
            yield this.graph.patch(`/applications/${id}`, manifest);
            return yield this.getApplicationById(id);
        });
    }
    createOrUpdateApplication(manifest) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayName = manifest.displayName;
            const existing = yield this.getApplicationByName(displayName);
            let application = undefined;
            if (existing) {
                if (!existing.id)
                    throw new Error('Id required to update application');
                application = yield this.updateApplication(existing.id, manifest);
            }
            else {
                console.log(`Creating application: ${displayName}`);
                application = (yield this.graph.post("/applications", manifest)).data;
                console.log(`Created Application: ${displayName}`);
                console.log(application);
            }
            return application;
        });
    }
    addRedirectUris(id, uris) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const app = yield this.getApplicationById(id);
            if (!((_a = app === null || app === void 0 ? void 0 : app.spa) === null || _a === void 0 ? void 0 : _a.redirectUris))
                return;
            const redirectUris = [...app.spa.redirectUris];
            for (const uri of uris) {
                if (!redirectUris.includes(uri)) {
                    redirectUris.push(uri);
                }
            }
            yield this.updateApplication(id, {
                spa: {
                    redirectUris: redirectUris
                }
            });
            return yield this.getApplicationById(id);
        });
    }
    configureAppRegistrations() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.configureAppRegistration(this.domain);
            for (const domain of this.domain.domains) {
                yield this.configureAppRegistration(domain);
            }
        });
    }
    configureAppRegistration(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            const GROUP_ID = 'db580dbb-797c-4334-bf09-db802106accd';
            const ROLE_ID = '0ba8756b-c67c-4fd3-9d70-488fc8da3b55';
            const ENTITLEMENT_ID = 'd748b2c9-a76b-47b2-8c7b-fa348fbb474d';
            const appRegistration = yield this.createOrUpdateApplication({
                displayName: domain.name,
                signInAudience: 'AzureADandPersonalMicrosoftAccount',
                identifierUris: [`https://${this.b2cNames.name}.onmicrosoft.com/${domain.name}`],
                api: {
                    requestedAccessTokenVersion: 2,
                    oauth2PermissionScopes: [
                        {
                            id: GROUP_ID,
                            adminConsentDescription: 'Groups to which the user belongs.',
                            adminConsentDisplayName: 'Group',
                            isEnabled: true,
                            type: 'Admin',
                            value: 'Group',
                        },
                        {
                            id: ROLE_ID,
                            adminConsentDescription: 'Roles to which a user belongs',
                            adminConsentDisplayName: 'Role',
                            isEnabled: true,
                            type: 'Admin',
                            value: 'Role',
                        },
                        {
                            id: ENTITLEMENT_ID,
                            adminConsentDescription: 'Entitlements which belong to the user',
                            adminConsentDisplayName: 'Entitlement',
                            isEnabled: true,
                            type: 'Admin',
                            value: 'Entitlement',
                        },
                    ],
                },
            });
            console.log(appRegistration);
            const requiredResourceAccess = yield this.createOrUpdateApplication({
                displayName: domain.name,
                requiredResourceAccess: [
                    {
                        resourceAppId: '00000003-0000-0000-c000-000000000000',
                        resourceAccess: [
                            {
                                'id': '37f7f235-527c-4136-accd-4a02d197296e',
                                'type': 'Scope'
                            },
                            {
                                'id': '7427e0e9-2fba-42fe-b0c0-848c9e6a8182',
                                'type': 'Scope'
                            }
                        ]
                    },
                    {
                        resourceAppId: appRegistration.appId,
                        resourceAccess: [
                            {
                                id: GROUP_ID,
                                type: 'Scope',
                            },
                            {
                                id: ROLE_ID,
                                type: 'Scope',
                            },
                            {
                                id: ENTITLEMENT_ID,
                                type: 'Scope',
                            },
                        ],
                    },
                ],
            });
            console.log(requiredResourceAccess);
            if (domain.applications.some(a => a.implicitFlow)) {
                console.log('Configure implicit flow');
                const implicitGrant = yield this.createOrUpdateApplication({
                    displayName: domain.name,
                    web: {
                        implicitGrantSettings: {
                            enableAccessTokenIssuance: true,
                            enableIdTokenIssuance: true,
                        }
                    }
                });
                console.log(implicitGrant);
            }
            if (domain.applications.some(a => a.spa)) {
                console.log('Configure spa');
                const redirectUris = (['dev', 'qa'].includes(this.domain.env))
                    ? [
                        'https://jwt.ms/',
                        'http://localhost:8080/oauth2-redirect.html',
                    ]
                    : [];
                const spa = yield this.createOrUpdateApplication({
                    displayName: domain.name,
                    spa: {
                        redirectUris: redirectUris
                    },
                });
                console.log(spa);
            }
        });
    }
    configureCustomPolicies(customPoliciesDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!customPoliciesDirectory)
                throw new Error('customPoliciesDirectory is required');
            logging.header("Deploying B2C Configuration");
            const identityExperienceFrameworkClient = yield this.getApplicationByName('IdentityExperienceFramework');
            if (!identityExperienceFrameworkClient || !identityExperienceFrameworkClient.appId)
                throw new Error("IdentityExperienceFramework application not found. Check that the App Registration was created in B2C and check the name spelling and casing.");
            const proxyIdentityExperienceFrameworkClient = yield this.getApplicationByName('ProxyIdentityExperienceFramework');
            if (!proxyIdentityExperienceFrameworkClient || !proxyIdentityExperienceFrameworkClient.appId)
                throw new Error("ProxyIdentityExperienceFramework application not found. Check that the App Registration was created in B2C and check the name spelling and casing.");
            const containerAppName = this.domain.enrichApiApplication.containerAppName;
            const appUrl = yield this.az.getContainerAppUrl(containerAppName, this.domain.resourceGroups.instance);
            if (!appUrl)
                throw new Error(`authorizationServiceUrl could not be calculated. The AppUrl for ${containerAppName} container app was not found. The default application environment instance needs to be deployed before common configuration can run.`);
            const authorizationServiceUrl = `https://${appUrl}/enrich`;
            //https://learn.microsoft.com/en-us/azure/active-directory-b2c/deploy-custom-policies-devops
            const customPoliciesFileOrder = [
                'TrustFrameworkBase.xml',
                'TrustFrameworkLocalization.xml',
                'TrustFrameworkExtensions.xml',
                'SignUp_SignIn.xml',
                'ProfileEdit.xml',
                'PasswordReset.xml',
            ];
            for (const file of customPoliciesFileOrder) {
                const policyId = `B2C_1A_${path.basename(file, '.xml')}`;
                const filePath = path.join(customPoliciesDirectory, file);
                let xml = fs.readFileSync(filePath, { encoding: 'utf-8' });
                xml = xml.replace(/{B2C_DOMAIN_NAME}/g, this.b2cNames.domainName);
                xml = xml.replace(/{IDENTITY_EXPERIENCE_FRAMEWORK_CLIENTID}/g, identityExperienceFrameworkClient.appId);
                xml = xml.replace(/{PROXY_IDENTITY_EXPERIENCE_FRAMEWORK_CLIENTID}/g, proxyIdentityExperienceFrameworkClient.appId);
                xml = xml.replace(/{AUTHORIZATION_SERVICE_URL}/g, authorizationServiceUrl);
                yield this.graph.updateTrustFrameworkPolicy(policyId, xml);
            }
            ;
        });
    }
    logError(error) {
        if (error.response) {
            console.log(`status: ${error.response.status}`);
            console.log(`error.response.data: ${JSON.stringify(error.response.data)}`);
        }
    }
}
exports.B2C = B2C;
//# sourceMappingURL=b2c.js.map