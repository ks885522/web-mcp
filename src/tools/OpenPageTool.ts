import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";

const schema = z.object({
  url: z.string().url().describe("The URL to open."),
});

export class OpenPageTool extends MCPTool<typeof schema> {
  readonly name = "open_page";
  readonly description = "Opens a new browser page to the specified URL and returns a page ID.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ page_id: string }> {
    try {
      const pageId = await BrowserManager.getInstance().createPage(input.url);
      return { page_id: pageId };
    } catch (error: any) {
      logger.error(`Failed to open page at ${input.url}. Error: ${error.message}`);
      // Re-throwing the error to be handled by the MCP server,
      // which will then send a structured error back to the AI agent.
      throw error;
    }
  }
} 