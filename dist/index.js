import { MCPServer } from "mcp-framework";
import { OpenPageTool } from "./tools/OpenPageTool.js";
import { ClosePageTool } from "./tools/ClosePageTool.js";
import { TypeTextTool } from "./tools/TypeTextTool.js";
import { ClickElementTool } from "./tools/ClickElementTool.js";
import { WaitForNavigationTool } from "./tools/WaitForNavigationTool.js";
import { ReadTextTool } from "./tools/ReadTextTool.js";
import { ListElementsTool } from "./tools/ListElementsTool.js";
import { ScreenshotTool } from "./tools/ScreenshotTool.js";
const server = new MCPServer({
    tools: [
        new OpenPageTool(),
        new ClosePageTool(),
        new TypeTextTool(),
        new ClickElementTool(),
        new WaitForNavigationTool(),
        new ReadTextTool(),
        new ListElementsTool(),
        new ScreenshotTool(),
    ],
});
server.start().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
