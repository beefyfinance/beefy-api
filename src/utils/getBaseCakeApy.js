const axios = require('axios');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const MasterChef = require('../abis/MasterChef.json');
const ERC20 = require('../abis/ERC20.json');

const web3 = new Web3('https://bsc-dataseed1.defibit.io/');

const getBaseCakeApy = async () => {
  const masterChef = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';
  const cake = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82';
  const coingeckoId = 'pancakeswap-token';

  const yearlyRewardsInUsd = await getYearlyRewardsInUsd(masterChef);
  const totalStakedInUsd = await getTotalStakedInUsd(masterChef, coingeckoId, cake);

  return yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
};

const getYearlyRewardsInUsd = async masterChefAddr => {
  const fromBlock = await web3.eth.getBlockNumber();
  const toBlock = fromBlock + 1;
  const masterChefContract = new web3.eth.Contract(MasterChef, masterChefAddr);

  const multiplier = new BigNumber(await masterChefContract.methods.getMultiplier(fromBlock, toBlock).call());
  const blockRewards = new BigNumber(await masterChefContract.methods.cakePerBlock().call());

  let { allocPoint } = await masterChefContract.methods.poolInfo(0).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterChefContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards.times(multiplier).times(allocPoint).dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const cakePrice = await getPrice('pancakeswap-token');
  const yearlyRewardsInUsd = yearlyRewards.times(cakePrice).dividedBy('1e18');

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (poolAddr, coingeckoId, tokenAddr) => {
  const tokenPrice = await getPrice(coingeckoId);
  const tokenContract = await new web3.eth.Contract(ERC20, tokenAddr);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(poolAddr).call());
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

const getPrice = async id => {
  const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
    params: {
      ids: id,
      vs_currencies: 'usd',
    },
  });
  return response.data[id].usd;
};

module.exports = getBaseCakeApy;
