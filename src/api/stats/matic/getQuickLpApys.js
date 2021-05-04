const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const pools = require('../../../data/matic/quickLpPools.json');
const { compound } = require('../../../utils/compound');
const { getTotalLpStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const { BASE_HPY } = require('../../../constants');

const oracle = 'tokens';
const oracleId = 'QUICK';

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const maticQuickRewardPool = '0x7Ca29F0DB5Db8b88B332Aa1d67a2e89DfeC85E7E'; // Matic-Quick
const ethMaticRewardPool = '0x8FF56b5325446aAe6EfBf006a4C1D88e4935a914'; // Eth-Matic
const ethBtcRewardPool = '0x070D182EB7E9C3972664C959CE58C5fC6219A7ad'; // Eth-Btc
const ethUsdtRewardPool = '0xB26bfcD52D997211C13aE4C35E82ced65AF32A02'; // Eth-Usdt
const usdcUsdtRewardPool = '0x251d9837a13F38F3Fe629ce2304fa00710176222'; // Usdc-Usdt
const linkEthRewardPool = '0x97D69E23DF7BBB01F9eA78b5651cb6ad125D6d9a'; // Link-Eth
const aaveEthRewardPool = '0x573bb5CCC26222d8108EdaCFcC7F7cb9e388Af10'; // Aave-Eth
const maUsdcUsdcRewardPool = '0x9Aac6390103C1Af774220aaB85bEB49Ae2DF11d6'; // maUSDC-USDC
const quickEthRewardPool = '0xD1C762861AAe85dF2e586a668A793AAfF820932b'; // Quick-ETH
const celEthRewardPool = '0x8917692e0Bdb47AF1D36837805E141Ed79065dFC'; // Cel-ETH
const wiseEthRewardPool = '0xb11856d3Aea0203e50B8520479C6332daBcF3f82'; // WISE-ETH
const defi5EthRewardPool = '0xf563fAe71bDAcDD370098CeCff14dbe2c9518a6b'; // Defi5-ETH
const ubtEthRewardPool = '0x219670F92CC0e0ef1C16BDB0aE266F0472930906'; // UBT-ETH

// TODO rewrite it, put the rewardPool address inside quickLpPools.json
const getQuickLpApys = async () => {
  let poolMaticQuick = pools.filter(pool => pool.name === 'quick-quick-matic')[0];
  let poolEthMatic = pools.filter(pool => pool.name === 'quick-eth-matic')[0];
  let poolEthBtc = pools.filter(pool => pool.name === 'quick-eth-btc')[0];
  let poolEthUsdt = pools.filter(pool => pool.name === 'quick-eth-usdt')[0];
  let poolUsdcUsdt = pools.filter(pool => pool.name === 'quick-usdc-usdt')[0];
  let poolLinkEth = pools.filter(pool => pool.name === 'quick-link-eth')[0];
  let poolAaveEth = pools.filter(pool => pool.name === 'quick-aave-eth')[0];
  let poolmaUsdcUsdc = pools.filter(pool => pool.name === 'quick-mausdc-usdc')[0];
  let poolQuickEth = pools.filter(pool => pool.name === 'quick-quick-eth')[0];
  let poolCelEth = pools.filter(pool => pool.name === 'quick-cel-eth')[0];
  let poolWiseEth = pools.filter(pool => pool.name === 'quick-wise-eth')[0];
  let poolDefi5Eth = pools.filter(pool => pool.name === 'quick-defi5-eth')[0];
  let poolUbtEth = pools.filter(pool => pool.name === 'quick-ubt-eth')[0];

  let apys = {};
  let apy = await getPoolApy(maticQuickRewardPool, poolMaticQuick, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(ethMaticRewardPool, poolEthMatic, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(ethBtcRewardPool, poolEthBtc, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(ethUsdtRewardPool, poolEthUsdt, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(usdcUsdtRewardPool, poolUsdcUsdt, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(linkEthRewardPool, poolLinkEth, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(aaveEthRewardPool, poolAaveEth, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(maUsdcUsdcRewardPool, poolmaUsdcUsdc, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(quickEthRewardPool, poolQuickEth, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(celEthRewardPool, poolCelEth, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(wiseEthRewardPool, poolWiseEth, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(defi5EthRewardPool, poolDefi5Eth, 137);
  apys = { ...apys, ...apy };
  apy = await getPoolApy(ubtEthRewardPool, poolUbtEth, 137);
  apys = { ...apys, ...apy };

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

const getYearlyRewardsInUsd = async RewardPool => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });

  const rewardPool = new web3.eth.Contract(IRewardPool, RewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getQuickLpApys;