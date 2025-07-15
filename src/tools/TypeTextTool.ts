import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";
import { PageNotFoundError, PuppeteerError } from "../core/Errors.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page where the element exists."),
  selector: z.string().describe("The CSS selector of the element to type into."),
  text: z.string().describe("The text to type into the element."),
});

export class TypeTextTool extends MCPTool<typeof schema> {
  readonly name = "type_text";
  readonly description = "Types text into a specified element on a page.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ status: string }> {
    try {
      const page = BrowserManager.getInstance().getPage(input.page_id);
      if (!page) {
        throw new PageNotFoundError(input.page_id);
      }

      await page.locator(input.selector).fill(input.text);

      logger.info(`[${input.page_id}] Typed text into selector "${input.selector}".`);
      return { status: "success" };
    } catch (error: any) {
      // Catch specific puppeteer errors if needed and wrap them
      if (error.name?.includes('TimeoutError')) {
          throw new PuppeteerError(`Timeout waiting for selector "${input.selector}"`);
      }
      logger.error(`[${input.page_id}] Failed to type into selector "${input.selector}". Error: ${error.message}`);
      throw error;
    }
  }
} 