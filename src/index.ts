import { MCPServer, MCPServerConfig } from "mcp-framework";
import { OpenPageTool } from "./tools/OpenPageTool.js";

const server = new MCPServer({
  tools: [new OpenPageTool()],
} as MCPServerConfig);

server.start().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
}); 