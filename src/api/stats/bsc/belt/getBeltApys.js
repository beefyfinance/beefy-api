const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../../utils/fetchPrice';
const pools = require('../../../../data/beltPools.json');
const { compound } = require('../../../../utils/compound');
const { BSC_CHAIN_ID, BASE_HPY } = require('../../../../constants');
const getBlockNumber = require('../../../../utils/getBlockNumber');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');
const { default: MasterBelt } = require('../../../../abis/MasterBelt');
const { fetchContract } = require('../../../rpc/client');
const { default: BeltVaultPool } = require('../../../../abis/BeltVaultPool');

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
  const [yearlyRewardsInUsd, totalStakedInUsd, baseApy] = await Promise.all([
    getYearlyRewardsInUsd(masterchef, pool),
    getTotalLpStakedInUsd(masterchef, pool),
    fetchBeltLpBaseApr(pool),
  ]);
  let simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const beefyPerformanceFee = getTotalPerformanceFeeForVault(pool.name);
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
  const apy = compound(baseApy + simpleApy * shareAfterBeefyPerformanceFee, BASE_HPY, 1, 1);
  // console.log(pool.name, baseApy.valueOf(), simpleApy.valueOf(), apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf());

  const apyBreakdown = {
    vaultApr: simpleApy.toNumber(),
    compoundingsPerYear: BASE_HPY,
    beefyPerformanceFee: beefyPerformanceFee,
    vaultApy: compound(simpleApy, BASE_HPY, 1, shareAfterBeefyPerformanceFee),
    lpFee: 0.001,
    tradingApr: baseApy,
    totalApy: compound(baseApy + simpleApy * shareAfterBeefyPerformanceFee, BASE_HPY, 1, 1),
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
  const masterbeltContract = fetchContract(masterbelt, MasterBelt, BSC_CHAIN_ID);
  const poolInfo = await masterbeltContract.read.poolInfo([pool.poolId]);
  const strat = poolInfo[4];

  const poolContract = fetchContract(strat, BeltVaultPool, BSC_CHAIN_ID);
  const wantLockedTotal = new BigNumber((await poolContract.read.wantLockedTotal()).toString());
  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  return wantLockedTotal.times(tokenPrice).dividedBy(DECIMALS);
};

const getYearlyRewardsInUsd = async (masterbelt, pool) => {
  const blockNum = await getBlockNumber(BSC_CHAIN_ID);
  const masterbeltContract = fetchContract(masterbelt, MasterBelt, BSC_CHAIN_ID);

  const [multiplier, blockRewards, allocPoint, totalAllocPoint] = await Promise.all([
    masterbeltContract.read
      .getMultiplier([blockNum - 1, blockNum])
      .then(res => new BigNumber(res.toString())),
    masterbeltContract.read.BELTPerBlock().then(res => new BigNumber(res.toString())),
    masterbeltContract.read.poolInfo([pool.poolId]).then(res => new BigNumber(res[1].toString())),
    masterbeltContract.read.totalAllocPoint().then(res => new BigNumber(res.toString())),
  ]);

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
