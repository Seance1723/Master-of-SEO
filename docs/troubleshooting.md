# Troubleshooting

## CLI Command Not Found

Install globally or use `npx`:

```bash
npm install -g master-of-seo
npx -y master-of-seo "/seo-master help"
```

## MCP Server Does Not Appear

Check that the client config uses:

```json
{
  "mcpServers": {
    "master-of-seo": {
      "command": "npx",
      "args": ["-y", "master-of-seo", "mcp"]
    }
  }
}
```

Restart the agent client after adding the config.

## Command Returns `needs_input`

This is expected when no audit data is supplied. Master of SEO does not crawl, fetch Search Console, read GA4, scrape SERPs, or check backlinks unless a provider integration is added later.

## Natural Prompt Does Not Activate

Master of SEO only activates when the prompt starts with `/seo-master` or explicitly says `use seo-master`, `use Master of SEO`, or `apply seo-master skills`.

## Publish Dry Run Fails On Windows Cache Permissions

Retry after closing editors or antivirus file locks. If needed, run the dry run from an elevated shell:

```bash
npm pack --dry-run
```
