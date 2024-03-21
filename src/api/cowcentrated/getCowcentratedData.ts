import { getKey, setKey } from '../../utils/cache';

let cowData;

const CACHE_KEY = 'COWCENTRATED_DATA';
const INIT_DELAY = 5000;

const addressToVaultIdMapping = {
  ['0x8f6d2f9301305840deb366946a5e9e01279483b3'.toLowerCase()]: 'uniswap-cow-op-susd-usdc',
  ['0x9ba9232ae8b159558082642bdf77378cfc0306fb'.toLowerCase()]: 'uniswap-cow-op-op-eth',
  ['0xf01e9f9535e834092f1d3b1712a5dc1b1b92cd07'.toLowerCase()]: 'uniswap-cow-op-moobifi-eth',
};

const updateCowcentratedData = async () => {
  try {
    const a: any = await fetch('https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-optimism', {
      headers: {
        accept: 'application/graphql-response+json, application/json, multipart/mixed',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
      },
      body: '{"query":"query BeefyCLss {\\n  beefyCLVaults {\\n    id\\n    priceRangeMinUSD\\n    currentPriceOfToken0InToken1\\n    priceRangeMaxUSD\\n    priceRangeMin1\\n    priceRangeMax1\\n  }\\n}","operationName":"BeefyCLss","extensions":{}}',
      method: 'POST',
    }).then(response => response.json());
    a.data.beefyCLVaults.forEach((vault: any) => {
      if (addressToVaultIdMapping[vault.id.toLowerCase()]) {
        cowData[addressToVaultIdMapping[vault.id.toLowerCase()]] = {
          currentPrice: vault.currentPriceOfToken0InToken1,
          priceRangeMin: vault.priceRangeMin1,
          priceRangeMax: vault.priceRangeMax1,
        };
      }
    });
    await saveToRedis();
  } catch (err) {
    console.log(err.message);
  }

  console.log('> Cowcentrated data updated');
};

export const getCowcentratedData = () => cowData;

export const initCowDataService = async () => {
  const cachedTvl = await getKey(CACHE_KEY);
  cowData = cachedTvl ?? {};

  setTimeout(updateCowcentratedData, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey(CACHE_KEY, cowData);
};
