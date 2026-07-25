# Beefy API

The backend that powers [Beefy](https://app.beefy.com). It reads prices, APYs, TVL and vault
metadata from the chains Beefy is deployed on, caches them in memory, and serves them as JSON.

The frontend lives in [beefy-v2](https://github.com/beefyfinance/beefy-v2). The endpoint reference
is published at [docs.beefy.finance](https://docs.beefy.finance/developer-documentation/beefy-api).

## Requirements

- Node — version in [`.nvmrc`](.nvmrc)
- pnpm — version pinned by the `packageManager` field in [`package.json`](package.json)

## Running

```sh
pnpm install
pnpm start
```

The API listens on port 3000 (`PORT` to override). It fetches everything on boot, so expect a
minute or two before data is available; endpoints return 503 until their data is ready.

Configuration is optional — the repo ships default public RPCs and sane fallbacks. To override
anything, copy [`.env.example`](.env.example) to `.env`; `pnpm start` loads it automatically.
Public RPCs are heavily rate-limited, so supplying your own is worthwhile if you are working on a
specific chain.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm start` | Run from source with tsx (development) |
| `pnpm build` | Bundle to `dist/` with tsdown |
| `pnpm start:prod` | Run the built bundle |
| `pnpm typecheck` | Type-check the API |
| `pnpm lint` / `pnpm lint:fix` | Lint and format with Biome |

## Layout

This repository is a pnpm workspace containing the API and one published package.

| Path | Contents |
| --- | --- |
| `src/router.js` | Every route and the handler it maps to — the source of truth for what the API serves |
| `src/app.ts` | Server setup and the boot sequence that starts each data service |
| `src/api/` | Route handlers and the services that fetch and cache their data |
| `src/data/` | Per-chain vault, pool and boost configuration (JSON) |
| `src/abis/` | Contract ABIs |
| `src/utils/` | Shared helpers — RPC clients, caching, HTTP, logging |
| `scripts/` | Maintenance helpers, mostly for adding new vaults and pools |
| `packages/address-book/` | Token and protocol addresses per chain, published to npm as [`@beefyfinance/blockchain-addressbook`](https://www.npmjs.com/package/@beefyfinance/blockchain-addressbook) |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE).
