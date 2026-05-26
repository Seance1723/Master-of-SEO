# Post-Publish Checklist

Run these checks after publishing a release.

1. Verify npm metadata:

```bash
npm view master-of-seo
```

2. Install globally:

```bash
npm install -g master-of-seo
```

3. Test CLI:

```bash
seo-master "/seo-master help"
seo-master "/seo-master final-status"
npx -y master-of-seo "/seo-master help"
```

4. Test MCP:

```bash
npx -y master-of-seo mcp
```

5. Test target MCP clients:

- Codex
- Antigravity
- Windsurf
- VS Code
- Cursor
- Claude
- Continue
- Generic MCP client

6. Check package pages:

- npm README rendering
- GitHub README rendering
- License rendering

7. Tag the Git release:

```bash
git tag v1.0.0
git push origin v1.0.0
```
