import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page where the iframe exists."),
  iframe_selector: z.string().describe("The CSS selector of the iframe element."),
});

export class SwitchToFrameTool extends MCPTool<typeof schema> {
  readonly name = "switch_to_frame";
  readonly description = "Switches the execution context to a specified iframe and returns a frame ID.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ frame_id?: string, status?: string, error_type?: string, message?: string }> {
    const page = BrowserManager.getInstance().getPage(input.page_id);
    if (!page) {
        const error = { status: 'error', error_type: 'PAGE_NOT_FOUND', message: `Page with id "${input.page_id}" does not exist.` };
        logger.error(error.message);
        return error;
    }

    try {
      const iframeElement = await BrowserManager.getInstance().findElement(page, input.iframe_selector);
      if (!iframeElement) {
        const error = { status: 'error', error_type: 'SELECTOR_NOT_FOUND', message: `Iframe with selector "${input.iframe_selector}" not found.` };
        logger.error(error.message);
        return error;
      }

      const frame = await iframeElement.contentFrame();
      if (!frame) {
        const error = { status: 'error', error_type: 'FRAME_NOT_FOUND', message: `Could not get content frame for iframe with selector "${input.iframe_selector}".` };
        logger.error(error.message);
        return error;
      }
      
      const frameId = BrowserManager.getInstance().registerFrame(frame);

      logger.info(`[${input.page_id}] Switched to frame ${frameId} for selector "${input.iframe_selector}".`);
      return { frame_id: frameId };
    } catch (error: any) {
      const errResponse = { status: 'error', error_type: 'UNEXPECTED_ERROR', message: `Failed to switch to frame. Error: ${error.message}` };
      logger.error(errResponse.message);
      return errResponse;
    }
  }
} 