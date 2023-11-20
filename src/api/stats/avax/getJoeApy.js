const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const pool = require('../../../data/avax/joePool.json');
const { DAILY_HPY, AVAX_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
const { getYearlyTradingFeesForSJOE } = require('../../../utils/getTradingFeeApr');
const { joeClient } = require('../../../apollo/client');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const { default: StableJoeStaking } = require('../../../abis/avax/StableJoeStaking');
const { fetchContract } = require('../../rpc/client');

const oracle = 'tokens';
const JOE = 'JOE';
const joeDecimals = '1e18';

const liquidityProviderFee = 0.0005;

const getJoeApy = async () => {
  const joePrice = await fetchPrice({ oracle, id: JOE });

  const rewardPool = fetchContract(pool.rewardPool, StableJoeStaking, AVAX_CHAIN_ID);
  const [totalStaked, tradingAprs] = await Promise.all([
    rewardPool.read.internalJoeBalance().then(v => new BigNumber(v.toString())),
    getYearlyTradingFeesForSJOE(joeClient, liquidityProviderFee),
  ]);

  const totalStakedInUsd = totalStaked.times(joePrice).dividedBy(joeDecimals);

  const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

  const simpleApr = tradingAprs.dividedBy(totalStakedInUsd);
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

module.exports = getJoeApy;
