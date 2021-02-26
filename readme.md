
# Beefy API

API that powers [Beefy Finance](https://app.beefy.finance). You can find the repo for the frontend [here](https://github.com/beefyfinance/beefy-app). 

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
## Endpoints

### Consumed by the [app](https://app.beefy.finance).
**/apy**: The main endpoint used by the frontend. It returns the APY of all the vaults in the following format. 
```
{
	"bifi-maxi": 0.22448469479728606, // 22%
	"cake-cake": 2.8002377054263174, // 280%
	"cake-smart": 2.8002377054263174, // 280%
	"cake-swingby-bnb": 21.85102752680053 // 2185%
}
```
After you start the API it can take a minute or two before you can fetch the APYs. We currently log `getApys()` to the console when all the data is available.

**/:platform/price**: We have a few different endpoints to fetch price oracle information of different assets. We get most token prices from "/pancake/price" but there are some exceptions that come from "/bakery/price" for example. The intention is to eventually unify all token prices under the same endpoint.

**/:platform/lps**: We have a single endpoint per platform we farm to get its LP token prices. For example "kebab/lps" gives all the price info about the kebab LPs. Just like with the previous endpoint, we want to unify all LP prices under a single endpoint.


### Consumed by third party platforms
**/cmc**:  Custom endpoint required by [CoinMarketCap](https://coinmarketcap.com/) to display our vaults in their yield farming section.
**/supply**:  Used by [Coingecko](https://coingecko.com) to display BIFI's total supply and circulating supply.
 
### Consumed by the [dashboard](https://dashboard.beefy.finance)
**/earnings**:  Used to display the total and daily earnings of the platform. 
**/holders**:  Used to display the total number of holders. This calc takes into account users with 0 BIFI in their wallet, but BIFI staked in the reward pool.


## Contribute

Beefy.Finance exists thanks to its contributors. There are many ways you can participate and help build high quality software. Check out the [contribution guide](CONTRIBUTING.md)!

## License

[MIT](LICENSE).
