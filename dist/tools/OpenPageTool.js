import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";
const schema = z.object({
    url: z.string().url().describe("The URL to open."),
});
export class OpenPageTool extends MCPTool {
    name = "open_page";
    description = "Opens a new browser page to the specified URL and returns a page ID.";
    schema = schema;
    async execute(input) {
        try {
            const pageId = await BrowserManager.getInstance().createPage(input.url);
            return { page_id: pageId };
        }
        catch (error) {
            logger.error(`Failed to open page at ${input.url}. Error: ${error.message}`);
            // Re-throwing the error to be handled by the MCP server,
            // which will then send a structured error back to the AI agent.
            throw error;
        }
    }
}
