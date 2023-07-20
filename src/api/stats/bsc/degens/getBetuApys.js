const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../../utils/fetchPrice');
const { compound } = require('../../../../utils/compound');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');
const { default: BetuStaking } = require('../../../../abis/degens/BetuStaking');
const { fetchContract } = require('../../../rpc/client');
const { BSC_CHAIN_ID } = require('../../../../constants');

const stakingPool = '0x8a3030e494a9c0FF12F46D0ce3F1a610dCe9B2eD';
const oracleId = 'BETU';
const oracle = 'tokens';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getBetuApys = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const rewardPool = fetchContract(stakingPool, BetuStaking, BSC_CHAIN_ID);

  const [rewardPerBlock, totalStaked] = await Promise.all([
    rewardPool.read.rewardPerBlock().then(res => new BigNumber(res.toString())),
    rewardPool.read.totalStaked().then(res => new BigNumber(res.toString())),
  ]);

  const yearlyRewards = rewardPerBlock.times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).div(DECIMALS);
  const totalStakedInUsd = totalStaked.times(tokenPrice).div(DECIMALS);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault('betu-betu');

  const apy = compound(simpleApy, process.env.BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  // console.log("betu", apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf(), simpleApy.valueOf());
  return { 'betu-betu': apy };
};

module.exports = getBetuApys;
