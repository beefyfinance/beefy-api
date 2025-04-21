import BigNumber from 'bignumber.js';
import { ChainId } from '../../../../../packages/address-book/src/address-book';
import EulerVault from '../../../../abis/EulerVault';
import { fetchContract } from '../../../rpc/client';
import { getMerklApys } from '../getMerklApys';
import { getApyBreakdown } from '../getApyBreakdownNew';

const SECONDS_PER_YEAR = 31536000;

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

const getPoolsApys = async (chainId, pools) => {
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
}

export interface EulerApyParams {
  chainId: ChainId;
  pools: EulerPool[];
  log?: boolean;
}

export default getEulerApyData;
