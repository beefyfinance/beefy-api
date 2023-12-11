const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../utils/fetchPrice';
const { BASE_HPY, MOONBEAM_CHAIN_ID, MOONBEAM_LPF } = require('../../../constants');
const { getYearlyTradingFeesForProtocols } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { stellaClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { getEDecimals } from '../../../utils/getEDecimals';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import IMultiRewardMasterChef from '../../../abis/IMultiRewardMasterChef';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
const {
  moonbeam: {
    tokens: { STELLA, xSTELLA },
  },
} = addressBook;

const pool = [
  {
    oracle: 'tokens',
    oracleId: 'xSTELLA',
    decimals: '1e18',
    poolId: 3,
  },
];

const fee = 0.0005;
const chef = '0xF3a5454496E26ac57da879bf3285Fa85DEBF0388';

const getxStellaApy = async () => {
  const tokenContract = fetchContract(STELLA.address, ERC20Abi, MOONBEAM_CHAIN_ID);

  const [vaultApr, yearlyFees, totalStakedResult] = await Promise.all([
    getFarmApys(pool),
    getYearlyTradingFeesForProtocols(stellaClient, fee),
    tokenContract.read.balanceOf([xSTELLA.address]),
  ]);

  const oracle = 'tokens';
  const id = 'STELLA';
  const stakedPrice = await fetchPrice({ oracle, id });
  const beefyPerformanceFee = getTotalPerformanceFeeForVault('stella-xstella');
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
  const totalStaked = new BigNumber(totalStakedResult.toString());
  const totalStakedInUsd = totalStaked.times(stakedPrice).dividedBy('1e18');
  const vaultApy = compound(vaultApr, BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  const tradingApr = yearlyFees.dividedBy(totalStakedInUsd);

  const apy = await getFarmWithTradingFeesApy(
    vaultApr,
    tradingApr,
    BASE_HPY,
    1,
    shareAfterBeefyPerformanceFee
  );

  return {
    apys: {
      'stella-xstella': apy,
    },
    apyBreakdowns: {
      'stella-xstella': {
        vaultApr: vaultApr,
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        tradingApr: tradingApr,
        totalApy: apy,
      },
    },
  };
};

const getFarmApys = async () => {
  const { balance, rewardTokens, rewardDecimals, rewardsPerSec } = await getPoolsData();
  const secondsPerBlock = 1;

  const oracle = 'tokens';
  const id = 'xSTELLA';
  const stakedPrice = await fetchPrice({ oracle, id });
  const totalStakedInUsd = balance.times(stakedPrice).dividedBy('1e18');

  let poolRewardsInUsd = new BigNumber(0);
  for (let j = 0; j < rewardTokens.length; j++) {
    const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardTokens[j] });
    const rewardInUsd = new BigNumber(rewardsPerSec[j].toString())
      .dividedBy(getEDecimals(rewardDecimals[j]))
      .times(rewardPrice);
    poolRewardsInUsd = poolRewardsInUsd.plus(rewardInUsd);
  }

  const secondsPerYear = 31536000;
  let yearlyRewardsInUsd = poolRewardsInUsd.dividedBy(secondsPerBlock).times(secondsPerYear);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return apr.toNumber();
};

const getPoolsData = async () => {
  const masterchefContract = fetchContract(chef, IMultiRewardMasterChef, MOONBEAM_CHAIN_ID);

  const [balanceResults, rewardResults] = await Promise.all([
    masterchefContract.read.poolTotalLp([3]),
    masterchefContract.read.poolRewardsPerSec([3]),
  ]);

  const balance = new BigNumber(balanceResults.toString());
  const rewardTokens = rewardResults[1];
  const rewardDecimals = rewardResults[2];
  const rewardsPerSec = rewardResults[3].map(v => new BigNumber(v.toString()));
  return { balance, rewardTokens, rewardDecimals, rewardsPerSec };
};

module.exports = getxStellaApy;
