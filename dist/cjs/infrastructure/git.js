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
exports.Git = void 0;
var bash = require("./bash");
var logging = require("./logging");
var fs = require("node:fs");
var path = require("node:path");
var Git = (function () {
    function Git(ghToken) {
        this.configured = this.configure(ghToken);
    }
    Git.prototype.configure = function (ghToken) {
        return __awaiter(this, void 0, void 0, function () {
            var workingDir, gitDirectory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, (bash.execute("\n            pwd\n        "))];
                    case 1:
                        workingDir = _a.sent();
                        gitDirectory = this.findGitDirectory(workingDir);
                        console.log("Configuring git");
                        return [4, bash.execute("\n            git config --global --add safe.directory ".concat(gitDirectory, "\n            git config --global user.email \"mirukenjs@gmail.com\"\n            git config --global user.name \"buildpipeline\"\n            git config --global url.\"https://api:").concat(ghToken, "@github.com/\".insteadOf \"https://github.com/\"\n            git config --global url.\"https://ssh:").concat(ghToken, "@github.com/\".insteadOf \"ssh://git@github.com/\"\n            git config --global url.\"https://git:").concat(ghToken, "@github.com/\".insteadOf \"git@github.com:\"\n        "))];
                    case 2:
                        _a.sent();
                        console.log("Configured git");
                        return [2];
                }
            });
        });
    };
    Git.prototype.tagAndPush = function (tag) {
        return __awaiter(this, void 0, void 0, function () {
            var existingTag;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.configured];
                    case 1:
                        _a.sent();
                        logging.header("Tagging the commit");
                        return [4, bash.execute("\n            git tag -l ".concat(tag, "\n        "))];
                    case 2:
                        existingTag = _a.sent();
                        console.log("existingTag: [".concat(existingTag, "]"));
                        console.log("tag: [".concat(tag, "]"));
                        if (!(existingTag === tag)) return [3, 3];
                        console.log("Tag already created");
                        return [3, 5];
                    case 3:
                        console.log("Tagging the release");
                        return [4, bash.execute("\n                git tag -a ".concat(tag, " -m \"Tagged by build pipeline\"\n                git push origin ").concat(tag, "\n            "))];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2];
                }
            });
        });
    };
    Git.prototype.anyChanges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status, foundChanges;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.configured];
                    case 1:
                        _a.sent();
                        return [4, bash.execute("\n            git status\n        ")];
                    case 2:
                        status = _a.sent();
                        foundChanges = status.includes('Changes not staged for commit');
                        if (foundChanges) {
                            console.log("Changes found in git repo");
                        }
                        else {
                            console.log("No changes found in git repo");
                        }
                        return [2, foundChanges];
                }
            });
        });
    };
    Git.prototype.commitAll = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.configured];
                    case 1:
                        _a.sent();
                        logging.header("Commiting Changes");
                        return [4, bash.execute("\n            git commit -am \"".concat(message, "\"\n        "))];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Git.prototype.addAndCommit = function (selector, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.configured];
                    case 1:
                        _a.sent();
                        logging.header("Committing [".concat(selector, "] Changes"));
                        return [4, bash.execute("\n            git add ".concat(selector, "\n            git commit -m \"").concat(message, "\"\n        "))];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Git.prototype.push = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.configured];
                    case 1:
                        _a.sent();
                        logging.header("Pushing branch");
                        return [4, bash.execute("\n            git push origin\n        ")];
                    case 2:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Git.prototype.findGitDirectory = function (dir) {
        if (!dir) {
            throw new Error("No .github folder found");
        }
        if (!fs.existsSync(dir)) {
            throw new Error("Directory ".concat(dir, " does not exist"));
        }
        if (fs.existsSync(path.join(dir, '.github'))) {
            return dir;
        }
        else {
            var split = dir.split(path.sep);
            split.pop();
            var parent_1 = split.join(path.sep);
            return this.findGitDirectory(parent_1);
        }
    };
    return Git;
}());
exports.Git = Git;
//# sourceMappingURL=git.js.map