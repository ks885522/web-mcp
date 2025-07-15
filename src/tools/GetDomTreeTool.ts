import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page to get the DOM tree from."),
  frame_id: z.string().uuid().optional().describe("The ID of the frame to get the DOM tree from."),
});

// This type could be more elaborate, but string is sufficient for now.
type DomTree = string; 

export class GetDomTreeTool extends MCPTool<typeof schema> {
  readonly name = "get_dom_tree";
  readonly description = "Retrieves the DOM tree of a page, including Shadow DOM, as a string.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ dom_tree?: DomTree, status?: string, error_type?: string, message?: string }> {
    try {
      const context = await BrowserManager.getInstance().getContext(input.page_id, input.frame_id);

      const domTree = await context.evaluate(() => {
        const getElementRepresentation = (el: Element, depth: number): string => {
          const indent = '  '.repeat(depth);
          const tagName = el.tagName.toLowerCase();
          const attributes = Array.from(el.attributes)
            .map(attr => `${attr.name}="${attr.value}"`)
            .join(' ');
          
          let representation = `${indent}<${tagName}${attributes ? ' ' + attributes : ''}>`;

          if (el.shadowRoot) {
            representation += `\n${indent}  #shadow-root`;
            for (const child of Array.from(el.shadowRoot.children)) {
              representation += `\n${getElementRepresentation(child, depth + 2)}`;
            }
          } else {
            for (const child of Array.from(el.children)) {
                representation += `\n${getElementRepresentation(child, depth + 1)}`;
            }
          }

          return representation;
        }
        return getElementRepresentation(document.documentElement, 0);
      });

      logger.info(`[${input.page_id}] DOM tree retrieved.`);
      return { dom_tree: domTree };
    } catch (error: any) {
      let error_type = 'UNEXPECTED_ERROR';
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                error_type = 'PAGE_NOT_FOUND'
            }
        }
      const errResponse = { status: 'error', error_type, message: `Failed to get DOM tree. Error: ${error.message}` };
      logger.error(errResponse.message);
      return errResponse;
    }
  }
} 