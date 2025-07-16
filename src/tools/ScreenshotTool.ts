import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page to take a screenshot of."),
  frame_id: z.string().uuid().optional().describe("The ID of the frame to take a screenshot of."),
  full_page: z.boolean().optional().describe("Whether to take a screenshot of the full scrollable page."),
});

export class ScreenshotTool extends MCPTool<typeof schema> {
  readonly name = "screenshot";
  readonly description = "Takes a screenshot of the specified page and returns it as a Base64 encoded string.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ image_base64?: string, status?: string, error_type?: string, message?: string }> {
    if (input.frame_id) {
        const error = { status: 'error', error_type: 'UNSUPPORTED_OPERATION', message: 'Screenshot cannot be taken on an iframe, only on a full page.' };
        logger.error(error.message);
        return error;
    }

    const page = BrowserManager.getInstance().getPage(input.page_id);
    if (!page) {
        const errResponse = { status: 'error', error_type: 'PAGE_NOT_FOUND', message: `Page with ID ${input.page_id} not found.` };
        logger.error(errResponse.message);
        return errResponse;
    }

    try {
        const imageBuffer = await page.screenshot({
            encoding: 'base64',
            fullPage: input.full_page ?? false,
        });

        logger.info(`[${input.page_id}] Screenshot taken.`);
        return { image_base64: imageBuffer };
    } catch (error: any) {
        let error_type = 'UNEXPECTED_ERROR';
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                error_type = 'PAGE_NOT_FOUND'
            }
        }
        const errResponse = { status: 'error', error_type, message: `Failed to take screenshot. Error: ${error.message}` };
        logger.error(errResponse.message);
        return errResponse;
    }
  }
} 