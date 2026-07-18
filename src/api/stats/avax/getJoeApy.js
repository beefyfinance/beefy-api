import { sjoeClient } from '../../../apollo/client.ts';
import { fetchPrice } from '../../../utils/fetchPrice.ts';

import { BigNumber } from 'bignumber.js';
import { DAILY_HPY, AVAX_CHAIN_ID } from '../../../constants.ts';
import { compound } from '../../../utils/compound.js';
import { getYearlyRemittedUsdForSJOE } from '../../../utils/getTradingFeeApr.ts';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees.ts';
import { default as StableJoeStaking }from '../../../abis/avax/StableJoeStaking.ts';
import { fetchContract } from '../../rpc/client.ts';

const oracle = 'tokens';
const JOE = 'JOE';
const joeDecimals = '1e18';

const pool = {
  name: 'joe-joe',
  rewardPool: '0x1a731B2299E22FbAC282E7094EdA41046343Cb51',
};

const liquidityProviderFee = 0.0005;

const getJoeApy = async () => {
  const joePrice = await fetchPrice({ oracle, id: JOE });

  const rewardPool = fetchContract(pool.rewardPool, StableJoeStaking, AVAX_CHAIN_ID);
  const [totalStaked, yearlyRemittedUsd] = await Promise.all([
    rewardPool.read.internalJoeBalance().then(v => new BigNumber(v.toString())),
    getYearlyRemittedUsdForSJOE(sjoeClient),
  ]);

  const totalStakedInUsd = totalStaked.times(joePrice).dividedBy(joeDecimals);

  const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

  const simpleApr = yearlyRemittedUsd.dividedBy(totalStakedInUsd);
  const vaultApr = simpleApr.times(shareAfterBeefyPerformanceFee);
  const vaultApy = compound(simpleApr, DAILY_HPY, 1, shareAfterBeefyPerformanceFee);
  const apys = { [pool.name]: vaultApy };

  const apyBreakdowns = {
    [pool.name]: {
      vaultApr: vaultApr.toNumber(),
      compoundingsPerYear: DAILY_HPY,
      beefyPerformanceFee: beefyPerformanceFee,
      vaultApy: vaultApy,
      lpFee: liquidityProviderFee,
      tradingApr: 0,
      totalApy: vaultApy,
    },
  };

  return {
    apys,
    apyBreakdowns,
  };
};

export default getJoeApy;
