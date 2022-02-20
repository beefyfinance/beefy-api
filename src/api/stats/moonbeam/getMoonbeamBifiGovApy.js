const BigNumber = require('bignumber.js');
const { moonbeamWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { MOONBEAM_CHAIN_ID: chainId, BASE_HPY } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  moonbeam: {
    platforms: { beefyfinance },
    tokens: { BIFI },
  },
} = addressBook;

const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const REWARD_ORACLE = 'WGLMR';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getMoonbeamBifiGovApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'moonbeam-bifi-gov': apr,
    },
    apyBreakdowns: {
      'moonbeam-bifi-gov': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const nativePrice = await fetchPrice({ oracle: ORACLE, id: REWARD_ORACLE });

  const rewardPool = new web3.eth.Contract(IRewardPool, beefyfinance.rewardPool);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(nativePrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(chainId);

  const tokenContract = new web3.eth.Contract(ERC20, BIFI.address);
  const totalStaked = new BigNumber(
    await tokenContract.methods.balanceOf(beefyfinance.rewardPool).call()
  );
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getMoonbeamBifiGovApy;
