# Client Smoke Tests

Use this checklist after installing Master of SEO in any MCP-compatible AI agent.

## Basic Smoke Test

1. Install the package:

```bash
npm install -g master-of-seo
```

2. Test the CLI:

```bash
seo-master "/seo-master help"
```

3. Add the MCP server:

```bash
npx -y master-of-seo mcp
```

4. Restart the target agent client.

5. Ask:

```text
Use Master of SEO to show available commands.
```

Expected:

- The client detects the MCP server.
- `seo_master_commands` is visible.
- `seo_master_run` is visible.
- `/seo-master help` works through the agent.
- SEO skills do not auto-run unless explicitly triggered.

## Client Checklist

| Client | Config added | MCP server detected | Tools visible | `seo_master_run` works | Direct audit tool works | Issues found | Notes |
|---|---|---|---|---|---|---|---|
| Codex | yes/no | yes/no | yes/no | yes/no | yes/no |  |  |
| Antigravity | yes/no | yes/no | yes/no | yes/no | yes/no |  |  |
| Windsurf | yes/no | yes/no | yes/no | yes/no | yes/no |  |  |
| VS Code | yes/no | yes/no | yes/no | yes/no | yes/no |  |  |
| Cursor | yes/no | yes/no | yes/no | yes/no | yes/no |  |  |
| Claude | yes/no | yes/no | yes/no | yes/no | yes/no |  |  |
| Continue | yes/no | yes/no | yes/no | yes/no | yes/no |  |  |
| Generic MCP client | yes/no | yes/no | yes/no | yes/no | yes/no |  |  |

Client-specific config examples are in `examples/mcp`. Users may need to place each example in the client-specific MCP settings file.
