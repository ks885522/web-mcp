import { MCPTool, logger } from "mcp-framework";
import puppeteer, { type LaunchOptions } from "puppeteer";
import { z } from "zod";
import "dotenv/config";

const schema = z.object({
  url: z.string().url().describe("The URL to open."),
});

export class OpenPageTool extends MCPTool<typeof schema> {
  readonly name = "open_page";
  readonly description = "Opens a new browser page to the specified URL. It can use a local Chrome instance if environment variables are set.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<string> {
    try {
      const launchOptions: LaunchOptions = {
        headless: false,
      };

      const executablePath = process.env.CHROME_EXECUTABLE_PATH;
      const userDataDir = process.env.CHROME_USER_DATA_DIR;

      if (executablePath && userDataDir) {
        logger.info("Using local Chrome instance.");
        launchOptions.executablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
        launchOptions.userDataDir = "C:/Users/Jack/AppData/Local/Google/Chrome/User Data";
      } else {
        logger.info("Using new browser instance.");
      }
      const browser = await puppeteer.launch(launchOptions);
      const page = await browser.newPage();
      await page.goto(input.url);

      // We don't close the browser here to allow the user to see the page.
      // In a real scenario, we would need a strategy to manage browser instances.

      return `Successfully opened ${input.url}`;
    } catch (error: any) {
      logger.error(`Failed to open ${input.url}. Error: ${error.message}`);
      return `Failed to open ${input.url}. Error: ${error.message}`;
    }
  }
} 