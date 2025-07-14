import { MCPTool } from "mcp-framework";
import puppeteer from "puppeteer";
import { z } from "zod";
const schema = z.object({
    url: z.string().url().describe("The URL to open."),
});
export class OpenPageTool extends MCPTool {
    name = "open_page";
    description = "Opens a new browser page to the specified URL.";
    schema = schema;
    async execute(input) {
        try {
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();
            await page.goto(input.url);
            // We don't close the browser here to allow the user to see the page.
            // In a real scenario, we would need a strategy to manage browser instances.
            return `Successfully opened ${input.url}`;
        }
        catch (error) {
            console.error(error);
            return `Failed to open ${input.url}. Error: ${error.message}`;
        }
    }
}
