const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
const pool = require('../../../data/fantom/spookySinglePool.json');
const { BASE_HPY, FANTOM_CHAIN_ID } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import ERC20Abi from '../../../abis/ERC20Abi';
import xBOOChefAbi from '../../../abis/fantom/xBOOChef';
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
import { fetchContract } from '../../rpc/client';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';

const oracle = 'tokens';
const oracleId = 'BOO';
const BOO = '0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE';
const xBOOChefAddress = '0x399D73bB7c83a011cD85DF2a3CdF997ED3B3439f';
const xBOO = '0xa48d959AE2E88f1dAA7D5F611E01908106dE7598';
const DECIMALS = '1e18';

const SECONDS_PER_YEAR = 31536000;

const liquidityProviderFee = 0.0003;
const afterBurn = 0.91;

const getSpookyBooApy = async () => {
  const BOOPrice = await fetchPrice({ oracle, id: oracleId });
  const BOOContract = fetchContract(BOO, ERC20Abi, FANTOM_CHAIN_ID);

  const [{ balance, rewardRate }, totalStakedInxBOO, yearlyTradingFees] = await Promise.all([
    getPoolData(),
    BOOContract.read.balanceOf([xBOO]).then(res => new BigNumber(res.toString())),
    getYearlyTradingFees(),
  ]);

  const totalStakedInxBOOInUsd = new BigNumber(totalStakedInxBOO)
    .times(BOOPrice)
    .dividedBy(DECIMALS);
  const xBOOPrice = await fetchPrice({ oracle: 'tokens', id: 'xBOO' });

  const totalStakedInUsd = balance.times(xBOOPrice).dividedBy(DECIMALS);

  const rewardPrice = await fetchPrice({ oracle, id: pool.rewardTokenName });
  const yearlyRewards = rewardRate.times(SECONDS_PER_YEAR).times(afterBurn);
  const yearlyRewardsInUsd = yearlyRewards.times(rewardPrice).dividedBy(pool.rewardDecimals);

  const simpleApr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const beefyPerformanceFee = getTotalPerformanceFeeForVault('boo-boo');
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
  const vaultApr = simpleApr.times(shareAfterBeefyPerformanceFee);
  const vaultApy = compound(simpleApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  const tradingApr = yearlyTradingFees.div(totalStakedInxBOOInUsd);
  const totalApy = getFarmWithTradingFeesApy(
    simpleApr,
    tradingApr,
    BASE_HPY,
    1,
    shareAfterBeefyPerformanceFee
  );
  const apys = { 'boo-boo': totalApy };

  // Create reference for breakdown /apy
  const apyBreakdowns = {
    'boo-boo': {
      vaultApr: vaultApr.toNumber(),
      compoundingsPerYear: BASE_HPY,
      beefyPerformanceFee: beefyPerformanceFee,
      vaultApy: vaultApy,
      lpFee: liquidityProviderFee,
      tradingApr: tradingApr.toNumber(),
      totalApy: totalApy,
    },
  };

  return {
    apys,
    apyBreakdowns,
  };
};

const getPoolData = async () => {
  const xBOOChef = fetchContract(xBOOChefAddress, xBOOChefAbi, FANTOM_CHAIN_ID);
  const rewardPool = await xBOOChef.read.poolInfo([pool.poolId]).call();
  const rewardRate = new BigNumber(rewardPool[5].toString());
  const balance = new BigNumber(rewardPool[5].toString());

  return { balance, rewardRate };
};

module.exports = getSpookyBooApy;
