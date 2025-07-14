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
const mcp_framework_1 = require("mcp-framework");
const schema = (0, mcp_framework_1.defineSchema)({}); // No parameters
class HelloWorldTool extends mcp_framework_1.MCPTool {
    constructor() {
        super(...arguments);
        this.name = "helloWorld";
        this.description = "Returns Hello world";
        this.schema = schema;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            return { message: "Hello world" };
        });
    }
}
exports.default = HelloWorldTool;
