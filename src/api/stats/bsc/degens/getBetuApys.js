const BigNumber = require('bignumber.js');
const { bscWeb3: web3 } = require('../../../../utils/web3');

const BetuStaking = require('../../../../abis/degens/BetuStaking.json');
const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { getContractWithProvider } = require('../../../../utils/contractHelper');

const stakingPool = '0x8a3030e494a9c0FF12F46D0ce3F1a610dCe9B2eD';
const oracleId = 'BETU';
const oracle = 'tokens';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getBetuApys = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const rewardPool = getContractWithProvider(BetuStaking, stakingPool, web3);

  const [rewardPerBlock, totalStaked] = await Promise.all([
    rewardPool.methods.rewardPerBlock().call(),
    rewardPool.methods.totalStaked().call(),
  ]);

  const yearlyRewards = new BigNumber(rewardPerBlock).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).div(DECIMALS);
  const totalStakedInUsd = new BigNumber(totalStaked).times(tokenPrice).div(DECIMALS);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, 0.955);
  // console.log("betu", apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf(), simpleApy.valueOf());
  return { 'betu-betu': apy };
};

module.exports = getBetuApys;
