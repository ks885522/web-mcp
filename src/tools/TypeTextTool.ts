import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page where the element exists."),
  frame_id: z.string().uuid().optional().describe("The ID of the frame where the element exists."),
  selector: z.string().describe("The CSS selector of the element to type into."),
  text: z.string().describe("The text to type into the element."),
});

export class TypeTextTool extends MCPTool<typeof schema> {
  readonly name = "type_text";
  readonly description = "Types text into a specified element on a page.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ status: string, error_type?: string, message?: string }> {
    try {
        const context = await BrowserManager.getInstance().getContext(input.page_id, input.frame_id);

        const element = await BrowserManager.getInstance().findElement(context, input.selector);
        if (!element) {
            const error = { status: 'error', error_type: 'SELECTOR_NOT_FOUND', message: `Element with selector "${input.selector}" not found.` };
            logger.error(`[${input.page_id}] ${error.message}`);
            return error;
        }

        await element.evaluate((el: any) => el.value = '');
        await element.type(input.text);

        logger.info(`[${input.page_id}] Typed text into selector "${input.selector}".`);
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
        const errResponse = { status: 'error', error_type, message: `Failed to type into selector "${input.selector}". Error: ${error.message}` };
        logger.error(`[${input.page_id}] ${errResponse.message}`);
        return errResponse;
    }
  }
} 