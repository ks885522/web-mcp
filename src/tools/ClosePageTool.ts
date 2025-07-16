import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page to close."),
});

export class ClosePageTool extends MCPTool<typeof schema> {
  readonly name = "close_page";
  readonly description = "Closes a specific browser page.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ status: string }> {
    try {
      await BrowserManager.getInstance().closePage(input.page_id);
      return { status: "success" };
    } catch (error: any) {
      logger.error(`Failed to close page ${input.page_id}. Error: ${error.message}`);
      throw error;
    }
  }
} 