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
exports.sendRepositoryDispatches = exports.sendRepositoryDispatch = void 0;
const bash = __importStar(require("./bash"));
const axios_1 = __importDefault(require("axios"));
function sendRepositoryDispatch(eventType, payload, repository, config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.skipRepositoryDispatches)
            return;
        const repo = repository || config.repository;
        if (!repo)
            throw new Error("Repository name is required");
        payload = Object.assign(Object.assign({}, payload), { ref: config.ref });
        //in this case the repo variable should be repositoryOwner/repositoryName
        //for example Miruken-Go/demo.microservices
        //the git.repository context variable is in this format
        yield axios_1.default.post(`https://api.github.com/repos/${repo}/dispatches`, {
            event_type: eventType,
            client_payload: payload
        }, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${config.ghToken}`,
                "X-GitHub-Api-Version": '2022-11-28'
            }
        });
        console.log(`Sent [${eventType}] repository dispatch to [${repo}] with data [${JSON.stringify(payload)}]`);
    });
}
exports.sendRepositoryDispatch = sendRepositoryDispatch;
function sendRepositoryDispatches(eventType, payload, config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.skipRepositoryDispatches)
            return;
        if (!process.env.GH_TOKEN)
            throw 'Environment variable required: GH_TOKEN';
        const repos = yield bash.json(`
        gh repo list ${config.repositoryOwner} --json name
    `);
        for (const repo of repos) {
            yield sendRepositoryDispatch(eventType, payload, `${config.repositoryOwner}/${repo.name}`, config);
        }
    });
}
exports.sendRepositoryDispatches = sendRepositoryDispatches;
//# sourceMappingURL=gh.js.map