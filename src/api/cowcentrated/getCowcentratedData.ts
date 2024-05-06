import { getKey, setKey } from '../../utils/cache';
import optimismPools from '../../data/optimism/beefyCowVaults.json';
import basePools from '../../data/base/beefyCowVaults.json';
import arbitrumPools from '../../data/arbitrum/beefyCowVaults.json';
import BigNumber from 'bignumber.js';
import { initCowMerklService } from './getMerkleCampaigns';

let cowData;

const CACHE_KEY = 'COWCENTRATED_DATA';
const INIT_DELAY = Number(process.env.COWCENTRATED_INIT_DELAY || 5000);
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
  pools.reduce((acc, pool) => ({ ...acc, [pool.address.toLowerCase()]: pool }), {});

const subgraphPositionMapping: Record<string, Record<string, CLMVault>> = {
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
  vaultAddressToIdMapping: Record<string, CLMVault>
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
        const clmVault = vaultAddressToIdMapping[vault.id.toLowerCase()];
        cowData[clmVault.oracleId] = {
          currentPrice: decimalTranslateFunction(
            vault.currentPriceOfToken0InToken1,
            clmVault.decimals[0],
            clmVault.decimals[1]
          ),
          priceRangeMin: decimalTranslateFunction(
            vault.priceRangeMin1,
            clmVault.decimals[0],
            clmVault.decimals[1]
          ),
          priceRangeMax: decimalTranslateFunction(
            vault.priceRangeMax1,
            clmVault.decimals[0],
            clmVault.decimals[1]
          ),
        };
      }
    });
  } catch (err) {
    console.log(`> CLM data update failed for ${subgraphUrl}: ${err.message}`);
  }
};

const decimalTranslateFunction = (value: string, decimal0: number, decimal1: number) => {
  return new BigNumber(value).shiftedBy(decimal0 - decimal1).toString(10);
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
  await initCowMerklService();
};

const saveToRedis = async () => {
  await setKey(CACHE_KEY, cowData);
};
