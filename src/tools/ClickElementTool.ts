import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";
import { PageNotFoundError, PuppeteerError } from "../core/Errors.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page where the element exists."),
  selector: z.string().describe("The CSS selector of the element to click."),
});

export class ClickElementTool extends MCPTool<typeof schema> {
  readonly name = "click_element";
  readonly description = "Clicks a specified element on a page.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ status: string }> {
    try {
      const page = BrowserManager.getInstance().getPage(input.page_id);
      if (!page) {
        throw new PageNotFoundError(input.page_id);
      }

      await page.locator(input.selector).click();

      logger.info(`[${input.page_id}] Clicked element with selector "${input.selector}".`);
      return { status: "success" };
    } catch (error: any) {
      if (error.name?.includes('TimeoutError')) {
          throw new PuppeteerError(`Timeout waiting for selector "${input.selector}" to click.`);
      }
      logger.error(`[${input.page_id}] Failed to click selector "${input.selector}". Error: ${error.message}`);
      throw error;
    }
  }
} 