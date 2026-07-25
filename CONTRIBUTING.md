# Contributing to Beefy API

Thanks for helping out. This guide covers the mechanics; see the [README](README.md) for what the
project is and how to run it.

## Getting set up

Fork the repository, then:

```sh
git clone https://github.com/<you>/beefy-api.git
cd beefy-api
pnpm install
```

`pnpm install` from the root installs both workspace packages and the git hooks. Run it again after
pulling changes that touch dependencies.

## Making a change

1. Branch off `master`.
2. Make your change and commit. Hooks run on commit — formatting is applied automatically, and
   type or data errors will block the commit.
3. Push and open a pull request against `master`.

## What gets checked

What you stage decides which checks run on commit. On a pull request, CI runs:

- Biome lint and format
- TypeScript, for both the API and the address book
- A production build

Address book changes additionally get their validation scripts and a packaging test. There is no
unit test suite — correctness of new pools is verified by running the API and checking the data it
produces.

## Where things go

**Vaults, pools and boosts** are configured as JSON under `src/data/<chain>/`. The `scripts/`
directory has helpers that read a pool on-chain and append a correctly shaped entry for you —
`add-farm.ts` for MasterChef farms, `add-solidly.ts` for Solidly-style gauges, `add-univ3.ts` and
`add-clm.ts` for concentrated liquidity. Each takes a `--network` flag plus its own arguments, so
read the one you need before running it. They do not load `.env`, so export any RPC override into
your shell first.

If you are adding a vault, start the API and confirm it appears in `/apy/breakdown` with a sensible
number before opening the PR.

**Token and protocol addresses** go in `packages/address-book/`, under
`src/address-book/<chain>/tokens/` and `<chain>/platforms/`. Two rules matter:

- Addresses must be EIP-55 checksummed. The commit hook tells you the correct form if you get it wrong.
- Never edit the package version by hand — it is bumped and published automatically when your PR merges.

**New endpoints** need a handler under `src/api/` and a route in `src/router.js`. If the data needs
fetching on a schedule rather than per request, follow an existing service in `src/api/` and
initialise it in `src/app.ts`.

## Questions

Open an issue at
[github.com/beefyfinance/beefy-api/issues](https://github.com/beefyfinance/beefy-api/issues).
