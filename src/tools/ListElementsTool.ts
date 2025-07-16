import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";
import { ElementHandle } from "puppeteer";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page to list elements from."),
  frame_id: z.string().uuid().optional().describe("The ID of the frame where the element exists."),
  selector: z.string().describe("The CSS selector to query for elements."),
});

type ElementInfo = {
    text: string | null;
    attributes: Record<string, string>;
};

export class ListElementsTool extends MCPTool<typeof schema> {
  readonly name = "list_elements";
  readonly description = "Lists all elements matching a selector on a page, returning their text and attributes.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ elements?: ElementInfo[], status?: string, error_type?: string, message?: string }> {
    try {
        const context = await BrowserManager.getInstance().getContext(input.page_id, input.frame_id);

        const elements = await BrowserManager.getInstance().findElements(context, input.selector);
        
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
        let error_type = 'UNEXPECTED_ERROR';
        if (error instanceof Error) {
            if (error.name?.includes('TimeoutError')) {
                error_type = 'TIMEOUT_ERROR';
            } else if (error.message.includes('not found')) {
                error_type = 'PAGE_NOT_FOUND'
            }
        }
        const errResponse = { status: 'error', error_type, message: `Failed to list elements for selector "${input.selector}". Error: ${error.message}` };
        logger.error(errResponse.message);
        return errResponse;
    }
  }
} 