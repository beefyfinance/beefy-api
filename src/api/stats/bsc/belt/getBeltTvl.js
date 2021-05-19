const axios = require('axios');
const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const getBeltPrices = require('./getBeltPrices');
const MasterBelt = require('../../../../abis/bsc/StrategyAutoBeltToken.json');
const VaultPool = require('../../../../abis/BeltVaultPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/beltPools.json');
const { compound } = require('../../../../utils/compound');
const { BSC_CHAIN_ID } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');

const masterbelt = '0xD4BbC80b9B102b77B21A06cb77E954049605E6c1';
const oracleId = 'BELT';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getBeltTvl = async () => {
  let tvl = {};

  let promises = [];
  pools.forEach(pool =>
    promises.push(getVaultTvl(MasterBelt, '0x5Df9cE05EA92Af1EA324996d12f139847AF3dFC7'))
  );
  const values = await Promise.all(promises);

  for (item of values) {
    tvl = { ...tvl, ...item };
  }

  return tvl;
};

const getVaultTvl = async (StrategyABI, strategyAddress) => {
  return getTotalTvlStakedInUsd(StrategyABI, strategyAddress);
};

getTotalTvlStakedInUsd = async (StrategyABI, strategyAddress) => {
  const beltStratContract = new web3.eth.Contract(StrategyABI, strategyAddress);
  const balanceOfWantLocked = new BigNumber(await beltStratContract.methods.balanceOf().call());
  let tokenPrices = {};
  const beltLPs = await getBeltPrices(tokenPrices);
  console.log('>' + JSON.stringify(beltLPs));
  console.log('>price' + beltLPs['belt-4belt']);
  return balanceOfWantLocked.times(BigNumber(beltLPs['belt-4belt']).dividedBy(DECIMALS));
};

/*const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool),
  ]);
  let simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const baseApy = await fetchBeltLpBaseApr(pool);
  const apy = compound(baseApy + simpleApy * 0.955, process.env.BASE_HPY, 1);
  // console.log(pool.name, baseApy.valueOf(), simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());
  return { [pool.name]: apy };
};


const getTotalLpStakedInUsd = async (masterbelt, pool) => {
  const masterbeltContract = new web3.eth.Contract(MasterBelt, masterbelt);
  let { strat } = await masterbeltContract.methods.poolInfo(pool.poolId).call();

  const poolContract = new web3.eth.Contract(VaultPool, strat);
  const wantLockedTotal = new BigNumber(await poolContract.methods.wantLockedTotal().call());
  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  return wantLockedTotal.times(tokenPrice).dividedBy(DECIMALS);
};*/

module.exports = getBeltTvl;
