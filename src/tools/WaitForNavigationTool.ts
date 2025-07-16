import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page to wait for navigation on."),
  frame_id: z.string().uuid().optional().describe("The ID of the frame to wait for navigation on."),
});

export class WaitForNavigationTool extends MCPTool<typeof schema> {
  readonly name = "wait_for_navigation";
  readonly description = "Waits for a page to complete navigation after an action that triggers it.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ status: string, error_type?: string, message?: string }> {
    try {
      const context = await BrowserManager.getInstance().getContext(input.page_id, input.frame_id);
      
      await context.waitForNavigation({ waitUntil: 'domcontentloaded' });

      logger.info(`[${input.page_id}] Navigation completed.`);
      return { status: "success" };
    } catch (error: any) {
      let error_type = 'UNEXPECTED_ERROR';
      if (error instanceof Error) {
        if (error.name?.includes('TimeoutError')) {
          error_type = 'TIMEOUT_ERROR';
        } else if (error.message.includes('not found')) {
            error_type = 'PAGE_NOT_FOUND'
        }
      }
      const errResponse = { status: 'error', error_type, message: `Failed to wait for navigation. Error: ${error.message}` };
      logger.error(errResponse.message);
      return errResponse;
    }
  }
} 