const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');
const StableJoeStaking = require('../../../abis/avax/StableJoeStaking.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pool = require('../../../data/avax/joePool.json');
const { DAILY_HPY } = require('../../../constants');
const { compound } = require('../../../utils/compound');
const { getYearlyTradingFeesForSJOE } = require('../../../utils/getTradingFeeApr');
const { joeClient } = require('../../../apollo/client');
const { getContractWithProvider } = require('../../../utils/contractHelper');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');

const oracle = 'tokens';
const JOE = 'JOE';
const joeDecimals = '1e18';

const liquidityProviderFee = 0.0005;

const getJoeApy = async () => {
  const joePrice = await fetchPrice({ oracle, id: JOE });

  const rewardPool = getContractWithProvider(StableJoeStaking, pool.rewardPool, web3);
  const totalStaked = new BigNumber(await rewardPool.methods.internalJoeBalance().call());
  const totalStakedInUsd = totalStaked.times(joePrice).dividedBy(joeDecimals);

  const tradingAprs = await getYearlyTradingFeesForSJOE(joeClient, liquidityProviderFee);

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
