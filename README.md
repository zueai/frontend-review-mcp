# frontend-reviewer-mcp

An MCP server that performs a visual review of a UI edit request. Ask your agent to screenshot the page before and after the edit, and then call this tool to review the edit.

## Usage

### Cursor

- To install in a project, add the MCP server to your `.cursor/mcp.json`:

```json
{
	"mcpServers": {
		"frontend-reviewer": {
			"command": "npx",
			"args": ["frontend-reviewer-mcp"],
			"env": {
				"HYPERBOLIC_API_KEY": ""
			}
		}
	}
}
```

- To install globally, add this command to your Cursor settings:

```bash
HYPERBOLIC_API_KEY=<your-hyperbolic-api-key> npx frontend-reviewer-mcp
```

### Windsurf

- Add the MCP server to your `~/.codeium/windsurf/mcp_config.json` file:

```json
{
	"mcpServers": {
		"frontend-reviewer": {
			"command": "npx",
			"args": ["frontend-reviewer-mcp"],
			"env": {
				"HYPERBOLIC_API_KEY": ""
			}
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

## Taking Screenshots

You can use any MCP server to take screenshots. I've been using [https://github.com/AgentDeskAI/browser-tools-mcp](https://github.com/AgentDeskAI/browser-tools-mcp) which has a `takeScreenshot` tool, among other useful tools for frontend development.
