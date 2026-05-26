# Publishing

Do not publish automatically. Run the real publish command only after explicit release approval.

## Release Checklist

- `npm install`
- `npm run build`
- `npm test`
- CLI smoke tests pass
- MCP smoke test passes
- `npm pack --dry-run` reviewed
- tarball install test passes
- `npm publish --dry-run` reviewed
- README and docs are polished
- No secrets or heavy local files are included

## npm Account

```bash
npm login
npm whoami
```

## Package Validation

```bash
npm pack --dry-run
npm pack
```

Install the generated tarball in a temporary folder before publishing.

## Publish Dry Run

```bash
npm publish --dry-run
```

For a scoped public package:

```bash
npm publish --access public --dry-run
```

## Publish

Unscoped package:

```bash
npm publish
```

Scoped public package:

```bash
npm publish --access public
```

## Versioning

```bash
npm version patch
npm version minor
npm version major
```

Do not reuse published versions. If a bad version is published, publish a fixed newer version or deprecate the bad one:

```bash
npm deprecate master-of-seo@1.0.0 "Use a newer version."
```
