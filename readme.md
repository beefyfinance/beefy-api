# Beefy API

## Overview

Simple API for BeefyFinance

## Dependencies

### prettier

https://prettier.io/

Opinionated Code Formatter

## Env

Required env vars:

```
PORT=...

FORTUBE_API_TOKEN=...   // session token
FORTUBE_HPY=...         // harvests per year: default: 50
FORTUBE_REQ_MARKETS=... // default: https://bsc.for.tube/api/v1/bank/markets?mode=extended
FORTUBE_REQ_TOKENS=...  // default: https://bsc.for.tube/api/v2/bank_tokens

FRY_HPY=...             // harvests per year. default: 365
FRY_BURGER_APY=...      // pre compound APY. default: 255
FRY_WBNB_APY=...        // pre compound APY. default: 80
FRY_BUSD_APY=...        // pre compound APY. default: 24
```

## License

[MIT](LICENSE).