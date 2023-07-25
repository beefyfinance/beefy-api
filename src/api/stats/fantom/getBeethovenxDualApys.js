const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../utils/fetchPrice');
const { FANTOM_CHAIN_ID } = require('../../../constants');
const { getTradingFeeAprBalancerFTM } = require('../../../utils/getTradingFeeApr');
const pools = require('../../../data/fantom/beethovenxDualPools.json');
import { beetClient } from '../../../apollo/client';
import getBlockTime from '../../../utils/getBlockTime';
import getApyBreakdown from '../common/getApyBreakdown';
import { beethovenx } from '../../../../packages/address-book/address-book/fantom/platforms/beethovenx';
import IBalancerVault from '../../../abis/IBalancerVault';
import BeethovenxChef from '../../../abis/fantom/BeethovenxChef';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import BeethovenRewarder from '../../../abis/fantom/BeethovenRewarder';

const masterchef = '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3';
const oracleIdA = 'BEETS';
const oracleA = 'tokens';
const DECIMALSA = '1e18';
const secondsPerYear = 31536000;
const liquidityProviderFee = 0.0075;
const burn = 0.128;

const getBeethovenxDualApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);

  const [tradingAprs, farmApys] = await Promise.all([
    getTradingFeeAprBalancerFTM(beetClient, pairAddresses, liquidityProviderFee),
    getFarmApys(pools),
  ]);
  return getApyBreakdown(pools, tradingAprs, farmApys[0], liquidityProviderFee, farmApys[1]);
};

const getFarmApys = async pools => {
  const apys = [];
  const lsAprs = [];

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const [
    secondsPerBlock,
    { blockRewards, totalAllocPoint },
    { balances, allocPoints, rewarders, tokenBRewardRates },
  ] = await Promise.all([getBlockTime(FANTOM_CHAIN_ID), getMasterChefData(), getPoolsData(pools)]);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const stakedPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(stakedPrice).dividedBy(DECIMALSA);

    const poolBlockRewards = blockRewards.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards
      .times(tokenPriceA)
      .times(1 - burn)
      .dividedBy(DECIMALSA);
    const yearlyRewardsBInUsd = await (async () => {
      if (rewarders[i] === '0x0000000000000000000000000000000000000000') {
        return 0;
      } else {
        const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
        const yearlyRewardsB = tokenBRewardRates[i].times(secondsPerYear);
        return yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
      }
    })();

    let yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);
    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);

    let aprFixed = 0;
    if (pool.liquidstaking) {
      aprFixed = await getLiquidStakingPoolYield(pool);
    }
    lsAprs.push(aprFixed);
  }

  return [apys, lsAprs];
};

const getLiquidStakingPoolYield = async pool => {
  const balVault = fetchContract(beethovenx.router, IBalancerVault, FANTOM_CHAIN_ID);
  const tokenQtys = await balVault.read.getPoolTokens([pool.vaultPoolId]);

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys[1].length; j++) {
    if (pool.composable) {
      if (j != pool.bptIndex) {
        const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
        const amt = new BigNumber(tokenQtys[1][j].toString())
          .times(price)
          .dividedBy([pool.tokens[j].decimals]);
        totalQty = totalQty.plus(amt);
        qty.push(amt);
      }
    } else {
      const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt = new BigNumber(tokenQtys[1][j].toString())
        .times(price)
        .dividedBy([pool.tokens[j].decimals]);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }
  }

  let apr = 0;
  try {
    const response = pool.ankrUrl
      ? await fetch(pool.ankrUrl).then(res => res.json())
      : await fetch(pool.staderUrl).then(res => res.json());

    const lsApr = pool.ankrUrl ? response.apy * 1 : response.value;

    apr = (lsApr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100;
    apr = pool.balancerChargesFee ? apr / 2 : apr;
  } catch (err) {
    console.error(`Error fetching ls yield for ${pool.name}`);
  }

  // console.log(pool.name, lsApr, apr);
  return apr;
};

const getMasterChefData = async () => {
  const masterchefContract = fetchContract(masterchef, BeethovenxChef, FANTOM_CHAIN_ID);
  const [blockRewards, totalAllocPoint] = await Promise.all([
    masterchefContract.read.beetsPerBlock().then(res => new BigNumber(res.toString())),
    masterchefContract.read.totalAllocPoint().then(res => new BigNumber(res.toString())),
  ]);
  return { blockRewards, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = fetchContract(masterchef, BeethovenxChef, FANTOM_CHAIN_ID);
  const balanceCalls = [];
  const allocPointCalls = [];
  const rewarderCalls = [];
  const tokenBPerSecCalls = [];
  pools.forEach(pool => {
    const tokenContract = fetchContract(pool.address, ERC20Abi, FANTOM_CHAIN_ID);
    balanceCalls.push(tokenContract.read.balanceOf([pool.strat ?? masterchef]));
    allocPointCalls.push(masterchefContract.read.poolInfo([pool.poolId]));
    rewarderCalls.push(masterchefContract.read.rewarder([pool.poolId]));
  });

  const res = await Promise.all([
    Promise.all(balanceCalls),
    Promise.all(allocPointCalls),
    Promise.all(rewarderCalls),
  ]);

  const balances = res[0].map(v => new BigNumber(v.toString()));
  const allocPoints = res[1].map(v => new BigNumber(v[0].toString()));
  const rewarders = res[2].map(v => v);

  pools.forEach((_, i) => {
    if (rewarders[i] !== '0x0000000000000000000000000000000000000000') {
      const rewarderContract = fetchContract(rewarders[i], BeethovenRewarder, FANTOM_CHAIN_ID);
      tokenBPerSecCalls.push(rewarderContract.read.rewardPerSecond());
    } else {
      tokenBPerSecCalls.push(NaN);
    }
  });

  const tokenRewardsMulticalls = await Promise.all(tokenBPerSecCalls);
  const tokenBRewardRates = tokenRewardsMulticalls.map(v => new BigNumber(v.toString()));

  return { balances, allocPoints, rewarders, tokenBRewardRates };
};

module.exports = getBeethovenxDualApys;
