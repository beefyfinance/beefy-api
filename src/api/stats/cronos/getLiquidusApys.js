const BigNumber = require('bignumber.js');
const { CRONOS_CHAIN_ID: chainId, CRONOS_CHAIN_ID } = require('../../../constants');

import { fetchPrice } from '../../../utils/fetchPrice';
const { compound } = require('../../../utils/compound');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const getBlockTime = require('../../../utils/getBlockTime');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');
const { default: BetuStaking } = require('../../../abis/degens/BetuStaking');
const { fetchContract } = require('../../rpc/client');

const stakingPool = '0x1c7fDE0a9619bC81b23cAEF6992288BA5547a34F';
const lpToken = '0x3295007761C290741B6b363b86dF9ba3467F0754';
const id = 'liq-liq-cro';
const oracleId = 'LIQ';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getLiquidusApys = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const rewardPool = fetchContract(stakingPool, BetuStaking, CRONOS_CHAIN_ID);

  const [rewardPerBlock, totalStakedInUsd, secondsPerBlock] = await Promise.all([
    rewardPool.read.rewardPerBlock(),
    getTotalStakedInUsd(stakingPool, lpToken, 'lps', id, '1e18', 25),
    getBlockTime(chainId),
  ]);

  const secondsPerYear = 31536000;
  const yearlyRewards = new BigNumber(rewardPerBlock)
    .dividedBy(secondsPerBlock)
    .times(secondsPerYear);
  const yearlyRewardsInUsd = yearlyRewards.times(tokenPrice).div(DECIMALS);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault(id);
  const apy = compound(simpleApy, process.env.BASE_HPY, 1, shareAfterBeefyPerformanceFee);
  // console.log(id,apy,totalStakedInUsd.valueOf(),yearlyRewardsInUsd.valueOf(),simpleApy.valueOf());
  return { [id]: apy };
};

module.exports = getLiquidusApys;
