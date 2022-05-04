const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { moonbeamWeb3: web3, multicallAddress } = require('../../../utils/web3');

const IMultiRewardMasterChef = require('../../../abis/IMultiRewardMasterChef.json');
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { BASE_HPY, MOONBEAM_CHAIN_ID, MOONBEAM_LPF } = require('../../../constants');
const { getYearlyTradingFeesForProtocols } = require('../../../utils/getTradingFeeApr');
import { getFarmWithTradingFeesApy } from '../../../utils/getFarmWithTradingFeesApy';
const { stellaClient } = require('../../../apollo/client');
const { compound } = require('../../../utils/compound');
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
import { getEDecimals } from '../../../utils/getEDecimals';
import { addressBook } from '../../../../packages/address-book/address-book';
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

const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const getxStellaApy = async () => {
  const vaultApr = await getFarmApys(pool);

  const oracle = 'tokens';
  const id = 'STELLA';
  const stakedPrice = await fetchPrice({ oracle, id });
  const vaultApy = compound(vaultApr, BASE_HPY, 1, 0.955);
  const tokenContract = getContractWithProvider(ERC20, STELLA.address, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(xSTELLA.address).call());
  const totalStakedInUsd = totalStaked.times(stakedPrice).dividedBy('1e18');
  const yearlyFees = await getYearlyTradingFeesForProtocols(stellaClient, fee);
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
      'stella=xstella': apy,
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
  const { balances, rewardTokens, rewardDecimals, rewardsPerSec } = await getPoolsData();
  const secondsPerBlock = 1;

  const oracle = 'tokens';
  const id = 'xSTELLA';
  const stakedPrice = await fetchPrice({ oracle, id });
  const totalStakedInUsd = balances[0].times(stakedPrice).dividedBy('1e18');

  let poolRewardsInUsd = new BigNumber(0);
  for (let j = 0; j < rewardTokens[0].length; j++) {
    const rewardPrice = await fetchPrice({ oracle: 'tokens', id: rewardTokens[0][j] });
    const rewardInUsd = new BigNumber(rewardsPerSec[0][j])
      .dividedBy(getEDecimals(rewardDecimals[0][j]))
      .times(rewardPrice);
    poolRewardsInUsd = poolRewardsInUsd.plus(rewardInUsd);
  }

  const secondsPerYear = 31536000;
  let yearlyRewardsInUsd = poolRewardsInUsd.dividedBy(secondsPerBlock).times(secondsPerYear);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return apr.toNumber();
};

const getPoolsData = async () => {
  const multicall = new MultiCall(web3, multicallAddress(1284));
  const masterchefContract = getContract(IMultiRewardMasterChef, chef);
  const chefCalls = [];
  chefCalls.push({
    balance: masterchefContract.methods.poolTotalLp(3),
    rewards: masterchefContract.methods.poolRewardsPerSec(3),
  });

  const res = await multicall.all([chefCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const rewardTokens = res[0].map(v => v.rewards['1']);
  const rewardDecimals = res[0].map(v => v.rewards['2']);
  const rewardsPerSec = res[0].map(v => v.rewards['3']);
  return { balances, rewardTokens, rewardDecimals, rewardsPerSec };
};

module.exports = getxStellaApy;
