import { getTradingFeeApr } from '../../../../utils/getTradingFeeApr';
import getApyBreakdown from '../../common/getApyBreakdown';

const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');
const PacocaFarm = require('../../../../abis/PacocaFarm.json');
const AutoStrat = require('../../../../abis/AutoStratX.json');
const MasterChef = require('../../../../abis/MasterChef.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const lpPools = require('../../../../data/degens/pacocaLpPools.json');
const { BSC_CHAIN_ID, APE_LPF } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const ERC20 = require('../../../../abis/ERC20.json');
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

  const farmApys = await Promise.all(promises);
  const tradingAprs = await getTradingAprs(pools);
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
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.cakePerBlock().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.uPoolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
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
  const farmContract = new web3.eth.Contract(PacocaFarm, farm);

  const multiplier = new BigNumber(
    await farmContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await farmContract.methods.PACOCAPerBlock().call());

  let { allocPoint } = await farmContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await farmContract.methods.totalAllocPoint().call());
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
  const tokenPairContract = new web3.eth.Contract(ERC20, pool.address);
  const totalStaked = new BigNumber(await tokenPairContract.methods.balanceOf(masterchef).call());
  const tokenPrice = await fetchPrice({
    oracle: pool.oracle ?? 'lps',
    id: pool.oracleId ?? pool.name,
  });
  return totalStaked.times(tokenPrice).dividedBy('1e18');
};

const getTotalLpStakedInUsd = async pool => {
  const strategyContract = new web3.eth.Contract(AutoStrat, pool.strat);
  const totalStaked = new BigNumber(await strategyContract.methods.wantLockedTotal().call());
  const tokenPrice = await fetchPrice({
    oracle: pool.oracle ?? 'lps',
    id: pool.oracleId ?? pool.name,
  });
  return totalStaked.times(tokenPrice).dividedBy('1e18');
};

module.exports = getPacocaApys;
