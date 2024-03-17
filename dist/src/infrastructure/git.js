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
exports.Git = void 0;
const bash = __importStar(require("./bash"));
const logging = __importStar(require("./logging"));
class Git {
    constructor(ghToken) {
        if (!ghToken)
            throw new Error('ghToken is required');
        console.log("Configuring git");
        bash.execute(`
            git config --global --add safe.directory $(pwd)
            git config --global user.email "mirukenjs@gmail.com"
            git config --global user.name "buildpipeline"
            git config --global url."https://api:${ghToken}@github.com/".insteadOf "https://github.com/"
            git config --global url."https://ssh:${ghToken}@github.com/".insteadOf "ssh://git@github.com/"
            git config --global url."https://git:${ghToken}@github.com/".insteadOf "git@github.com:"
        `);
    }
    tagAndPush(tag) {
        return __awaiter(this, void 0, void 0, function* () {
            logging.header("Tagging the commit");
            const existingTag = yield bash.execute(`
            git tag -l ${tag}
        `);
            console.log(`existingTag: [${existingTag}]`);
            console.log(`tag: [${tag}]`);
            if (existingTag === tag) {
                console.log("Tag already created");
            }
            else {
                console.log("Tagging the release");
                yield bash.execute(`
                git tag -a ${tag} -m "Tagged by build pipeline"
                git push origin ${tag}
            `);
            }
        });
    }
    anyChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield bash.execute(`
            git status
        `);
            const foundChanges = status.includes('Changes not staged for commit');
            if (foundChanges) {
                console.log("Changes found in git repo");
            }
            else {
                console.log("No changes found in git repo");
            }
            return foundChanges;
        });
    }
    commitAll(message) {
        return __awaiter(this, void 0, void 0, function* () {
            logging.header("Commiting Changes");
            yield bash.execute(`
            git commit -am "${message}"
        `);
        });
    }
    push() {
        return __awaiter(this, void 0, void 0, function* () {
            logging.header("Pushing branch");
            yield bash.execute(`
            git push origin
        `);
        });
    }
}
exports.Git = Git;
//# sourceMappingURL=git.js.map