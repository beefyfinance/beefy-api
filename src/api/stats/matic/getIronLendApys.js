const BigNumber = require('bignumber.js');
const { polygonWeb3: web3 } = require('../../../utils/web3');

const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const IIronLendIncentivesController = require('../../../abis/matic/IronLendIncentivesController.json');
const IIronLendRToken = require('../../../abis/matic/IronLendRToken.json');
const pools = require('../../../data/matic/ironLendPools.json');
const { BASE_HPY } = require('../../../constants');

const IronLendIncentivesController = '0xF20fcd005AFDd3AD48C85d0222210fe168DDd10c';
const secondsPerYear = 31536000;
const secondsPerBlock = 2.1;

const decimals = '1e18';

const getIronLendApys = async () => {
  let apys = {};

  const allPools = [];
  pools.forEach(pool => {
    allPools.push(pool);
    // const newPool = { ...pool };
    // const newPool8 = { ...pool };
    // newPool.name = pool.name + '-delev';
    // newPool.borrowDepth = 0;
    // newPool8.name = pool.name + '-8';
    // newPool8.borrowDepth = 8;
    // allPools.push(newPool8);
    // allPools.push(newPool);
  });

  let promises = [];
  allPools.forEach(pool => promises.push(getPoolApy(pool)));
  const values = await Promise.all(promises);

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async pool => {
  const { supplyBase, supplyReward, borrowBase, borrowReward } = await getIronLendPoolData(pool);

  const { leveragedSupplyBase, leveragedBorrowBase, leveragedSupplyReward, leveragedBorrowReward } =
    getLeveragedApys(
      supplyBase,
      borrowBase,
      supplyReward,
      borrowReward,
      pool.borrowDepth,
      pool.borrowPercent
    );

  let totalReward = leveragedSupplyReward.plus(leveragedBorrowReward);
  let compoundedReward = compound(totalReward, BASE_HPY, 0.955);
  let apy = leveragedSupplyBase.minus(leveragedBorrowBase).plus(compoundedReward).toNumber();
  // console.log(pool.name, apy, supplyBase.valueOf(), borrowBase.valueOf(), supplyReward.valueOf(), borrowReward.valueOf());
  return { [pool.name]: apy };
};

const getIronLendPoolData = async pool => {
  const rToken = new web3.eth.Contract(IIronLendRToken, pool.rToken);
  const supplyRatePerBlock = await rToken.methods.supplyRatePerBlock().call();
  const borrowRatePerBlock = await rToken.methods.borrowRatePerBlock().call();
  const totalBorrows = await rToken.methods.totalBorrows().call();
  const totalSupplyRToken = await rToken.methods.totalSupply().call();
  const exchangeRate = await rToken.methods.exchangeRateStored().call();

  const supplyBase = new BigNumber(supplyRatePerBlock)
    .div(secondsPerBlock)
    .times(secondsPerYear)
    .div(decimals);
  const borrowBase = new BigNumber(borrowRatePerBlock)
    .div(secondsPerBlock)
    .times(secondsPerYear)
    .div(decimals);

  const tokenPrice = await fetchPrice({ oracle: pool.oracle, id: pool.oracleId });
  const totalSupply = new BigNumber(totalSupplyRToken).times(exchangeRate).div(decimals);
  const totalBorrowInUsd = new BigNumber(totalBorrows).div(pool.decimals).times(tokenPrice);
  const totalSupplyInUsd = new BigNumber(totalSupply).div(pool.decimals).times(tokenPrice);

  const rewardInUsd = await getRewardPerYear(pool);
  const supplyReward = rewardInUsd.div(totalSupplyInUsd);
  const borrowReward = totalBorrowInUsd.isZero()
    ? new BigNumber(0)
    : rewardInUsd.div(totalBorrowInUsd);

  return { supplyBase, supplyReward, borrowBase, borrowReward };
};

const getRewardPerYear = async pool => {
  const incentivesController = new web3.eth.Contract(
    IIronLendIncentivesController,
    IronLendIncentivesController
  );
  const rewardSpeed = await incentivesController.methods.rewardSpeeds(pool.rToken).call();

  const rewardPrice = await fetchPrice({ oracle: 'tokens', id: 'ICEiron' });
  const rewardInUsd = new BigNumber(rewardSpeed)
    .div(secondsPerBlock)
    .times(secondsPerYear)
    .div(decimals)
    .times(rewardPrice);

  return rewardInUsd;
};

const getLeveragedApys = (
  supplyBase,
  borrowBase,
  supplyReward,
  borrowReward,
  depth,
  borrowPercent
) => {
  borrowPercent = new BigNumber(borrowPercent);
  let leveragedSupplyBase = new BigNumber(0);
  let leveragedBorrowBase = new BigNumber(0);
  let leveragedSupplyReward = new BigNumber(0);
  let leveragedBorrowReward = new BigNumber(0);

  for (let i = 0; i <= depth; i++) {
    leveragedSupplyBase = leveragedSupplyBase.plus(
      supplyBase.times(borrowPercent.exponentiatedBy(depth - i))
    );
    leveragedSupplyReward = leveragedSupplyReward.plus(
      supplyReward.times(borrowPercent.exponentiatedBy(depth - i))
    );
  }

  for (let i = 0; i < depth; i++) {
    leveragedBorrowBase = leveragedBorrowBase.plus(
      borrowBase.times(borrowPercent.exponentiatedBy(depth - i))
    );
    leveragedBorrowReward = leveragedBorrowReward.plus(
      borrowReward.times(borrowPercent.exponentiatedBy(depth - i))
    );
  }

  return {
    leveragedSupplyBase,
    leveragedBorrowBase,
    leveragedSupplyReward,
    leveragedBorrowReward,
  };
};

module.exports = { getIronLendApys, getIronLendPoolData };
