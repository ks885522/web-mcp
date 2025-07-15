import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";
import { PageNotFoundError, PuppeteerError } from "../core/Errors.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page where the element exists."),
  selector: z.string().describe("The CSS selector of the element to read text from."),
});

export class ReadTextTool extends MCPTool<typeof schema> {
  readonly name = "read_text";
  readonly description = "Reads the text content of a specified element on a page.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ text: string | null }> {
    try {
      const page = BrowserManager.getInstance().getPage(input.page_id);
      if (!page) {
        throw new PageNotFoundError(input.page_id);
      }

      const element = await page.waitForSelector(input.selector, { timeout: 5000 });
      if (!element) {
        throw new PuppeteerError(`Element with selector "${input.selector}" not found.`);
      }
      
      const text = await element.evaluate(el => el.textContent);

      logger.info(`[${input.page_id}] Read text from selector "${input.selector}".`);
      return { text };
    } catch (error: any) {
      if (error.name?.includes('TimeoutError')) {
          throw new PuppeteerError(`Timeout waiting for selector "${input.selector}" to read text.`);
      }
      logger.error(`[${input.page_id}] Failed to read text from selector "${input.selector}". Error: ${error.message}`);
      throw error;
    }
  }
} 