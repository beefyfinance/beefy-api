const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const MasterChef = require('../../../abis/MasterChef.json');
const ERC20 = require('../../../abis/ERC20.json');
const { getPrice } = require('../../../utils/getPrice');
const pools = require('../../../data/cakeLpPools.json');
const { compound } = require('../../../utils/compound');

const web3 = new Web3(process.env.BSC_RPC_2 || process.env.BSC_RPC);

const getCakeLpApys = async () => {
  let apys = {};
  const masterchef = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterchef, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalStakedInUsd(masterchef, pool),
  ]);
  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.CAKE_LP_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await web3.eth.getBlockNumber();
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(
    await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterchefContract.methods.cakePerBlock().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const cakePrice = await getPrice('pancake', 'Cake');
  const yearlyRewardsInUsd = yearlyRewards.times(cakePrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (masterchef, pool) => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, pool.address);
  const totalStaked = new BigNumber(await tokenPairContract.methods.balanceOf(masterchef).call());
  const tokenPrice = await getLpTokenPrice(pool);
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

const getLpTokenPrice = async pool => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, pool.address);
  const totalSupply = await tokenPairContract.methods.totalSupply().call();

  const token0Contract = await new web3.eth.Contract(ERC20, pool.lp0.address);
  const reserve0 = new BigNumber(await token0Contract.methods.balanceOf(pool.address).call());
  const token0Price = await getPrice(pool.lp0.oracle, pool.lp0.oracleId);
  const token0StakedInUsd = reserve0.times(token0Price);

  const token1Contract = await new web3.eth.Contract(ERC20, pool.lp1.address);
  const reserve1 = new BigNumber(await token1Contract.methods.balanceOf(pool.address).call());
  const token1Price = await getPrice(pool.lp1.oracle, pool.lp1.oracleId);
  const token1StakedInUsd = reserve1.times(token1Price);

  const totalStakedInUsd = token0StakedInUsd.plus(token1StakedInUsd);
  const lpTokenPrice = totalStakedInUsd.dividedBy(totalSupply);

  return lpTokenPrice;
};

module.exports = getCakeLpApys;
