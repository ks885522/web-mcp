import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";
import { PageNotFoundError, PuppeteerError } from "../core/Errors.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page to wait for navigation on."),
});

export class WaitForNavigationTool extends MCPTool<typeof schema> {
  readonly name = "wait_for_navigation";
  readonly description = "Waits for a page to complete navigation after an action that triggers it.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ status: string }> {
    try {
      const page = BrowserManager.getInstance().getPage(input.page_id);
      if (!page) {
        throw new PageNotFoundError(input.page_id);
      }

      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

      logger.info(`[${input.page_id}] Navigation completed.`);
      return { status: "success" };
    } catch (error: any) {
      if (error.name?.includes('TimeoutError')) {
          throw new PuppeteerError(`Timeout waiting for navigation on page ${input.page_id}.`);
      }
      logger.error(`[${input.page_id}] Failed to wait for navigation. Error: ${error.message}`);
      throw error;
    }
  }
} 