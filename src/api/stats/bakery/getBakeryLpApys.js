const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const ERC20 = require('../../../abis/ERC20.json');
const pools = require('../../../data/bakeryLpPools.json');
const { compound } = require('../../../utils/compound');
const { lpTokenPrice } = require('../../../utils/lpTokens');
const getYearlyRewardsInUsd = require('./getYearlyRewardsInUsd');

const web3 = new Web3(process.env.BSC_RPC_2 || process.env.BSC_RPC);

const getBakeryLpApys = async () => {
  let apys = {};
  const bakeryMaster = '0x20eC291bB8459b6145317E7126532CE7EcE5056f';

  let promises = [];
  pools.forEach(pool => promises.push(getPoolApy(bakeryMaster, pool)));
  const values = await Promise.all(promises);

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const getPoolApy = async (bakeryMaster, pool) => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(bakeryMaster, pool.address),
    getTotalStakedInUsd(bakeryMaster, pool),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  return { [pool.name]: apy };
};

const getTotalStakedInUsd = async (bakeryMaster, pool) => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, pool.address);
  const totalStaked = new BigNumber(await tokenPairContract.methods.balanceOf(bakeryMaster).call());
  const tokenPrice = await lpTokenPrice(pool);
  const totalStakedInUsd = totalStaked.times(tokenPrice).dividedBy('1e18');
  return totalStakedInUsd;
};

module.exports = getBakeryLpApys;
