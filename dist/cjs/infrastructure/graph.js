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
exports.Graph = void 0;
var querystring = require("node:querystring");
var axios_1 = require("axios");
var Graph = (function () {
    function Graph(domain, b2cNames, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret) {
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
    Graph.prototype.getToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var uri, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._token)
                            return [2, this._token];
                        uri = "https://login.microsoftonline.com/".concat(this.b2cNames.domainName, "/oauth2/v2.0/token");
                        return [4, axios_1.default.post(uri, querystring.stringify({
                                client_id: this.b2cDeploymentPipelineClientId,
                                scope: 'https://graph.microsoft.com/.default',
                                client_secret: this.b2cDeploymentPipelineClientSecret,
                                grant_type: 'client_credentials'
                            }))];
                    case 1:
                        result = _a.sent();
                        console.log('Retrieved token');
                        this._token = result.data.access_token;
                        return [2, this._token];
                }
            });
        });
    };
    Graph.prototype.get = function (endpoint_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, version) {
            var uri, options, _a, error_1;
            var _b, _c;
            if (version === void 0) { version = 'v1.0'; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        uri = "https://graph.microsoft.com/".concat(version).concat(endpoint);
                        console.log("Getting: ".concat(uri));
                        _b = {};
                        _c = {};
                        _a = "Bearer ".concat;
                        return [4, this.getToken()];
                    case 1:
                        options = (_b.headers = (_c.Authorization = _a.apply("Bearer ", [_d.sent()]),
                            _c),
                            _b);
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4, axios_1.default.get(uri, options)];
                    case 3: return [2, _d.sent()];
                    case 4:
                        error_1 = _d.sent();
                        console.log("Failed to Get: ".concat(uri));
                        this.logError(error_1);
                        throw error_1;
                    case 5: return [2];
                }
            });
        });
    };
    Graph.prototype.post = function (endpoint_1, json_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, json, version) {
            var uri, options, _a, error_2;
            var _b, _c;
            if (version === void 0) { version = 'v1.0'; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        uri = "https://graph.microsoft.com/".concat(version).concat(endpoint);
                        console.log("Posting: ".concat(uri));
                        _b = {};
                        _c = {};
                        _a = "Bearer ".concat;
                        return [4, this.getToken()];
                    case 1:
                        options = (_b.headers = (_c.Authorization = _a.apply("Bearer ", [_d.sent()]),
                            _c["Content-Type"] = "application/json",
                            _c),
                            _b);
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4, axios_1.default.post(uri, json, options)];
                    case 3: return [2, _d.sent()];
                    case 4:
                        error_2 = _d.sent();
                        console.log("Failed to Post: ".concat(uri));
                        this.logError(error_2);
                        throw error_2;
                    case 5: return [2];
                }
            });
        });
    };
    Graph.prototype.patch = function (endpoint_1, json_1) {
        return __awaiter(this, arguments, void 0, function (endpoint, json, version) {
            var uri, options, _a, error_3;
            var _b, _c;
            if (version === void 0) { version = 'v1.0'; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        uri = "https://graph.microsoft.com/".concat(version).concat(endpoint);
                        console.log("Patching: ".concat(uri));
                        _b = {};
                        _c = {};
                        _a = "Bearer ".concat;
                        return [4, this.getToken()];
                    case 1:
                        options = (_b.headers = (_c.Authorization = _a.apply("Bearer ", [_d.sent()]),
                            _c["Content-Type"] = "application/json",
                            _c),
                            _b);
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4, axios_1.default.patch(uri, json, options)];
                    case 3: return [2, _d.sent()];
                    case 4:
                        error_3 = _d.sent();
                        console.log("Failed to Patch: ".concat(uri));
                        this.logError(error_3);
                        throw error_3;
                    case 5: return [2];
                }
            });
        });
    };
    Graph.prototype.updateTrustFrameworkPolicy = function (policyId, xml) {
        return __awaiter(this, void 0, void 0, function () {
            var uri, options, _a, result, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        uri = "https://graph.microsoft.com/beta/trustFramework/policies/".concat(policyId, "/$value");
                        console.log("Putting: ".concat(uri));
                        _b = {};
                        _c = {};
                        _a = "Bearer ".concat;
                        return [4, this.getToken()];
                    case 1:
                        options = (_b.headers = (_c.Authorization = _a.apply("Bearer ", [_d.sent()]),
                            _c["Content-Type"] = "application/xml",
                            _c),
                            _b);
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4, axios_1.default.put(uri, xml, options)];
                    case 3:
                        result = _d.sent();
                        console.log(result.status);
                        return [2, result];
                    case 4:
                        error_4 = _d.sent();
                        console.log("Failed to Update: ".concat(uri));
                        this.logError(error_4);
                        throw error_4;
                    case 5: return [2];
                }
            });
        });
    };
    Graph.prototype.logError = function (error) {
        if (error.response) {
            console.log("status: ".concat(error.response.status));
            console.log("error.response.data: ".concat(JSON.stringify(error.response.data)));
        }
    };
    Graph.APP_ID = "00000003-0000-0000-c000-000000000000";
    return Graph;
}());
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map