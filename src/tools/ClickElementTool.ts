import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page where the element exists."),
  frame_id: z.string().uuid().optional().describe("The ID of the frame where the element exists."),
  selector: z.string().describe("The CSS selector of the element to click."),
});

export class ClickElementTool extends MCPTool<typeof schema> {
  readonly name = "click_element";
  readonly description = "Clicks a specified element on a page.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ status: string, error_type?: string, message?: string }> {
    try {
      const context = await BrowserManager.getInstance().getContext(input.page_id, input.frame_id);
      
      const element = await BrowserManager.getInstance().findElement(context, input.selector);
      if (!element) {
        const error = { status: 'error', error_type: 'SELECTOR_NOT_FOUND', message: `Element with selector "${input.selector}" not found.` };
        logger.error(error.message);
        return error;
      }

      await element.click();

      logger.info(`[${input.page_id}] Clicked element with selector "${input.selector}".`);
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
      const errResponse = { status: 'error', error_type, message: `Failed to click selector "${input.selector}". Error: ${error.message}` };
      logger.error(errResponse.message);
      return errResponse;
    }
  }
} 