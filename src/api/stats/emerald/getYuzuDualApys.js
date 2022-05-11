const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { emeraldWeb3: web3, multicallAddress } = require('../../../utils/web3');

const MasterChef = require('../../../abis/emerald/YuzuChef.json');
const MasterChefExt = require('../../../abis/emerald/YuzuMasterchefExt.json');
import SimpleRewarder from '../../../abis/emerald/Rewarder.json';
const ERC20 = require('../../../abis/ERC20.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/emerald/yuzuDualLpPools.json');
const { BASE_HPY, EMERALD_CHAIN_ID: chainId } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getContract, getContractWithProvider } from '../../../utils/contractHelper';
const getBlockTime = require('../../../utils/getBlockTime');
const {
  emerald: {
    platforms: {
      yuzu: { masterchef, masterchefExt },
    },
    tokens: { YUZU },
  },
} = addressBook;

const beefyPerformanceFee = 0.045;
const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;

const oracleA = 'tokens';
const DECIMALSA = '1e18';

const secondsPerYear = 31536000;

const getYuzuDualApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  const tokenPriceA = await fetchPrice({ oracle: oracleA, id: 'YUZU' });
  const { rewardPerSecond, totalAllocPoint, totalAllocPointMC, masterChefExtAlloc } =
    await getMasterChefData();
  const { balances, allocPoints, rewarders } = await getPoolsData(pools);
  const secondsPerBlock = await getBlockTime(chainId);
  const rewardPerBlock = rewardPerSecond
    .times(new BigNumber(masterChefExtAlloc[1]))
    .dividedBy(totalAllocPointMC);

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];

    const lpPrice = await fetchPrice({ oracle: 'lps', id: pool.name });
    const totalStakedInUsd = balances[i].times(lpPrice).dividedBy('1e18');

    const poolBlockRewards = rewardPerBlock.times(allocPoints[i]).dividedBy(totalAllocPoint);
    const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
    const yearlyRewardsAInUsd = yearlyRewards.times(tokenPriceA).dividedBy(DECIMALSA);

    const yearlyRewardsBInUsd = await (async () => {
      if (rewarders[i] === '0x0000000000000000000000000000000000000000') {
        return 0;
      } else {
        const tokenPriceB = await fetchPrice({ oracle: pool.oracleB, id: pool.oracleIdB });
        const rewarderContract = getContractWithProvider(SimpleRewarder, rewarders[i], web3);
        const tokenBPerSec = new BigNumber(await rewarderContract.methods.tokenPerBlock().call());
        const yearlyRewardsB = tokenBPerSec.dividedBy(secondsPerBlock).times(secondsPerYear);
        return yearlyRewardsB.times(tokenPriceB).dividedBy(pool.decimalsB);
      }
    })();

    const yearlyRewardsInUsd = yearlyRewardsAInUsd.plus(yearlyRewardsBInUsd);

    const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
    const vaultApr = simpleApy.times(shareAfterBeefyPerformanceFee);
    const vaultApy = compound(simpleApy, BASE_HPY, 1, shareAfterBeefyPerformanceFee);

    // console.log(pool.name, simpleApy.valueOf(), vaultApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

    // Create reference for legacy /apy
    const legacyApyValue = { [pool.name]: vaultApy };

    apys = { ...apys, ...legacyApyValue };

    // Create reference for breakdown /apy
    const componentValues = {
      [pool.name]: {
        vaultApr: vaultApr.toNumber(),
        compoundingsPerYear: BASE_HPY,
        beefyPerformanceFee: beefyPerformanceFee,
        vaultApy: vaultApy,
        lpFee: 0,
        tradingApr: 0,
        totalApy: vaultApy,
      },
    };

    apyBreakdowns = { ...apyBreakdowns, ...componentValues };
  }

  // Return both objects for later parsing
  return {
    apys,
    apyBreakdowns,
  };
};

const getMasterChefData = async () => {
  const masterchefContract = getContractWithProvider(MasterChef, masterchef, web3);
  const masterchefContractExt = getContractWithProvider(MasterChefExt, masterchefExt, web3);
  const rewardPerSecond = new BigNumber(await masterchefContract.methods.yuzuPerBlock().call());
  const totalAllocPointMC = new BigNumber(
    await masterchefContract.methods.totalAllocPoint().call()
  );
  const totalAllocPoint = new BigNumber(
    await masterchefContractExt.methods.totalAllocPoint().call()
  );
  const masterChefExtAlloc = await masterchefContract.methods.poolInfo(5).call();
  return { rewardPerSecond, totalAllocPoint, totalAllocPointMC, masterChefExtAlloc };
};

const getPoolsData = async pools => {
  const masterchefContract = getContract(MasterChefExt, masterchefExt);
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const balanceCalls = [];
  const poolInfoCalls = [];
  const rewarderCalls = [];
  pools.forEach(pool => {
    const tokenContract = getContract(ERC20, pool.address);
    balanceCalls.push({
      balance: tokenContract.methods.balanceOf(masterchefExt),
    });
    let poolInfo = masterchefContract.methods.poolInfo(pool.poolId);
    poolInfoCalls.push({
      poolInfo: poolInfo,
    });
    rewarderCalls.push({
      rewarder: masterchefContract.methods.poolRewarders(pool.poolId),
    });
  });

  const res = await multicall.all([balanceCalls, poolInfoCalls, rewarderCalls]);

  const balances = res[0].map(v => new BigNumber(v.balance));
  const allocPoints = res[1].map(v => v.poolInfo['1']);
  const rewarders = res[2].map(v => v.rewarder['0']);
  return { balances, allocPoints, rewarders };
};

module.exports = getYuzuDualApys;
