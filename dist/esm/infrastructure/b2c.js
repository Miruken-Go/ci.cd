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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import * as logging from './logging';
import { AZ } from './az';
import { Graph } from './graph';
import * as fs from 'node:fs';
import * as path from 'node:path';
import axios from 'axios';
var B2C = (function () {
    function B2C(domain, b2cNames, tenantId, subscriptionId, deploymentPipelineClientId, deploymentPipelineClientSecret, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret) {
        if (!domain)
            throw new Error('domain is required');
        if (!b2cDeploymentPipelineClientId)
            throw new Error('b2cDeploymentPipelineClientId is required');
        this.domain = domain;
        this.b2cNames = b2cNames;
        this.graph = new Graph(domain, b2cNames, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret);
        this.az = new AZ({ tenantId: tenantId, subscriptionId: subscriptionId, deploymentPipelineClientId: deploymentPipelineClientId, deploymentPipelineClientSecret: deploymentPipelineClientSecret });
    }
    B2C.prototype.getWellKnownOpenIdConfiguration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var uri, result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uri = this.b2cNames.openIdConfigurationUrl;
                        console.log("Getting: ".concat(uri));
                        return [4, axios.get(uri)
                                .catch(function (error) {
                                console.log("Failed to Get: ".concat(uri));
                                _this.logError(error);
                                throw error;
                            })];
                    case 1:
                        result = _a.sent();
                        console.log(result.data);
                        return [2, result.data];
                }
            });
        });
    };
    B2C.prototype.getApplications = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.graph.get("/applications")];
                    case 1:
                        result = _a.sent();
                        return [2, result.data.value];
                }
            });
        });
    };
    B2C.prototype.getApplicationById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.graph.get("/applications/".concat(id))];
                    case 1:
                        result = _a.sent();
                        return [2, result.data];
                }
            });
        });
    };
    B2C.prototype.getApplicationByName = function (displayName) {
        return __awaiter(this, void 0, void 0, function () {
            var applications, application;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.getApplications()];
                    case 1:
                        applications = _a.sent();
                        application = applications.find(function (a) { return a.displayName === displayName; });
                        console.log(application);
                        return [2, application];
                }
            });
        });
    };
    B2C.prototype.updateApplication = function (id, manifest) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Updating existing application appId [".concat(id, "]"));
                        return [4, this.graph.patch("/applications/".concat(id), manifest)];
                    case 1:
                        _a.sent();
                        return [4, this.getApplicationById(id)];
                    case 2: return [2, _a.sent()];
                }
            });
        });
    };
    B2C.prototype.createOrUpdateApplication = function (manifest) {
        return __awaiter(this, void 0, void 0, function () {
            var displayName, existing, application;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        displayName = manifest.displayName;
                        return [4, this.getApplicationByName(displayName)];
                    case 1:
                        existing = _a.sent();
                        application = undefined;
                        if (!existing) return [3, 3];
                        if (!existing.id)
                            throw new Error('Id required to update application');
                        return [4, this.updateApplication(existing.id, manifest)];
                    case 2:
                        application = _a.sent();
                        return [3, 5];
                    case 3:
                        console.log("Creating application: ".concat(displayName));
                        return [4, this.graph.post("/applications", manifest)];
                    case 4:
                        application = (_a.sent()).data;
                        console.log("Created Application: ".concat(displayName));
                        console.log(application);
                        _a.label = 5;
                    case 5: return [2, application];
                }
            });
        });
    };
    B2C.prototype.addRedirectUris = function (id, uris) {
        return __awaiter(this, void 0, void 0, function () {
            var app, redirectUris, _i, uris_1, uri;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.getApplicationById(id)];
                    case 1:
                        app = _b.sent();
                        if (!((_a = app === null || app === void 0 ? void 0 : app.spa) === null || _a === void 0 ? void 0 : _a.redirectUris))
                            return [2];
                        redirectUris = __spreadArray([], app.spa.redirectUris, true);
                        for (_i = 0, uris_1 = uris; _i < uris_1.length; _i++) {
                            uri = uris_1[_i];
                            if (!redirectUris.includes(uri)) {
                                redirectUris.push(uri);
                            }
                        }
                        return [4, this.updateApplication(id, {
                                spa: {
                                    redirectUris: redirectUris
                                }
                            })];
                    case 2:
                        _b.sent();
                        return [4, this.getApplicationById(id)];
                    case 3: return [2, _b.sent()];
                }
            });
        });
    };
    B2C.prototype.configureAppRegistrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, domain;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.configureAppRegistration(this.domain)];
                    case 1:
                        _b.sent();
                        _i = 0, _a = this.domain.domains;
                        _b.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3, 5];
                        domain = _a[_i];
                        return [4, this.configureAppRegistration(domain)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3, 2];
                    case 5: return [2];
                }
            });
        });
    };
    B2C.prototype.configureAppRegistration = function (domain) {
        return __awaiter(this, void 0, void 0, function () {
            var GROUP_ID, ROLE_ID, ENTITLEMENT_ID, appRegistration, requiredResourceAccess, implicitGrant, redirectUris, spa;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        GROUP_ID = 'db580dbb-797c-4334-bf09-db802106accd';
                        ROLE_ID = '0ba8756b-c67c-4fd3-9d70-488fc8da3b55';
                        ENTITLEMENT_ID = 'd748b2c9-a76b-47b2-8c7b-fa348fbb474d';
                        return [4, this.createOrUpdateApplication({
                                displayName: domain.name,
                                signInAudience: 'AzureADandPersonalMicrosoftAccount',
                                identifierUris: ["https://".concat(this.b2cNames.name, ".onmicrosoft.com/").concat(domain.name)],
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
                            })];
                    case 1:
                        appRegistration = _a.sent();
                        console.log(appRegistration);
                        return [4, this.createOrUpdateApplication({
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
                            })];
                    case 2:
                        requiredResourceAccess = _a.sent();
                        console.log(requiredResourceAccess);
                        if (!domain.applications.some(function (a) { return a.implicitFlow; })) return [3, 4];
                        console.log('Configure implicit flow');
                        return [4, this.createOrUpdateApplication({
                                displayName: domain.name,
                                web: {
                                    implicitGrantSettings: {
                                        enableAccessTokenIssuance: true,
                                        enableIdTokenIssuance: true,
                                    }
                                }
                            })];
                    case 3:
                        implicitGrant = _a.sent();
                        console.log(implicitGrant);
                        _a.label = 4;
                    case 4:
                        if (!domain.applications.some(function (a) { return a.spa; })) return [3, 6];
                        console.log('Configure spa');
                        redirectUris = (['dev', 'qa'].includes(this.domain.env))
                            ? [
                                'https://jwt.ms/',
                                'http://localhost:8080/oauth2-redirect.html',
                            ]
                            : [];
                        return [4, this.createOrUpdateApplication({
                                displayName: domain.name,
                                spa: {
                                    redirectUris: redirectUris
                                },
                            })];
                    case 5:
                        spa = _a.sent();
                        console.log(spa);
                        _a.label = 6;
                    case 6: return [2];
                }
            });
        });
    };
    B2C.prototype.configureCustomPolicies = function (customPoliciesDirectory) {
        return __awaiter(this, void 0, void 0, function () {
            var identityExperienceFrameworkClient, proxyIdentityExperienceFrameworkClient, containerAppName, appUrl, authorizationServiceUrl, customPoliciesFileOrder, _i, customPoliciesFileOrder_1, file, policyId, filePath, xml;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!customPoliciesDirectory)
                            throw new Error('customPoliciesDirectory is required');
                        logging.header("Deploying B2C Configuration");
                        return [4, this.getApplicationByName('IdentityExperienceFramework')];
                    case 1:
                        identityExperienceFrameworkClient = _a.sent();
                        if (!identityExperienceFrameworkClient || !identityExperienceFrameworkClient.appId)
                            throw new Error("IdentityExperienceFramework application not found. Check that the App Registration was created in B2C and check the name spelling and casing.");
                        return [4, this.getApplicationByName('ProxyIdentityExperienceFramework')];
                    case 2:
                        proxyIdentityExperienceFrameworkClient = _a.sent();
                        if (!proxyIdentityExperienceFrameworkClient || !proxyIdentityExperienceFrameworkClient.appId)
                            throw new Error("ProxyIdentityExperienceFramework application not found. Check that the App Registration was created in B2C and check the name spelling and casing.");
                        containerAppName = this.domain.enrichApiApplication.containerAppName;
                        return [4, this.az.getContainerAppUrl(containerAppName, this.domain.resourceGroups.instance)];
                    case 3:
                        appUrl = _a.sent();
                        if (!appUrl)
                            throw new Error("authorizationServiceUrl could not be calculated. The AppUrl for ".concat(containerAppName, " container app was not found. The default application environment instance needs to be deployed before common configuration can run."));
                        authorizationServiceUrl = "https://".concat(appUrl, "/enrich");
                        customPoliciesFileOrder = [
                            'TrustFrameworkBase.xml',
                            'TrustFrameworkLocalization.xml',
                            'TrustFrameworkExtensions.xml',
                            'SignUp_SignIn.xml',
                            'ProfileEdit.xml',
                            'PasswordReset.xml',
                        ];
                        _i = 0, customPoliciesFileOrder_1 = customPoliciesFileOrder;
                        _a.label = 4;
                    case 4:
                        if (!(_i < customPoliciesFileOrder_1.length)) return [3, 7];
                        file = customPoliciesFileOrder_1[_i];
                        policyId = "B2C_1A_".concat(path.basename(file, '.xml'));
                        filePath = path.join(customPoliciesDirectory, file);
                        xml = fs.readFileSync(filePath, { encoding: 'utf-8' });
                        xml = xml.replace(/{B2C_DOMAIN_NAME}/g, this.b2cNames.domainName);
                        xml = xml.replace(/{IDENTITY_EXPERIENCE_FRAMEWORK_CLIENTID}/g, identityExperienceFrameworkClient.appId);
                        xml = xml.replace(/{PROXY_IDENTITY_EXPERIENCE_FRAMEWORK_CLIENTID}/g, proxyIdentityExperienceFrameworkClient.appId);
                        xml = xml.replace(/{AUTHORIZATION_SERVICE_URL}/g, authorizationServiceUrl);
                        return [4, this.graph.updateTrustFrameworkPolicy(policyId, xml)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3, 4];
                    case 7:
                        ;
                        return [2];
                }
            });
        });
    };
    B2C.prototype.logError = function (error) {
        if (error.response) {
            console.log("status: ".concat(error.response.status));
            console.log("error.response.data: ".concat(JSON.stringify(error.response.data)));
        }
    };
    return B2C;
}());
export { B2C };
//# sourceMappingURL=b2c.js.map