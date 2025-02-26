# frontend-review-mcp

An MCP server that performs a visual review of a UI edit request. Ask your agent to screenshot the page before and after the edit, and then call this tool to review the edit.

## Usage

### Cursor

- To install in a project, add the MCP server to your `.cursor/mcp.json`:

```json
{
	"mcpServers": {
		"frontend-review": {
			"command": "npx",
			"args": ["frontend-review-mcp HYPERBOLIC_API_KEY=<YOUR_API_KEY>"],

		}
	}
}
```

- To install globally, add this command to your Cursor settings:

```bash
npx frontend-review-mcp HYPERBOLIC_API_KEY=<your-hyperbolic-api-key>
```

### Windsurf

- Add the MCP server to your `~/.codeium/windsurf/mcp_config.json` file:

```json
{
	"mcpServers": {
		"frontend-review": {
			"command": "npx",
			"args": ["frontend-review-mcp HYPERBOLIC_API_KEY=<YOUR_API_KEY>"]
		}
	}
}
```

## Tools

Currently, the only tool is `reviewEdit`.

Your Agent will call this tool with the following arguments:

- `beforeScreenshotPath`: The absolute path to the screenshot of the page before the edit.
- `afterScreenshotPath`: The absolute path to the screenshot of the page after the edit.
- `editRequest`: A detailed description of the UI edit request made by the user.

The tool will return a response with either a `yes` or `no` response, indicating whether the edit visually satisfies the edit request. If no, it will provide a detailed explanation of why the edit does not satisfy the request so you can continue to work on it.

## Review Model

Currently, the review model is `Qwen/Qwen2-VL-72B-Instruct` from Hyperbolic. It will automatically retry the request with these models if it fails:

Fallback order:

1. `Qwen/Qwen2-VL-72B-Instruct`
2. `Qwen/Qwen2-VL-7B-Instruct`
3. `meta-llama/Llama-3.2-90B-Vision-Instruct`
4. `mistralai/Pixtral-12B-2409`

If you want to use a different model as the first model, you can add the `MODEL` arg to the command:

```bash
npx frontend-review-mcp HYPERBOLIC_API_KEY=<your-hyperbolic-api-key> MODEL=<your-model>
```

It will try the specified model first, and then try the others if it fails.

## Taking Screenshots

You can use any MCP server to take screenshots. I've been using [https://github.com/AgentDeskAI/browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) which has a `takeScreenshot` tool, among other useful tools for frontend development.

## AI Instructions

You can include the following instructions in your AI's prompt to make it take screenshots and review the edit:

```md
When making frontend edits:

- Before making any changes, call the mcp_takeScreenshot function to save the current state of the page.
- After making your change, call the mcp_takeScreenshot function again to save the new state of the page.
- Screenshots will be saved to /screenshots folder.
- Run this command to get the absolute paths of the 2 most recent screenshots in the /screenshots folder:



find screenshots -type f -name "*.png" -exec stat -f "%m %N" {} \; | sort -nr | head -n 2 | awk '{print $2}' | xargs realpath | awk 'NR==1 {print "before path: ", $0} NR==2 {print "after path: ", $0}'


- Call the mcp_reviewEdit function to have your changes visually reviewed.
- Use the following format for the tool call:

{
  "beforeScreenshotPath": string, // Absolute path to the second-most recent screenshot
  "afterScreenshotPath": string, // Absolute path to the most recent screenshot
  "editRequest": string // Describe the edit request from the user in a couple of sentences
}

- You should summarize my edit request into a couple of sentences so that the frontend reviewer understands the changes you made.

- The tool will either return "yes" if your changes are good, or "no" with a brief explanation if the changes don't satisfy the edit request. Keep editing with the same process until the reviewer returns "yes".

```

## Tips

Make sure YOLO mode is on and MCP tools protection is off in your Cursor settings for the best experience.
