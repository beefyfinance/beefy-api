const BigNumber = require('bignumber.js');
import { fetchPrice } from '../../../../utils/fetchPrice';
const { compound } = require('../../../../utils/compound');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');
const { default: NftyStaking } = require('../../../../abis/degens/NftyStaking');
const { fetchContract } = require('../../../rpc/client');
const { BSC_CHAIN_ID } = require('../../../../constants');

const stakingPool = '0x490147C65365c58F3404415b1194fbB4697A4B44';
const oracleId = 'NFTY';
const oracle = 'tokens';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getNftyApys = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const rewardPool = fetchContract(stakingPool, NftyStaking, BSC_CHAIN_ID);

  const [rewardPerBlock, totalStaked] = await Promise.all([
    rewardPool.read.rewardPerBlock().then(res => new BigNumber(res.toString())),
    rewardPool.read.totalStakeTokenBalance().then(res => new BigNumber(res.toString())),
  ]);

  const yearlyRewards = rewardPerBlock.times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).div(DECIMALS);
  const totalStakedInUsd = totalStaked.times(tokenPrice).div(DECIMALS);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault('nfty-nfty');
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  // console.log("nfty", apy, totalStakedInUsd.valueOf(), yearlyRewardsInUsd.valueOf(), simpleApy.valueOf());
  return { 'nfty-nfty': apy };
};

module.exports = getNftyApys;
