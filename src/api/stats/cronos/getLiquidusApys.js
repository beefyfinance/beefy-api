const BigNumber = require('bignumber.js');
const { cronosWeb3: web3 } = require('../../../utils/web3');
const { CRONOS_CHAIN_ID: chainId } = require('../../../constants');

const BetuStaking = require('../../../abis/degens/BetuStaking.json');
const fetchPrice = require('../../../utils/fetchPrice');
const { compound } = require('../../../utils/compound');
const { getTotalStakedInUsd } = require('../../../utils/getTotalStakedInUsd');
const getBlockTime = require('../../../utils/getBlockTime');
const { getContractWithProvider } = require('../../../utils/contractHelper');
const { getTotalPerformanceFeeForVault } = require('../../vaults/getVaultFees');

const stakingPool = '0x1c7fDE0a9619bC81b23cAEF6992288BA5547a34F';
const lpToken = '0x3295007761C290741B6b363b86dF9ba3467F0754';
const id = 'liq-liq-cro';
const oracleId = 'LIQ';
const oracle = 'tokens';
const DECIMALS = '1e18';

const getLiquidusApys = async () => {
  const tokenPrice = await fetchPrice({ oracle, id: oracleId });
  const rewardPool = getContractWithProvider(BetuStaking, stakingPool, web3);

  const [rewardPerBlock, totalStakedInUsd] = await Promise.all([
    rewardPool.methods.rewardPerBlock().call(),
    getTotalStakedInUsd(stakingPool, lpToken, 'lps', id, '1e18', 25),
  ]);

  const secondsPerYear = 31536000;
  const secondsPerBlock = await getBlockTime(chainId);
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
