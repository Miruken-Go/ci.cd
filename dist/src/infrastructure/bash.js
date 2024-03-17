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
exports.json = exports.execute = void 0;
const node_util_1 = require("node:util");
const child_process = __importStar(require("node:child_process"));
const exec = (0, node_util_1.promisify)(child_process.exec);
function execute(cmd_1) {
    return __awaiter(this, arguments, void 0, function* (cmd, suppressLog = false) {
        const { stdout, stderr } = yield exec(cmd);
        if (!suppressLog) {
            console.log('bash stdout:', stdout);
            if (stderr) {
                console.log('bash stderr:', stderr);
            }
        }
        return stdout.trim();
    });
}
exports.execute = execute;
function json(cmd_1) {
    return __awaiter(this, arguments, void 0, function* (cmd, suppressLog = false) {
        const response = yield execute(cmd, suppressLog);
        return JSON.parse(response);
    });
}
exports.json = json;
//# sourceMappingURL=bash.js.map