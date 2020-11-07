const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const SmartChef = require('../abis/SmartChef.json');
const ERC20 = require('../abis/ERC20.json');
const getBaseCakeApy = require('./getBaseCakeApy');
const { getCoingeckoPrice } = require('./getPrice');

const pools = [
  {
    name: 'cake-syrup-twt',
    smartChef: '0xAfd61Dc94f11A70Ae110dC0E0F2061Af5633061A',
    coingeckoId: 'trust-wallet-token',
    asset: '0x4B0F1812e5Df2A09796481Ff14017e6005508003',
    decimals: '1e18',
  },
  {
    name: 'cake-syrup-inj',
    smartChef: '0x92E8CeB7eAeD69fB6E4d9dA43F605D2610214E68',
    coingeckoId: 'injective-protocol',
    asset: '0xa2B726B1145A4773F68593CF171187d8EBe4d495',
    decimals: '1e18',
  },
  {
    name: 'cake-syrup-ctk',
    smartChef: '0xF35d63Df93f32e025bce4A1B98dcEC1fe07AD892',
    coingeckoId: 'certik',
    asset: '0xA8c2B8eec3d368C0253ad3dae65a5F2BBB89c929',
    decimals: '1e6',
  },
];

const web3 = new Web3(process.env.BSC_RPC);

const getCakeApys = async () => {
  const apys = {};
  const syrup = '0x009cF7bC57584b7998236eff51b98A168DceA9B0';

  const baseCakeApy = await getBaseCakeApy();

  for (const pool of pools) {
    const yearlyRewardsInUsd = await getYearlyRewardsInUsd(pool.smartChef, pool.coingeckoId, pool.decimals);
    const totalStakedInUsd = await getTotalStakedInUsd(pool.smartChef, 'pancakeswap-token', syrup);
    const apy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd).plus(baseCakeApy);
    apys[pool.name] = apy;
  }

  return apys;
};

const getYearlyRewardsInUsd = async (smartChefAddr, earnedAsset, decimals) => {
  const smartChefContract = new web3.eth.Contract(SmartChef, smartChefAddr);

  const currentBlock = await web3.eth.getBlockNumber();
  const bonusEndBlock = await smartChefContract.methods.bonusEndBlock().call();
  const isPoolRunning = currentBlock <= bonusEndBlock;

  if (!isPoolRunning) return new BigNumber(0);

  const blockRewards = new BigNumber(await smartChefContract.methods.rewardPerBlock().call());
  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = blockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);
  const earnedAssetPrice = await getCoingeckoPrice(earnedAsset);
  const yearlyRewardsInUsd = yearlyRewards.times(earnedAssetPrice).dividedBy(decimals);
  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async (poolAddr, coingeckoId, tokenAddr) => {
  const tokenPrice = await getCoingeckoPrice(coingeckoId);
  const tokenContract = await new web3.eth.Contract(ERC20, tokenAddr);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(poolAddr).call());
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

module.exports = getCakeApys;
