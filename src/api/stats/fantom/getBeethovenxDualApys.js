const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const fetchPrice = require('../../../utils/fetchPrice');
const BeethovenRewarder = require('../../../abis/fantom/BeethovenRewarder.json');
const { FANTOM_CHAIN_ID } = require('../../../constants');
const { getTradingFeeAprBalancerFTM } = require('../../../utils/getTradingFeeApr');
const MasterChefAbi = require('../../../abis/fantom/BeethovenxChef.json');
const { fantomWeb3: web3, multicallAddress } = require('../../../utils/web3');
const pools = require('../../../data/fantom/beethovenxDualPools.json');
import { beetClient } from '../../../apollo/client';
import getBlockTime from '../../../utils/getBlockTime';
import { ERC20_ABI } from '../../../abis/common/ERC20';
import getApyBreakdown from '../common/getApyBreakdown';
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
import { beethovenx } from '../../../../packages/address-book/address-book/fantom/platforms/beethovenx';
const IBalancerVault = require('../../../abis/IBalancerVault.json');

const masterchef = '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3';
const oracleIdA = 'BEETS';
const oracleA = 'tokens';
const DECIMALSA = '1e18';
const secondsPerYear = 31536000;
const liquidityProviderFee = 0.0075;
const burn = 0.128;

const getBeethovenxDualApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprBalancerFTM(
    beetClient,
    pairAddresses,
    liquidityProviderFee
  );

  const farmApys = await getFarmApys(pools);
  return getApyBreakdown(pools, tradingAprs, farmApys[0], liquidityProviderFee, farmApys[1]);
};

const getFarmApys = async pools => {
  const apys = [];
  const lsAprs = [];

  const secondsPerBlock = await getBlockTime(FANTOM_CHAIN_ID);
  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const { blockRewards, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints, rewarders, tokenBRewardRates } = await getPoolsData(pools);

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
    if (pool.staderls) {
      aprFixed = await getLiquidStakingPoolYield(pool);
    }
    lsAprs.push(aprFixed);
  }

  return [apys, lsAprs];
};

const getLiquidStakingPoolYield = async pool => {
  const balVault = getContractWithProvider(IBalancerVault, beethovenx.router, web3);
  const tokenQtys = await balVault.methods.getPoolTokens(pool.vaultPoolId).call();

  let qty = [];
  let totalQty = new BigNumber(0);
  for (let j = 0; j < tokenQtys.balances.length; j++) {
    if (pool.composable) {
      if (j != pool.bptIndex) {
        const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
        const amt = new BigNumber(tokenQtys.balances[j])
          .times(price)
          .dividedBy([pool.tokens[j].decimals]);
        totalQty = totalQty.plus(amt);
        qty.push(amt);
      }
    } else {
      const price = await fetchPrice({ oracle: 'tokens', id: pool.tokens[j].oracleId });
      const amt = new BigNumber(tokenQtys.balances[j])
        .times(price)
        .dividedBy([pool.tokens[j].decimals]);
      totalQty = totalQty.plus(amt);
      qty.push(amt);
    }
  }

  let apr = 0;
  const lsApr = 4.7;
  try {
    apr = (lsApr * qty[pool.lsIndex].dividedBy(totalQty).toNumber()) / 100;
    apr = pool.balancerChargesFee ? apr / 2 : apr;
  } catch (err) {
    console.error(`Error fetching ls yield for ${pool.name}`);
  }

  // console.log(pool.name, lsApr, apr);
  return apr;
};

const getMasterChefData = async () => {
  const masterchefContract = getContractWithProvider(MasterChefAbi, masterchef, web3);
  const blockRewards = new BigNumber(await masterchefContract.methods.beetsPerBlock().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { blockRewards, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = getContract(MasterChefAbi, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(FANTOM_CHAIN_ID));
  const balanceCalls = [];
  const allocPointCalls = [];
  const rewarderCalls = [];
  const tokenBPerSecCalls = [];
  pools.forEach(pool => {
    const tokenContract = getContract(ERC20_ABI, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(pool.strat ?? masterchef),
    });
    allocPointCalls.push({
      allocPoint: masterchefContract.methods.poolInfo(pool.poolId),
    });
    let rewarder = masterchefContract.methods.rewarder(pool.poolId);
    rewarderCalls.push({
      rewarder: rewarder,
    });
  });

  const res = await multicall.all([balanceCalls, allocPointCalls, rewarderCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.allocPoint[0]);
  const rewarders = res[2].map(v => v.rewarder);

  pools.forEach((pool, i) => {
    if (rewarders[i] !== '0x0000000000000000000000000000000000000000') {
      const rewarderContract = getContractWithProvider(BeethovenRewarder, rewarders[i], web3);
      const tokenBPerSec = rewarderContract.methods.rewardPerSecond();
      tokenBPerSecCalls.push({
        tokenBPerSec: tokenBPerSec,
      });
    }
  });

  const tokenRewardsMulticalls = await multicall.all([tokenBPerSecCalls]);
  const tokenBRewardRates = tokenRewardsMulticalls[0].map(v => new BigNumber(v.tokenBPerSec));

  return { balances, allocPoints, rewarders, tokenBRewardRates };
};

module.exports = getBeethovenxDualApys;
