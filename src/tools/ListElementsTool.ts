import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";
import { PageNotFoundError, PuppeteerError } from "../core/Errors.js";
import { ElementHandle } from "puppeteer";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page to list elements from."),
  selector: z.string().describe("The CSS selector to query for elements."),
});

type ElementInfo = {
    // id: string; // We can't easily create a stable ID to reference later, so we'll omit this for now.
    text: string | null;
    attributes: Record<string, string>;
};

export class ListElementsTool extends MCPTool<typeof schema> {
  readonly name = "list_elements";
  readonly description = "Lists all elements matching a selector on a page, returning their text and attributes.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ elements: ElementInfo[] }> {
    try {
      const page = BrowserManager.getInstance().getPage(input.page_id);
      if (!page) {
        throw new PageNotFoundError(input.page_id);
      }

      // Wait for at least one element to appear
      await page.waitForSelector(input.selector, { timeout: 5000 });

      const elements = await page.$$(input.selector);
      
      const elementsInfo: ElementInfo[] = await Promise.all(
        elements.map(async (element: ElementHandle) => {
          const text = await element.evaluate(el => el.textContent);
          const attributes = await element.evaluate(el => {
            const attrs: Record<string, string> = {};
            for (const attr of el.attributes) {
              attrs[attr.name] = attr.value;
            }
            return attrs;
          });
          return { text, attributes };
        })
      );

      logger.info(`[${input.page_id}] Listed ${elementsInfo.length} elements for selector "${input.selector}".`);
      return { elements: elementsInfo };
    } catch (error: any) {
      if (error.name?.includes('TimeoutError')) {
          throw new PuppeteerError(`Timeout waiting for selector "${input.selector}" to list elements.`);
      }
      logger.error(`[${input.page_id}] Failed to list elements for selector "${input.selector}". Error: ${error.message}`);
      throw error;
    }
  }
} 