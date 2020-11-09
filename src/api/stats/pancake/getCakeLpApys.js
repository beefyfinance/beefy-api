const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const MasterChef = require('../../../abis/MasterChef.json');
const ERC20 = require('../../../abis/ERC20.json');
const { getPancakeswapPrice } = require('../../../utils/getPrice');

const web3 = new Web3(process.env.BSC_RPC);

const pools = [
  {
    name: 'cake-cake-bnb',
    address: '0xA527a61703D82139F8a06Bc30097cC9CAA2df5A6',
    poolId: 1,
    lp0: {
      address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
      oracleId: 'Cake',
    },
    lp1: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      oracleId: 'WBNB',
    },
  },
  {
    name: 'cake-busd-bnb',
    address: '0x1B96B92314C44b159149f7E0303511fB2Fc4774f',
    poolId: 2,
    lp0: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      oracleId: 'WBNB',
    },
    lp1: {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      oracleId: 'BUSD',
    },
  },
  {
    name: 'cake-usdt-busd',
    address: '0xc15fa3E22c912A276550F3E5FE3b0Deb87B55aCd',
    poolId: 11,
    lp0: {
      address: '0x55d398326f99059fF775485246999027B3197955',
      oracleId: 'USDT',
    },
    lp1: {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      oracleId: 'BUSD',
    },
  },
  {
    name: 'cake-btcb-bnb',
    address: '0x7561EEe90e24F3b348E1087A005F78B4c8453524',
    poolId: 15,
    lp0: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      oracleId: 'WBNB',
    },
    lp1: {
      address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
      oracleId: 'BTCB',
    },
  },
];

const getCakeLpApys = async () => {
  let apys = {};
  const masterchef = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';

  for (pool of pools) {
    const yearlyRewardsInUsd = await getYearlyRewardsInUsd(masterchef, pool);
    const totalStakedInUsd = await getTotalStakedInUsd(masterchef, pool);
    apys[pool.name] = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  }

  return apys;
};

const getYearlyRewardsInUsd = async (masterchef, pool) => {
  const blockNum = await web3.eth.getBlockNumber();
  const masterchefContract = new web3.eth.Contract(MasterChef, masterchef);

  const multiplier = new BigNumber(await masterchefContract.methods.getMultiplier(blockNum - 1, blockNum).call());
  const blockRewards = new BigNumber(await masterchefContract.methods.cakePerBlock().call());

  let { allocPoint } = await masterchefContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterchefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(multiplier).times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const cakePrice = await getPancakeswapPrice('Cake');
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
  const token0Price = await getPancakeswapPrice(pool.lp0.oracleId);
  const token0StakedInUsd = reserve0.times(token0Price);

  const token1Contract = await new web3.eth.Contract(ERC20, pool.lp1.address);
  const reserve1 = new BigNumber(await token1Contract.methods.balanceOf(pool.address).call());
  const token1Price = await getPancakeswapPrice(pool.lp1.oracleId);
  const token1StakedInUsd = reserve1.times(token1Price);

  const totalStakedInUsd = token0StakedInUsd.plus(token1StakedInUsd);
  const lpTokenPrice = totalStakedInUsd.dividedBy(totalSupply);

  return lpTokenPrice;
};

module.exports = getCakeLpApys;
