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

If you want to use a different model, you can add the `MODEL` arg to the command:

```bash
npx frontend-review-mcp HYPERBOLIC_API_KEY=<your-hyperbolic-api-key> MODEL=<your-model>
```

## Taking Screenshots

You can use any MCP server to take screenshots. I've been using [https://github.com/AgentDeskAI/browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) which has a `takeScreenshot` tool, among other useful tools for frontend development.
