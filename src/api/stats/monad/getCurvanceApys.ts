import BigNumber from 'bignumber.js';
import { MONAD_CHAIN_ID } from '../../../constants';
import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { getMerklApys } from '../common/curve/getCurveApysCommon';
import { fetchContract } from '../../rpc/client';
import CurvanceVault from '../../../abis/CurvanceVault';

const pools: CurvancePool[] = require('../../../data/monad/curvancePools.json');
const SECONDS_PER_YEAR = 31536000;

export const getCurvanceApys = async () => {
  const [supplyApys, merklApys] = await Promise.all([
    getPoolsApys(pools),
    getMerklApys(MONAD_CHAIN_ID, pools),
  ]);

  return getApyBreakdown(
    pools.map(p => ({
      vaultId: p.name,
      vault: supplyApys[pools.indexOf(p)].plus(merklApys[pools.indexOf(p)]),
    }))
  );
};

const getPoolsApys = async (pools: CurvancePool[]): Promise<BigNumber[]> => {
  const interestRateCalls = [];
  const interestFeeCalls = [];
  const outstandingDebtCalls = [];
  const totalAssetsCalls = [];

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const curvanceVaultContract = fetchContract(pool.address, CurvanceVault, MONAD_CHAIN_ID) as any;
    interestRateCalls.push(curvanceVaultContract.read.getYieldInformation());
    interestFeeCalls.push(curvanceVaultContract.read.interestFee());
    outstandingDebtCalls.push(curvanceVaultContract.read.marketOutstandingDebt());
    totalAssetsCalls.push(curvanceVaultContract.read.totalAssets());
  }

  const res = await Promise.all([
    Promise.all(interestRateCalls),
    Promise.all(interestFeeCalls),
    Promise.all(outstandingDebtCalls),
    Promise.all(totalAssetsCalls),
  ]);

  const rates: BigNumber[] = res[0].map(v => v[0].toString());
  const interestFees: BigNumber[] = res[1].map(v => new BigNumber(v.toString()));
  const outstandingDebt: BigNumber[] = res[2].map(v => new BigNumber(v.toString()));
  const totalAssets: BigNumber[] = res[3].map(v => new BigNumber(v.toString()));

  const apys = rates.map((v, i) =>
    new BigNumber(v)
      .times(SECONDS_PER_YEAR)
      .times(1 - interestFees[i].div(1e4).toNumber())
      .times(outstandingDebt[i])
      .div(totalAssets[i])
      .div(1e18)
  );
  return apys;
};

export interface CurvancePool {
  name: string;
  address: string;
  merklId: string;
  underlying: string;
  oracleId: string;
  decimals: string;
}

export default getCurvanceApys;
