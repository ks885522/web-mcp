export class PageNotFoundError extends Error {
  constructor(pageId: string) {
    super(`Page with id "${pageId}" does not exist or has been closed.`);
    this.name = 'PageNotFoundError';
  }
}

export class PuppeteerError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PuppeteerError';
    }
} 