# Beefy API

API that powers [Beefy Finance](https://app.beefy.finance). You can find the repo for the frontend [here](https://github.com/beefyfinance/beefy-app).

---

## To Run

Optional enviroment vars:

`BSC_RPC` - A custom RPC endpoint that you want to use.
`HECO_RPC` - A custom RPC endpoint for HECO. You can just leave the default one otherwise.
`FORTUBE_API_TOKEN` - A token from Fortube to use their API. If you don't have a token you will get a console warning and the Fortube APYs will be slightly smaller than in production. Everything works fine otherwise.

Afterwards just do

```
yarn
yarn start
```

---
---

## Endpoints

---

### Consumed by the [app](https://app.beefy.finance)

#### **/apy**

The main endpoint used by the frontend. It returns the APY of all the vaults in the following format. This is the legacy format. A new endpoint is being created at **/apy/breakdown** with a staggered migration.

```
{
	"bifi-maxi": 0.22448469479728606, // 22%
	"cake-cake": 2.8002377054263174, // 280%
	"cake-smart": 2.8002377054263174, // 280%
	"cake-swingby-bnb": 21.85102752680053 // 2185%
}
```

#### **/apy/breakdown**
The new version of the APY endpoint, broken down into component parts when they are available. The endpoint moves to a new format, which is consistent whether or not the breakdown stats are possible to display. It has the following structure:

``` json
{
	"bifi-maxi": {
        "totalApy": 0.07598675804818633
	},
	"cometh-must-eth": {
        "vaultApr": 1.186973388240745,
        "compoundingsPerYear": 2190,
        "beefyPerformanceFee": 0.045,
        "vaultApy": 2.1057844292858614,
        "lpFee": 0.005,
        "tradingApr": 0.22324214039526927,
        "totalApy": 2.8825691266420788
	},
}
```

As you can see above, the endpoint attempts to expose some elements from the breakdown of the Total APY calculation. Where this is not possible, we just show the legacy Total APY. Note that the legacy Total APY -> totalApy does not include the trading fees.

Each of these fields within the structure are:

- **vaultApr** - Yearly rewards in USD divided by total staked in USD.
- **compoundingsPerYear** - The estimated compounding events. This is an internal field and references the value used within the calculation for this project.
- **beefyPerformanceFee** - The flat Beefy performance fee included in the calculation. This is an internal field for reference.
- **vaultApy** - The vaultApr compounded, using compoundingsPerYear and beefyPerformanceFee in the calculation.
- **lpFee** - The Liquidity Provider (LP) fee per trade. This is an internal field for reference.
- **tradingApr** - Annual interest from trading fees, not compounded.
- **totalApy** - The known Total APY. Where fields are available to calculate the Total APY including trading fees, this is calculated. The final calculation is totalApy = (1 + vaultApr) * (1 + (compounded tradingApr)) - 1.

After you start the API it can take a minute or two before you can fetch the APYs. We currently log `getApys()` to the console when all the data is available.

#### **/prices** All token prices under the same endpoint (crosschain).

#### **/lps**: All liqudity pair prices under a single endpoint (crosschain).

---

### Consumed by the [dashboard](https://dashboard.beefy.finance)

#### **/earnings**: Used to display the total and daily earnings of the platform

#### **/holders**: Used to display the total number of holders. This calc takes into account users with 0 BIFI in their wallet, but BIFI staked in the reward pool

---

### Consumed by third party platforms

#### **/cmc**: Custom endpoint required by [CoinMarketCap](https://coinmarketcap.com/) to display our vaults in their yield farming section

#### **/supply**: Used by [Coingecko](https://coingecko.com) to display BIFI's total supply and circulating supply

---
---

## Contribute

Beefy.Finance exists thanks to its contributors. There are many ways you can participate and help build high quality software. Check out the [contribution guide](CONTRIBUTING.md)!

---
---

## License

[MIT](LICENSE)
