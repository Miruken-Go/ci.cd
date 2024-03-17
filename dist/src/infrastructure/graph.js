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
exports.Graph = void 0;
const querystring = __importStar(require("node:querystring"));
const axios_1 = __importDefault(require("axios"));
class Graph {
    constructor(domain, b2cNames, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret) {
        this._token = undefined;
        if (!domain)
            throw new Error('domain is required');
        if (!b2cDeploymentPipelineClientId)
            throw new Error('b2cDeploymentPipelineClientId is required');
        if (!b2cDeploymentPipelineClientSecret)
            throw new Error('b2cDeploymentPipelineClientSecret is required');
        this.domain = domain;
        this.b2cNames = b2cNames;
        this.b2cDeploymentPipelineClientId = b2cDeploymentPipelineClientId;
        this.b2cDeploymentPipelineClientSecret = b2cDeploymentPipelineClientSecret;
    }
    getToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._token)
                return this._token;
            const uri = `https://login.microsoftonline.com/${this.b2cNames.domainName}/oauth2/v2.0/token`;
            const result = yield axios_1.default.post(uri, querystring.stringify({
                client_id: this.b2cDeploymentPipelineClientId,
                scope: 'https://graph.microsoft.com/.default',
                client_secret: this.b2cDeploymentPipelineClientSecret,
                grant_type: 'client_credentials'
            }));
            console.log('Retrieved token');
            this._token = result.data.access_token;
            return this._token;
        });
    }
    get(endpoint_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, version = 'v1.0') {
            const uri = `https://graph.microsoft.com/${version}${endpoint}`;
            console.log(`Getting: ${uri}`);
            const options = {
                headers: {
                    Authorization: `Bearer ${yield this.getToken()}`
                }
            };
            try {
                return yield axios_1.default.get(uri, options);
            }
            catch (error) {
                console.log(`Failed to Get: ${uri}`);
                this.logError(error);
                throw error;
            }
        });
    }
    post(endpoint_1, json_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, json, version = 'v1.0') {
            const uri = `https://graph.microsoft.com/${version}${endpoint}`;
            console.log(`Posting: ${uri}`);
            const options = {
                headers: {
                    Authorization: `Bearer ${yield this.getToken()}`,
                    "Content-Type": "application/json"
                }
            };
            try {
                return yield axios_1.default.post(uri, json, options);
            }
            catch (error) {
                console.log(`Failed to Post: ${uri}`);
                this.logError(error);
                throw error;
            }
        });
    }
    patch(endpoint_1, json_1) {
        return __awaiter(this, arguments, void 0, function* (endpoint, json, version = 'v1.0') {
            const uri = `https://graph.microsoft.com/${version}${endpoint}`;
            console.log(`Patching: ${uri}`);
            const options = {
                headers: {
                    Authorization: `Bearer ${yield this.getToken()}`,
                    "Content-Type": "application/json"
                }
            };
            try {
                return yield axios_1.default.patch(uri, json, options);
            }
            catch (error) {
                console.log(`Failed to Patch: ${uri}`);
                this.logError(error);
                throw error;
            }
        });
    }
    // https://learn.microsoft.com/en-us/graph/api/trustframework-put-trustframeworkpolicy?view=graph-rest-beta
    updateTrustFrameworkPolicy(policyId, xml) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = `https://graph.microsoft.com/beta/trustFramework/policies/${policyId}/$value`;
            console.log(`Putting: ${uri}`);
            const options = {
                headers: {
                    Authorization: `Bearer ${yield this.getToken()}`,
                    "Content-Type": "application/xml"
                }
            };
            try {
                var result = yield axios_1.default.put(uri, xml, options);
                console.log(result.status);
                return result;
            }
            catch (error) {
                console.log(`Failed to Update: ${uri}`);
                this.logError(error);
                throw error;
            }
        });
    }
    logError(error) {
        if (error.response) {
            console.log(`status: ${error.response.status}`);
            console.log(`error.response.data: ${JSON.stringify(error.response.data)}`);
        }
    }
}
exports.Graph = Graph;
Graph.APP_ID = "00000003-0000-0000-c000-000000000000";
//# sourceMappingURL=graph.js.map