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
const bash = __importStar(require("../src/infrastructure/bash"));
const logging = __importStar(require("../src/infrastructure/logging"));
const git_1 = require("../src/infrastructure/git");
const handler_1 = require("../src/infrastructure/handler");
const envVariables_1 = require("../src/infrastructure/envVariables");
const envSecrets_1 = require("../src/infrastructure/envSecrets");
(0, handler_1.handle)(() => __awaiter(void 0, void 0, void 0, function* () {
    const variables = new envVariables_1.EnvVariables()
        .required(['repositoryPath'])
        .variables;
    const secrets = new envSecrets_1.EnvSecrets()
        .require(['ghToken'])
        .secrets;
    logging.printEnvironmentVariables(variables);
    logging.printEnvironmentSecrets(secrets);
    logging.header("Publishing ci.cd");
    //This docker container is running docker in docker from github actions
    //Therefore using $(pwd) to get the working directory would be the working directory of the running container 
    //Not the working directory from the host system. So we need to pass in the repository path.
    const rawVersion = yield bash.execute(`
        docker run --rm -v '${variables.repositoryPath}:/repo' \
        gittools/gitversion:5.12.0-alpine.3.14-6.0 /repo /showvariable SemVer
    `);
    const git = new git_1.Git(secrets.ghToken);
    yield git.commitAll('Transpiled typescript to javascript');
    yield git.push();
    const gitTag = `v${rawVersion}`;
    console.log(`gitTag: [${gitTag}]`);
    yield git.tagAndPush(gitTag);
}));
//# sourceMappingURL=publish.js.map