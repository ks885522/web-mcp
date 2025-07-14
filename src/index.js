"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_framework_1 = require("mcp-framework");
const server = new mcp_framework_1.MCPServer();
server.start().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
