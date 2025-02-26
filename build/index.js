import { promises as fs } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { reviewScreenshots } from "./review-screenshot.js";
// Create server instance
const server = new McpServer({
    name: "review-screenshots",
    version: "1.0.0"
});
// Register screenshot review tool
server.tool("reviewEdit", "Review screenshot changes for a UI edit request", {
    beforeScreenshotPath: z
        .string()
        .describe("Path to the 'before' screenshot file"),
    afterScreenshotPath: z
        .string()
        .describe("Path to the 'after' screenshot file"),
    editRequest: z
        .string()
        .describe("Description of the UI edit request that was made")
}, async ({ beforeScreenshotPath, afterScreenshotPath, editRequest }) => {
    try {
        // Read image files from disk
        const beforeScreenshot = await fs.readFile(beforeScreenshotPath, {
            encoding: "base64"
        });
        const afterScreenshot = await fs.readFile(afterScreenshotPath, {
            encoding: "base64"
        });
        // Call the review function
        const reviewResult = await reviewScreenshots(beforeScreenshot, afterScreenshot, editRequest);
        return {
            content: [
                {
                    type: "text",
                    text: reviewResult
                }
            ]
        };
    }
    catch (error) {
        console.error("Error processing screenshots:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: "text",
                    text: `Error processing screenshots: ${errorMessage}`
                }
            ]
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
