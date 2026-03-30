# Contributing to LocalPOV

Thanks for your interest in contributing!

## Setup

```bash
git clone https://github.com/manish-git-login/localpov.git
cd localpov
npm install
npm run build
npm test
```

## Development

```bash
npm run build          # Compile TypeScript to dist/
npm test               # Run all tests
npm run build && npm test  # Full check
```

Source is in `src/` (TypeScript), compiled output in `dist/`. Tests are in `test/` (plain JS, run against `dist/`).

### Project structure

```
src/
  index.ts              Entry point
  mcp-server.ts         14 MCP tool definitions
  collectors/
    browser-capture.ts   Console/network/screenshot capture
    build-parser.ts      Error parsing
    docker-watcher.ts    Docker container logs
    terminal.ts          Command execution
  utils/
    inject.ts            Browser injection script
    network.ts           IP detection
    proxy.ts             HTTP proxy + dashboard + APIs
    scanner.ts           Port scanning
    session-manager.ts   Terminal session management
    shell-init.ts        Shell integration
    system-info.ts       Ports/health/env/log tailing
bin/
  localpov.js            CLI entry point
  localpov-mcp.js        MCP server entry point
```

## Making changes

1. Create a branch from `main`
2. Make your changes in `src/`
3. Run `npm run build && npm test` — all 81 tests must pass
4. Submit a pull request

## Adding a new MCP tool

1. Add the tool definition in `src/mcp-server.ts` using `server.registerTool()`
2. Add supporting logic in the appropriate `src/collectors/` or `src/utils/` file
3. Add tests in `test/`
4. Update the tool count in `README.md`

## Reporting issues

Open an issue at https://github.com/manish-git-login/localpov/issues with:

- What you expected
- What happened
- Node version (`node --version`)
- OS and shell

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
