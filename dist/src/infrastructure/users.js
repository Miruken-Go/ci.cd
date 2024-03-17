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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
const logging_1 = require("./logging");
const graph_1 = require("./graph");
class Users {
    constructor(domain, b2cNames, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret) {
        if (!domain)
            throw new Error('domain is required');
        if (!b2cDeploymentPipelineClientId)
            throw new Error('b2cDeploymentPipelineClientId is required');
        this.domain = domain;
        this.b2cNames = b2cNames;
        this.graph = new graph_1.Graph(domain, b2cNames, b2cDeploymentPipelineClientId, b2cDeploymentPipelineClientSecret);
    }
    configureBootstrapUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.domain.bootstrapUsers || !this.domain.bootstrapUsers.length)
                return;
            (0, logging_1.header)("Configuring Bootstrap Users");
            for (const email of this.domain.bootstrapUsers) {
                var userData = undefined;
                const userresp = yield this.graph.get(`/users?$filter=(mail eq '${email}')`);
                if (userresp.data.value.length) {
                    userData = userresp.data.value[0];
                    console.log('Existing user');
                }
                if (!userData) {
                    console.log(`Creating bootstrap user: ${email}`);
                    const createdUser = yield this.graph.post('/users', {
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
                    });
                    userData = createdUser.data;
                }
                console.log('Created boostrap user', userData);
            }
        });
    }
}
exports.Users = Users;
//# sourceMappingURL=users.js.map