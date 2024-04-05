import { getKey, setKey } from '../../utils/cache';
import optimismPools from '../../data/optimism/beefyCowVaults.json';
import basePools from '../../data/base/beefyCowVaults.json';
import arbitrumPools from '../../data/arbitrum/beefyCowVaults.json';

let cowData;

const CACHE_KEY = 'COWCENTRATED_DATA';
const INIT_DELAY = 5000;
const REFRESH_DELAY = 60000;

type CLMVault = {
  address: `0x${string}`;
  lpAddress: `0x${string}`;
  tokens: [`0x${string}`, `0x${string}`];
  tokenOracleIds: [string, string];
  decimals: [number, number];
  oracleId: string;
};

const reducePoolsToMap = (pools: CLMVault[]) =>
  pools.reduce((acc, pool) => ({ ...acc, [pool.address.toLowerCase()]: pool.oracleId }), {});

const subgraphPositionMapping: Record<string, Record<string, string>> = {
  'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-optimism': reducePoolsToMap(
    optimismPools as CLMVault[]
  ),
  'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-base': reducePoolsToMap(
    basePools as CLMVault[]
  ),
  'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-arbitrum': reducePoolsToMap(
    arbitrumPools as CLMVault[]
  ),
};

const updateChainCowcentratedData = async (
  subgraphUrl: string,
  vaultAddressToIdMapping: Record<string, string>
) => {
  try {
    const response: any = await fetch(subgraphUrl, {
      headers: {
        'content-type': 'application/json',
      },
      body: '{"query":"query BeefyCLss {\\n  beefyCLVaults {\\n    id\\n    priceRangeMinUSD\\n    currentPriceOfToken0InToken1\\n    priceRangeMaxUSD\\n    priceRangeMin1\\n    priceRangeMax1\\n  }\\n}","operationName":"BeefyCLss","extensions":{}}',
      method: 'POST',
    }).then(response => response.json());

    response.data.beefyCLVaults.forEach((vault: any) => {
      if (vaultAddressToIdMapping[vault.id.toLowerCase()]) {
        cowData[vaultAddressToIdMapping[vault.id.toLowerCase()]] = {
          currentPrice: vault.currentPriceOfToken0InToken1,
          priceRangeMin: vault.priceRangeMin1,
          priceRangeMax: vault.priceRangeMax1,
        };
      }
    });
  } catch (err) {
    console.log(`> CLM data update failed for ${subgraphUrl}: ${err.message}`);
  }
};

const updateCowcentratedData = async () => {
  const start = Date.now();
  console.log('> Updating Cowcentrated data');
  try {
    for (const [subgraphUrl, clmVaults] of Object.entries(subgraphPositionMapping)) {
      updateChainCowcentratedData(subgraphUrl, clmVaults);
    }
    await saveToRedis();
  } catch (err) {
    console.log(err.message);
  }

  console.log(`> Cowcentrated data updated (${(Date.now() - start) / 1000}s)`);
  setTimeout(updateCowcentratedData, REFRESH_DELAY);
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
