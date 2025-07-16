import puppeteer, { Browser, Page, LaunchOptions } from "puppeteer";
import { randomUUID } from "node:crypto";
import "dotenv/config";
import { logger } from "mcp-framework";
import { ElementHandle, Frame } from "puppeteer";

export class BrowserManager {
  private static instance: BrowserManager;
  private browser: Browser | null = null;
  private pages: Map<string, Page> = new Map();
  private frames: Map<string, Frame> = new Map();

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
      this.frames.clear();
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
      this.frames.clear();
      logger.info("BrowserManager: Browser explicitly closed.");
    }
  }

  public async getContext(pageId: string, frameId?: string): Promise<Page | Frame> {
    if (frameId) {
      const frame = this.getFrame(frameId);
      if (frame) return frame;
      throw new Error(`Frame with id "${frameId}" not found.`);
    }
    const page = this.getPage(pageId);
    if (page) return page;
    throw new Error(`Page with id "${pageId}" not found.`);
  }

  public async findElement(context: Page | Frame, selector: string): Promise<ElementHandle<Element> | null> {
    logger.debug(`Finding element for selector: ${selector}`);
    const parts = selector.split('>>>').map(s => s.trim());
    
    let opContext: Page | Frame | ElementHandle = context;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const elementHandle: ElementHandle<Element> | null = await opContext.waitForSelector(part, { timeout: 5000 });
        if (!elementHandle) return null;
        const shadowRoot: puppeteer.JSHandle | null = await elementHandle.evaluateHandle((el: Element) => el.shadowRoot);
        if (!shadowRoot) return null;
        opContext = shadowRoot as ElementHandle;
    }
    
    return opContext.waitForSelector(parts[parts.length - 1], { timeout: 5000 });
  }

  public async findElements(context: Page | Frame, selector: string): Promise<ElementHandle<Element>[]> {
    logger.debug(`Finding elements for selector: ${selector}`);
    const parts = selector.split('>>>').map(s => s.trim());
    
    let opContext: Page | Frame | ElementHandle = context;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        const elementHandle: ElementHandle<Element> | null = await opContext.waitForSelector(part, { timeout: 5000 });
        if (!elementHandle) return [];
        const shadowRoot: puppeteer.JSHandle | null = await elementHandle.evaluateHandle((el: Element) => el.shadowRoot);
        if (!shadowRoot) return [];
        opContext = shadowRoot as ElementHandle;
    }
    
    return opContext.$$(parts[parts.length - 1]);
  }

  public getFrame(frameId: string): Frame | undefined {
    return this.frames.get(frameId);
  }

  public registerFrame(frame: Frame): string {
    const frameId = randomUUID();
    this.frames.set(frameId, frame);
    logger.info(`[${frameId}] Frame registered.`);
    return frameId;
  }
} 