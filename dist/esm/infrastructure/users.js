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
import { header } from './logging';
import { Graph } from './graph';
var Users = (function () {
    function Users(domain, b2cNames, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret) {
        if (!domain)
            throw new Error('domain is required');
        if (!b2cDeploymentPipelineClientId)
            throw new Error('b2cDeploymentPipelineClientId is required');
        this.domain = domain;
        this.b2cNames = b2cNames;
        this.graph = new Graph(domain, b2cNames, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret);
    }
    Users.prototype.configureBootstrapUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, email, userData, userresp, createdUser;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.domain.bootstrapUsers || !this.domain.bootstrapUsers.length)
                            return [2];
                        header("Configuring Bootstrap Users");
                        _i = 0, _a = this.domain.bootstrapUsers;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3, 6];
                        email = _a[_i];
                        userData = undefined;
                        return [4, this.graph.get("/users?$filter=(mail eq '".concat(email, "')"))];
                    case 2:
                        userresp = _b.sent();
                        if (userresp.data.value.length) {
                            userData = userresp.data.value[0];
                            console.log('Existing user');
                        }
                        if (!!userData) return [3, 4];
                        console.log("Creating bootstrap user: ".concat(email));
                        return [4, this.graph.post('/users', {
                                identities: [{
                                        signInType: "emailAddress",
                                        issuer: this.b2cNames.domainName,
                                        issuerAssignedId: email
                                    }],
                                userType: "Member",
                                mail: email,
                                displayName: 'bootstrap user',
                                accountEnabled: true,
                                passwordProfile: {
                                    forceChangePasswordNextSignIn: true,
                                    password: "xWwvJ]6NMw+bWH-d"
                                }
                            })];
                    case 3:
                        createdUser = _b.sent();
                        userData = createdUser.data;
                        _b.label = 4;
                    case 4:
                        console.log('Created boostrap user', userData);
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3, 1];
                    case 6: return [2];
                }
            });
        });
    };
    return Users;
}());
export { Users };
//# sourceMappingURL=users.js.map