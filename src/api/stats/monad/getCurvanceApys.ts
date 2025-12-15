import BigNumber from 'bignumber.js';
import { MONAD_CHAIN_ID } from '../../../constants';
import { getApyBreakdown } from '../common/getApyBreakdownNew';
import { getMerklApys } from '../common/curve/getCurveApysCommon';
import { fetchContract } from '../../rpc/client';
import CurvanceVault from '../../../abis/CurvanceVault';
import ICurvanceIRM from '../../../abis/CurvanceIRM';

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
      trading: p.lstApr ?? undefined,
    }))
  );
};

const getPoolsApys = async (pools: CurvancePool[]): Promise<BigNumber[]> => {
  const assetsHeldCalls = [];
  const outstandingDebtCalls = [];
  const interestFeeCalls = [];
  const supplyRates = [];

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const curvanceVaultContract = fetchContract(pool.address, CurvanceVault, MONAD_CHAIN_ID) as any;
    assetsHeldCalls.push(curvanceVaultContract.read.assetsHeld());
    outstandingDebtCalls.push(curvanceVaultContract.read.marketOutstandingDebt());
    interestFeeCalls.push(curvanceVaultContract.read.interestFee());
  }

  const res = await Promise.all([
    Promise.all(assetsHeldCalls),
    Promise.all(outstandingDebtCalls),
    Promise.all(interestFeeCalls),
  ]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const IRMContract = fetchContract(pool.irm, ICurvanceIRM, MONAD_CHAIN_ID) as any;
    supplyRates.push(
      IRMContract.read.supplyRate([res[0][i].toString(), res[1][i].toString(), res[2][i].toString()])
    );
  }

  const apys = await Promise.all(supplyRates);

  return apys.map(v => new BigNumber(v.toString()).times(SECONDS_PER_YEAR).div(1e18));
};

export interface CurvancePool {
  name: string;
  address: string;
  merklId: string;
  irm: string;
  underlying: string;
  oracleId: string;
  decimals: string;
  lstApr?: number;
}

export default getCurvanceApys;
