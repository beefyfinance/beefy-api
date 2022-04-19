const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');
const fetch = require('node-fetch');

const MasterBelt = require('../../../../abis/MasterBelt.json');
const VaultPool = require('../../../../abis/BeltVaultPool.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const pools = require('../../../../data/beltPools.json');
const { compound } = require('../../../../utils/compound');
const {
  BSC_CHAIN_ID,
  BASE_HPY,
  BEEFY_PERFORMANCE_FEE,
  SHARE_AFTER_PERFORMANCE_FEE,
} = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const { getContractWithProvider } = require('../../../../utils/contractHelper');

const masterbelt = '0xD4BbC80b9B102b77B21A06cb77E954049605E6c1';
const oracleId = 'BELT';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getBeltApys = async () => {
  let apys = {};
  let apyBreakdowns = {};

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(masterbelt, pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item.apy };
    apyBreakdowns = { ...apyBreakdowns, ...item.apyBreakdown };
  }

  return {
    apys,
    apyBreakdowns,
  };
};

const getPoolApy = async (masterchef, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool),
  ]);
  let simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const baseApy = await fetchBeltLpBaseApr(pool);
  const apy = compound(baseApy + simpleApy * 0.955, BASE_HPY, 1, 1);
  // console.log(pool.name, baseApy.valueOf(), simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

  const apyBreakdown = {
    vaultApr: simpleApy.toNumber(),
    compoundingsPerYear: BASE_HPY,
    beefyPerformanceFee: BEEFY_PERFORMANCE_FEE,
    vaultApy: compound(simpleApy, BASE_HPY, 1, SHARE_AFTER_PERFORMANCE_FEE),
    lpFee: 0.001,
    tradingApr: baseApy,
    totalApy: compound(baseApy + simpleApy * 0.955, BASE_HPY, 1, 1),
  };

  return {
    apy: { [pool.name]: apy },
    apyBreakdown: { [pool.name]: apyBreakdown },
  };
};

const fetchBeltLpBaseApr = async pool => {
  if (pool.poolId === 11) return 0;
  try {
    let response = await fetch('https://s.belt.fi/info/all.json').then(res => res.json());
    const data = response.info.BSC;

    let apr;
    if (pool.vault) {
      const vault = data.vaults.filter(p => p.name === pool.vault)[0];
      apr = Number(vault.baseAPR) / 100;
    } else {
      const vault = data.vaultPools.filter(p => Number(p.pid) === pool.poolId)[0];
      const baseApr = Number(vault.baseAPR) / 100;
      const feeApr = Number(vault.feeAPR) / 100;
      apr = baseApr + feeApr;
    }
    return apr;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

const getTotalLpStakedInUsd = async (masterbelt, pool) => {
  const masterbeltContract = getContractWithProvider(MasterBelt, masterbelt, web3);
  let { strat } = await masterbeltContract.methods.poolInfo(pool.poolId).call();

  const poolContract = getContractWithProvider(VaultPool, strat, web3);
  const wantLockedTotal = new BigNumber(await poolContract.methods.wantLockedTotal().call());
  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  return wantLockedTotal.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async (masterbelt, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterbeltContract = getContractWithProvider(MasterBelt, masterbelt, web3);

  const multiplier = new BigNumber(
    await masterbeltContract.methods.getMultiplier(blockNum - 1, blockNum).call()
  );
  const blockRewards = new BigNumber(await masterbeltContract.methods.BELTPerBlock().call());

  let { allocPoint } = await masterbeltContract.methods.poolInfo(pool.poolId).call();
  allocPoint = new BigNumber(allocPoint);

  const totalAllocPoint = new BigNumber(await masterbeltContract.methods.totalAllocPoint().call());
  const poolBlockRewards = blockRewards
    .times(multiplier)
    .times(allocPoint)
    .dividedBy(totalAllocPoint);

  const secondsPerBlock = 3;
  const secondsPerYear = 31536000;
  const yearlyRewards = poolBlockRewards.dividedBy(secondsPerBlock).times(secondsPerYear);

  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getBeltApys;
