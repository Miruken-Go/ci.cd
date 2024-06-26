"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.GH = void 0;
var bash = require("./bash");
var axios_1 = require("axios");
var GH = (function () {
    function GH(options) {
        this.options = options;
        if (!process.env['GH_TOKEN']) {
            throw new Error('The gh command line tool requires GH_TOKEN to be set as and environment variable.');
        }
    }
    GH.prototype.sendRepositoryDispatch = function (eventType, payload, repository) {
        return __awaiter(this, void 0, void 0, function () {
            var repo;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.skipRepositoryDispatches) == true)
                            return [2];
                        repo = repository || this.options.repository;
                        if (!repo)
                            throw new Error("Repository name is required");
                        payload = __assign(__assign({}, payload), { ref: this.options.ref });
                        return [4, axios_1.default.post("https://api.github.com/repos/".concat(repo, "/dispatches"), {
                                event_type: eventType,
                                client_payload: payload
                            }, {
                                headers: {
                                    Accept: 'application/vnd.github+json',
                                    Authorization: "Bearer ".concat(this.options.ghToken),
                                    "X-GitHub-Api-Version": '2022-11-28'
                                }
                            })];
                    case 1:
                        _b.sent();
                        console.log("Sent [".concat(eventType, "] repository dispatch to [").concat(repo, "] with data [").concat(JSON.stringify(payload), "]"));
                        return [2];
                }
            });
        });
    };
    GH.prototype.sendRepositoryDispatches = function (eventType, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var repos, _i, repos_1, repo;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.skipRepositoryDispatches) == true)
                            return [2];
                        if (!process.env.GH_TOKEN)
                            throw 'Environment variable required: GH_TOKEN';
                        return [4, bash.json("\n            gh repo list ".concat(this.options.repositoryOwner, " --json name\n        "))];
                    case 1:
                        repos = _b.sent();
                        _i = 0, repos_1 = repos;
                        _b.label = 2;
                    case 2:
                        if (!(_i < repos_1.length)) return [3, 5];
                        repo = repos_1[_i];
                        return [4, this.sendRepositoryDispatch(eventType, payload, "".concat(this.options.repositoryOwner, "/").concat(repo.name))];
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
    return GH;
}());
exports.GH = GH;
//# sourceMappingURL=gh.js.map