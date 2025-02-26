import { promises as fs } from "node:fs"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"
import { reviewScreenshots } from "./review-screenshot.js"

// Create server instance
const server = new McpServer({
	name: "review-screenshots",
	version: "1.0.0"
})

// Register screenshot review tool
server.tool(
	"reviewEdit",
	"Perform a visual review of a UI edit request. The 'before screenshot' is a screenshot of the page before the edit, and the 'after screenshot' is the screenshot of the page after the edit. You will recieve either a yes or no response, indicating whether the edit visually satisfies the edit request. If no, it will provide a detailed explanation of why the edit does not satisfy the request so you can continue to work on it.",
	{
		beforeScreenshotPath: z
			.string()
			.describe("Absolute path to the 'before' screenshot file (png)"),
		afterScreenshotPath: z
			.string()
			.describe("Absolute path to the 'after' screenshot file (png)"),
		editRequest: z
			.string()
			.describe(
				"A detailed description of the UI edit request made by the user. Do not describe the changes you made, but just summarize what the user asked you to change on the page."
			)
	},
	async ({ beforeScreenshotPath, afterScreenshotPath, editRequest }) => {
		try {
			// Read image files from disk
			const beforeScreenshot = await fs.readFile(beforeScreenshotPath, {
				encoding: "base64"
			})
			const afterScreenshot = await fs.readFile(afterScreenshotPath, {
				encoding: "base64"
			})

			// Call the review function
			const reviewResult = await reviewScreenshots(
				beforeScreenshot,
				afterScreenshot,
				editRequest
			)

			return {
				content: [
					{
						type: "text",
						text: reviewResult
					}
				]
			}
		} catch (error: unknown) {
			console.error("Error processing screenshots:", error)
			const errorMessage =
				error instanceof Error ? error.message : String(error)
			return {
				content: [
					{
						type: "text",
						text: `Error processing screenshots: ${errorMessage}`
					}
				]
			}
		}
	}
)

async function main() {
	const transport = new StdioServerTransport()
	await server.connect(transport)
}

main().catch((error) => {
	console.error("Fatal error in main():", error)
	process.exit(1)
})
