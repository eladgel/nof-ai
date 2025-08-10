# Known Issues

## Vitest CJS Deprecation Warning

**Issue**: When running tests, you may see a warning:
```
[33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m
```

**Status**: Harmless warning that can be ignored

**Explanation**: This warning appears because Vitest v2.1.9 internally uses Vite's CommonJS build. The warning does not affect test functionality and all tests run correctly.

**Solutions attempted**:
- Updated vitest.config.ts to use ESM imports with `import.meta.url`
- Added `esbuild.target` configuration
- Upgrading to Vitest v3.x causes compatibility issues with current Node.js version

**Resolution**: The warning will be resolved when:
1. Vitest releases a version that fully supports ESM without the warning, or
2. The project is upgraded to a newer Node.js version (>=22.12.0) that supports Vitest v3.x

**Impact**: None - tests run correctly and the warning can be safely ignored.