import { MCPTool, logger } from "mcp-framework";
import { z } from "zod";
import { BrowserManager } from "../core/BrowserManager.js";

const schema = z.object({
  page_id: z.string().uuid().describe("The ID of the page where the element exists."),
  frame_id: z.string().uuid().optional().describe("The ID of the frame where the element exists."),
  selector: z.string().describe("The CSS selector of the element."),
  function_string: z.string().describe("A string representation of a function to execute on the element. Ex: '(el) => el.textContent'"),
});

export class EvaluateOnElementTool extends MCPTool<typeof schema> {
  readonly name = "evaluate_on_element";
  readonly description = "Executes a JavaScript function on a specified element and returns the result.";
  readonly schema = schema;

  async execute(input: z.infer<typeof schema>): Promise<{ result?: any, status?: string, error_type?: string, message?: string }> {
    try {
      const context = await BrowserManager.getInstance().getContext(input.page_id, input.frame_id);

      const element = await BrowserManager.getInstance().findElement(context, input.selector);
      if (!element) {
        const error = { status: 'error', error_type: 'SELECTOR_NOT_FOUND', message: `Element with selector "${input.selector}" not found.` };
        logger.error(error.message);
        return error;
      }

      // UNSAFE: This is a security risk if the function_string is not trusted.
      // In a real application, this should be sanitized or come from a trusted source.
      const func = new Function(`return ${input.function_string}`)();
      const result = await element.evaluate(func, element);

      logger.info(`[${input.page_id}] Executed function on selector "${input.selector}".`);
      return { result };
    } catch (error: any) {
      const errResponse = { status: 'error', error_type: 'EXECUTION_FAILED', message: `Failed to execute function on selector "${input.selector}". Error: ${error.message}` };
      logger.error(errResponse.message);
      return errResponse;
    }
  }
} 