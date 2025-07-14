import { MCPTool, defineSchema } from "mcp-framework";
const schema = defineSchema({}); // No parameters
class HelloWorldTool extends MCPTool {
    name = "helloWorld";
    description = "Returns Hello world";
    schema = schema;
    async execute() {
        return { message: "Hello world" };
    }
}
export default HelloWorldTool;
