const BigNumber = require('bignumber.js');
const fetchPrice = require('../../../../utils/fetchPrice');
const { getTotalStakedInUsd } = require('../../../../utils/getTotalStakedInUsd');
const { compound } = require('../../../../utils/compound');
const { DAILY_HPY, BSC_CHAIN_ID } = require('../../../../constants');
const { getTotalPerformanceFeeForVault } = require('../../../vaults/getVaultFees');
const { default: IRewardPool } = require('../../../../abis/IRewardPool');
const { fetchContract } = require('../../../rpc/client');
const { addressBook } = require('../../../../../packages/address-book/address-book');

const {
  bsc: {
    platforms: {
      beefyfinance: { rewardPool },
    },
    tokens: { oldBIFI },
  },
} = addressBook;

const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getBifiMaxiApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(rewardPool, oldBIFI, oldBIFI.oracle, oldBIFI.oracleId, DECIMALS),
  ]);

  const simpleApy = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const shareAfterBeefyPerformanceFee = 1 - getTotalPerformanceFeeForVault('bifi-maxi');
  const apy = compound(simpleApy, DAILY_HPY, 1, shareAfterBeefyPerformanceFee);

  return { 'bifi-maxi': apy };
};

const getYearlyRewardsInUsd = async () => {
  const bnbPrice = await fetchPrice({ oracle: 'tokens', id: 'WBNB' });

  const rewardPoolContract = fetchContract(rewardPool, IRewardPool, BSC_CHAIN_ID);
  const rewardRate = new BigNumber((await rewardPoolContract.read.rewardRate()).toString());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(bnbPrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

module.exports = getBifiMaxiApy;
