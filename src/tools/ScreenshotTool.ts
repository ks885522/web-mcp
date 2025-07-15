import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";
import { PageNotFoundError } from "../core/Errors.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page to take a screenshot of."),
  full_page: z.boolean().optional().describe("Whether to take a screenshot of the full scrollable page."),
});

export class ScreenshotTool extends MCPTool<typeof schema> {
  readonly name = "screenshot";
  readonly description = "Takes a screenshot of the specified page and returns it as a Base64 encoded string.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ image_base64: string }> {
    try {
      const page = BrowserManager.getInstance().getPage(input.page_id);
      if (!page) {
        throw new PageNotFoundError(input.page_id);
      }

      const imageBuffer = await page.screenshot({
        encoding: 'base64',
        fullPage: input.full_page ?? false,
      });

      logger.info(`[${input.page_id}] Screenshot taken.`);
      return { image_base64: imageBuffer };
    } catch (error: any) {
      logger.error(`[${input.page_id}] Failed to take screenshot. Error: ${error.message}`);
      throw error;
    }
  }
} 