const BigNumber = require('bignumber.js');
const { avaxWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/pangolinLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../../constants');

const oracle = 'tokens';
const oracleId = 'PNG';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const usdtAvaxRewardPool = '0x4f019452f51bbA0250Ec8B69D64282B79fC8BD9f'; // USDT-AVAX
const pngAvaxRewardPool = '0x8FD2755c6ae7252753361991bDcd6fF55bDc01CE'; // PNG-AVAX
const ethAvaxRewardPool = '0xa16381eae6285123c323A665D4D99a6bCfaAC307'; // ETH-AVAX
const wbtcAvaxRewardPool = '0x01897e996EEfFf65AE9999C02D1d8D7E9e0C0352'; // WBTC-AVAX
const linkAvaxRewardPool = '0x7d7eCd4d370384B17DFC1b4155a8410e97841B65'; // LINK-AVAX
const sushiAvaxRewardPool = '0x88f26b81c9cae4ea168e31BC6353f493fdA29661'; // SUSHI-AVAX
const uniAvaxRewardPool = '0xe4d9aE03859DaC6d65432d557F75b9b588a38eE1'; // UNI-AVAX
const usdtPngRewardPool = '0x7accC6f16Bf8c0Dce22371fbD914c6B5b402BF9f'; // USDT-PNG

const getPangolinLpApys = async () => {
  let poolUsdtAvax = pools.filter(pool => pool.name === 'png-usdt-avax')[0];
  let poolPngAvax = pools.filter(pool => pool.name === 'png-png-avax')[0];
  let poolEthAvax = pools.filter(pool => pool.name === 'png-eth-avax')[0];
  let poolWbtcAvax = pools.filter(pool => pool.name === 'png-wbtc-avax')[0];
  let poolLinkAvax = pools.filter(pool => pool.name === 'png-link-avax')[0];
  let poolSushiAvax = pools.filter(pool => pool.name === 'png-sushi-avax')[0];
  let poolUniAvax = pools.filter(pool => pool.name === 'png-uni-avax')[0];
  let poolUsdtPng = pools.filter(pool => pool.name === 'png-usdt-png')[0];

  const values = await Promise.all([
    getPoolApy(usdtAvaxRewardPool, poolUsdtAvax, 43114),
    getPoolApy(pngAvaxRewardPool, poolPngAvax, 43114),
    getPoolApy(ethAvaxRewardPool, poolEthAvax, 43114),
    getPoolApy(wbtcAvaxRewardPool, poolWbtcAvax, 43114),
    getPoolApy(linkAvaxRewardPool, poolLinkAvax, 43114),
    getPoolApy(sushiAvaxRewardPool, poolSushiAvax, 43114),
    getPoolApy(uniAvaxRewardPool, poolUniAvax, 43114),
    getPoolApy(usdtPngRewardPool, poolUsdtPng, 43114),
  ]);

  let apys = {};
  for (item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

const getPoolApy = async (rewardPool, pool, chainId) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(rewardPool),
    getTotalLpStakedInUsd(rewardPool, pool, chainId),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, BASE_HPY, 1, 0.955);
  // console.log(pool.name, simpleApy.valueOf(), apy);
  return { [pool.name]: apy };
};

const getYearlyRewardsInUsd = async pngRewardPool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, pngRewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getPangolinLpApys;