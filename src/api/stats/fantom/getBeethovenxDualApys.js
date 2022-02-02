const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const fetchPrice = require('../../../utils/fetchPrice');
const BeethovenRewarder = require('../../../abis/fantom/BeethovenRewarder.json');
const { FANTOM_CHAIN_ID } = require('../../../constants');
const { getTradingFeeAprBalancer } = require('../../../utils/getTradingFeeApr');
const MasterChefAbi = require('../../../abis/fantom/BeethovenxChef.json');
const { fantomWeb3: web3, multicallAddress } = require('../../../utils/web3');
const pools = require('../../../data/fantom/beethovenxDualPools.json');
import { beetClient } from '../../../apollo/client';
import getBlockTime from '../../../utils/getBlockTime';
import { ERC20_ABI } from '../../../abis/common/ERC20';
import getApyBreakdown from '../common/getApyBreakdown';

const masterchef = '0x8166994d9ebBe5829EC86Bd81258149B87faCfd3';
const oracleIdA = 'BEETS';
const oracleA = 'tokens';
const DECIMALSA = '1e18';
const secondsPerYear = 31536000;
const liquidityProviderFee = 0.0075;
const burn = 0.128;

const getBeethovenxDualApys = async () => {
  const pairAddresses = pools.map(pool => pool.address);
  const tradingAprs = await getTradingFeeAprBalancer(
    beetClient,
    pairAddresses,
    liquidityProviderFee
  );

  const farmApys = await getFarmApys(pools);
  return getApyBreakdown(pools, tradingAprs, farmApys, liquidityProviderFee);
};

const getFarmApys = async pools => {
  const apys = [];

  const secondsPerBlock = await getBlockTime(FANTOM_CHAIN_ID);
  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: oracleIdA });
  const { blockRewards, totalAllocPoint } = await getMasterChefData();
  const { balances, allocPoints, rewarders } = await getPoolsData(pools);

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
      const masterchefContract = new web3.eth.Contract(MasterChefAbi, masterchef);

      if (rewarders[i] === '0x0000000000000000000000000000000000000000') {
        return 0;
      } else {
        const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
        const rewarderContract = new web3.eth.Contract(BeethovenRewarder, rewarders[i]);
        const tokenBPerSec = new BigNumber(await rewarderContract.methods.rewardPerSecond().call());
        const yearlyRewardsB = tokenBPerSec.dividedBy(secondsPerBlock).times(secondsPerYear);
        return yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
      }
    })();

    let yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);
    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    apys.push(apy);
  }

  return apys;
};

const getMasterChefData = async () => {
  const masterchefContract = new web3.eth.Contract(MasterChefAbi, masterchef);
  const blockRewards = new BigNumber(await masterchefContract.methods.beetsPerBlock().call());
  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  return { blockRewards, totalAllocPoint };
};

const getPoolsData = async pools => {
  const masterchefContract = new web3.eth.Contract(MasterChefAbi, masterchef);
  const multicall = new MultiCall(web3, multicallAddress(FANTOM_CHAIN_ID));
  const balanceCalls = [];
  const allocPointCalls = [];
  const rewarderCalls = [];
  pools.forEach(pool => {
    const tokenContract = new web3.eth.Contract(ERC20_ABI, pool.address);
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
  return { balances, allocPoints, rewarders };
};

module.exports = getBeethovenxDualApys;
