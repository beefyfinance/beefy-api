import AutoStratX from '../../../../abis/AutoStratX';
import ERC20Abi from '../../../../abis/ERC20Abi';
import MasterChef from '../../../../abis/MasterChef';
import PacocaFarm from '../../../../abis/PacocaFarm';
import { getTradingFeeApr } from '../../../../utils/getTradingFeeApr';
import { fetchContract } from '../../../rpc/client';
import getApyBreakdown from '../../common/getApyBreakdown';

const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../../utils/fetchPrice');
const lpPools = require('../../../../data/degens/pacocaLpPools.json');
const { BSC_CHAIN_ID, APE_LPF } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const { apeClient } = require('../../../../apollo/client');

const farm = '0x55410D946DFab292196462ca9BE9f3E4E4F337Dd';
const apeswapChef = '0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9';
const oracleId = 'PACOCA';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getPacocaApys = async () => {
  let promises = [];
  const pools = [
    ...lpPools,
    {
      name: 'pacoca-pacoca',
      poolId: 0,
      address: '0x55671114d774ee99D653D6C12460c780a67f1D18',
      strat: '0x705dA3639Ebb5F8255a520d6e9d016F5a3eBce8D',
      oracle: 'tokens',
      oracleId: 'PACOCA',
      decimals: '1e18',
    },
  ];
  pools.forEach(pool => promises.push(getPoolApy(apeswapChef, farm, pool)));

  const [farmApys, tradingAprs] = await Promise.all([Promise.all(promises), getTradingAprs(pools)]);
  return getApyBreakdown(pools, tradingAprs, farmApys, APE_LPF);
};

const getTradingAprs = async pools => {
  let tradingAprs = [];
  const client = apeClient;
  const fee = APE_LPF;
  if (client && fee) {
    const pairAddresses = pools.map(pool => pool.address.toLowerCase());
    tradingAprs = await getTradingFeeApr(client, pairAddresses, fee);
  }
  return tradingAprs;
};

const getPoolApy = async (masterchef, farm, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd, stratYearlyRewardsInUsd, stratTotalStakedInUsd] =
    await Promise.all([
      getYearlyRewardsInUsd(farm, pool),
      getTotalLpStakedInUsd(pool),
      getStratYearlyRewardsInUsd(masterchef, pool),
      getStratTotalLpStakedInUsd(masterchef, pool),
    ]);
  const simpleApyFarm = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const simpleApyStrat = stratYearlyRewardsInUsd.dividedBy(stratTotalStakedInUsd);
  const simpleApy = simpleApyStrat.plus(simpleApyFarm);
  // console.log(pool.name, simpleApyStrat.valueOf(), simpleApyFarm.valueOf(), simpleApy.valueOf(), totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return simpleApy;
};

const getStratYearlyRewardsInUsd = async (masterchef, pool) => {
  if (!pool.uPoolId) return new BigNumber(0);

  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterchefContract = fetchContract(masterchef, MasterChef, BSC_CHAIN_ID);

  const [multiplier, blockRewards, allocPoint, totalAllocPoint] = await Promise.all([
    masterchefContract.read
      .getMultiplier([blockNum - 1, blockNum])
      .then(v => new BigNumber(v.toString())),
    masterchefContract.read.cakePerBlock().then(v => new BigNumber(v.toString())),
    masterchefContract.read.poolInfo([pool.uPoolId]).then(v => new BigNumber(v[1].toString())),
    masterchefContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);

  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle: 'tokens', id: 'BANANA' });
  return yearlyRewards.times(tokenPrice).dividedBy('1e18');
};

const getYearlyRewardsInUsd = async (farm, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const farmContract = fetchContract(farm, PacocaFarm, BSC_CHAIN_ID);

  const [multiplier, blockRewards, allocPoint, totalAllocPoint] = await Promise.all([
    farmContract.read
      .getMultiplier([blockNum - 1, blockNum])
      .then(v => new BigNumber(v.toString())),
    farmContract.read.PACOCAPerBlock().then(v => new BigNumber(v.toString())),
    farmContract.read.poolInfo([pool.poolId]).then(v => new BigNumber(v[1].toString())),
    farmContract.read.totalAllocPoint().then(v => new BigNumber(v.toString())),
  ]);

  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  return yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);
};

const getStratTotalLpStakedInUsd = async (masterchef, pool) => {
  if (!pool.uPoolId) return new BigNumber(1);
  const tokenPairContract = fetchContract(pool.address, ERC20Abi, BSC_CHAIN_ID);
  const totalStaked = new BigNumber(
    (await tokenPairContract.read.balanceOf([masterchef])).toString()
  );
  const tokenPrice = await fetchPrice({
    oracle: pool.oracle ?? 'lps',
    id: pool.oracleId ?? pool.name,
  });
  return totalStaked.times(tokenPrice).dividedBy('1e18');
};

const getTotalLpStakedInUsd = async pool => {
  const strategyContract = fetchContract(pool.strat, AutoStratX, BSC_CHAIN_ID);
  const totalStaked = new BigNumber((await strategyContract.read.wantLockedTotal()).toString());
  const tokenPrice = await fetchPrice({
    oracle: pool.oracle ?? 'lps',
    id: pool.oracleId ?? pool.name,
  });
  return totalStaked.times(tokenPrice).dividedBy('1e18');
};

module.exports = getPacocaApys;
