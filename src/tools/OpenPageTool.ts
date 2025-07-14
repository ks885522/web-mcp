import { MCPTool } from "mcp-framework";
import puppeteer from "puppeteer";
import { z } from "zod";

const schema = z.object({
  url: z.string().url().describe("The URL to open."),
});

export class OpenPageTool extends MCPTool<typeof schema> {
  readonly name = "open_page";
  readonly description = "Opens a new browser page to the specified URL.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<string> {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto(input.url);

      // We don't close the browser here to allow the user to see the page.
      // In a real scenario, we would need a strategy to manage browser instances.

      return `Successfully opened ${input.url}`;
    } catch (error: any) {
      console.error(error);
      return `Failed to open ${input.url}. Error: ${error.message}`;
    }
  }
} 