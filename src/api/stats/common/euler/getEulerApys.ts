import BigNumber from 'bignumber.js';
import { ChainId } from '../../../../../packages/address-book/src/address-book';
import EulerVault from '../../../../abis/EulerVault';
import { fetchContract } from '../../../rpc/client';
import { getMerklApys } from '../getMerklApys';
import { getApyBreakdown } from '../getApyBreakdownNew';

const SECONDS_PER_YEAR = 31536000;

interface EulerApiResponse {
  apyCurrent?: number;
  vault?: {
    apyCurrent?: number;
  };
}

const getEulerApyData = async (params: EulerApyParams) => {
  const [supplyApys, merklApys] = await Promise.all([
    getPoolsApys(params.chainId, params.pools),
    getMerklApys(params.chainId, params.pools),
  ]);

  if (params.log) {
    params.pools.forEach((pool, i) => console.log(pool.name, supplyApys[i].valueOf()));
  }

  return getApyBreakdown(
    params.pools.map(p => ({
      vaultId: p.name,
      trading: supplyApys[params.pools.indexOf(p)],
      vault: merklApys[params.pools.indexOf(p)],
    }))
  );
};

const getPoolsApys = async (chainId: ChainId, pools: EulerPool[]): Promise<BigNumber[]> => {
  // Split pools into earn and non-earn pools
  const earnPools: { pool: EulerPool; index: number }[] = [];
  const contractPools: { pool: EulerPool; index: number }[] = [];

  pools.forEach((pool, index) => {
    if (pool.earn) {
      earnPools.push({ pool, index });
    } else {
      contractPools.push({ pool, index });
    }
  });

  // Initialize results array with correct length
  const results: BigNumber[] = new Array(pools.length);

  // Process both types concurrently
  const promises: Promise<void>[] = [];

  // Handle earn pools with API calls
  if (earnPools.length > 0) {
    promises.push(
      getPoolsApysFromApi(
        chainId,
        earnPools.map(p => p.pool)
      ).then(apiApys => {
        earnPools.forEach((poolInfo, i) => {
          results[poolInfo.index] = apiApys[i];
        });
      })
    );
  }

  // Handle non-earn pools with contract calls
  if (contractPools.length > 0) {
    promises.push(
      getPoolsApysFromContracts(
        chainId,
        contractPools.map(p => p.pool)
      ).then(contractApys => {
        contractPools.forEach((poolInfo, i) => {
          results[poolInfo.index] = contractApys[i];
        });
      })
    );
  }

  await Promise.all(promises);
  return results;
};

const getPoolsApysFromApi = async (chainId: ChainId, pools: EulerPool[]): Promise<BigNumber[]> => {
  const apiCalls = pools.map(async pool => {
    try {
      const url = `https://indexer-main.euler.finance/v1/earn/vault?chainId=${chainId}&vaultAddress=${pool.address}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Euler API error for ${pool.name}: ${response.status}`);
        return new BigNumber(0);
      }

      const data: EulerApiResponse = await response.json();
      const apyValue = data.apyCurrent;
      if (apyValue !== undefined && apyValue !== null) {
        // console.log(`${pool.name} APY:`, apyValue);
        return new BigNumber(apyValue).div(100); // Convert percentage to decimal
      } else {
        console.error(`Euler API returned empty or missing APY data for ${pool.name}`);
        return new BigNumber(0);
      }
    } catch (error) {
      console.error(`Error fetching Euler APY for ${pool.name}:`, error);
      return new BigNumber(0);
    }
  });

  return Promise.all(apiCalls);
};

const getPoolsApysFromContracts = async (chainId: ChainId, pools: EulerPool[]): Promise<BigNumber[]> => {
  const interestRateCalls = [];
  const interestFeeCalls = [];
  const totalBorrowedCalls = [];
  const totalSuppliedCalls = [];

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const eulerVaultContract = fetchContract(pool.address, EulerVault, chainId);
    interestRateCalls.push(eulerVaultContract.read.interestRate());
    interestFeeCalls.push(eulerVaultContract.read.interestFee());
    totalBorrowedCalls.push(eulerVaultContract.read.totalBorrows());
    totalSuppliedCalls.push(eulerVaultContract.read.totalSupply());
  }

  const res = await Promise.all([
    Promise.all(interestRateCalls),
    Promise.all(interestFeeCalls),
    Promise.all(totalBorrowedCalls),
    Promise.all(totalSuppliedCalls),
  ]);

  const interestRates: BigNumber[] = res[0].map(v => new BigNumber(v.toString()));
  const interestFees: BigNumber[] = res[1].map(v => new BigNumber(v.toString()));
  const totalBorrowed: BigNumber[] = res[2].map(v => new BigNumber(v.toString()));
  const totalSupplied: BigNumber[] = res[3].map(v => new BigNumber(v.toString()));

  const apys = interestRates.map((v, i) =>
    new BigNumber(Math.exp(v.times(SECONDS_PER_YEAR).div(1e27).toNumber()) - 1)
      .times(1 - interestFees[i].div(1e4).toNumber())
      .times(totalBorrowed[i])
      .div(totalSupplied[i])
  );
  return apys;
};

export interface EulerPool {
  name: string;
  address: string;
  beefyFee?: number;
  earn?: boolean;
}

export interface EulerApyParams {
  chainId: ChainId;
  pools: EulerPool[];
  log?: boolean;
}

export default getEulerApyData;
