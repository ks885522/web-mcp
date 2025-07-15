import puppeteer, { Browser, Page, LaunchOptions } from "puppeteer";
import { randomUUID } from "node:crypto";
import "dotenv/config";
import { logger } from "mcp-framework";

export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();

  private constructor() {}

  public static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    const launchOptions: LaunchOptions = {
      headless: false,
    };

    const executablePath = process.env.CHROME_EXECUTABLE_PATH;
    const userDataDir = process.env.CHROME_USER_DATA_DIR;

    if (executablePath && userDataDir) {
      logger.info("BrowserManager: Using local Chrome instance.");
      launchOptions.executablePath = executablePath;
      launchOptions.userDataDir = userDataDir;
    } else {
      logger.info("BrowserManager: Using new browser instance.");
    }
    
    this.browser = await puppeteer.launch(launchOptions);
    
    this.browser.on('disconnected', () => {
      logger.warn("BrowserManager: Browser disconnected.");
      this.browser = null;
      this.pages.clear();
    });

    return this.browser;
  }

  public async createPage(url: string): Promise<string> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    const pageId = randomUUID();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      this.pages.set(pageId, page);
      logger.info(`[${pageId}] Page created and navigated to ${url}`);
      return pageId;
    } catch (error: any) {
        logger.error(`[${pageId}] Failed to navigate to ${url}. Error: ${error.message}`);
        // If navigation fails, we should close the blank page to prevent orphans.
        await page.close();
        throw error;
    }
  }

  public getPage(pageId: string): Page | undefined {
    return this.pages.get(pageId);
  }

  public async closePage(pageId: string): Promise<void> {
    const page = this.pages.get(pageId);
    if (page) {
      await page.close();
      this.pages.delete(pageId);
      logger.info(`[${pageId}] Page closed.`);
    }

    if (this.pages.size === 0 && this.browser) {
        logger.info("BrowserManager: All pages closed, closing browser.");
        await this.browser.close();
        this.browser = null;
    }
  }

  public async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.pages.clear();
      logger.info("BrowserManager: Browser explicitly closed.");
    }
  }
} 