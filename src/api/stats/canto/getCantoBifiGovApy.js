const BigNumber = require('bignumber.js');
const { cantoWeb3: web3, web3Factory } = require('../../../utils/web3');

const IRewardPool = require('../../../abis/IRewardPool.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { CANTO_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
import { getContractWithProvider } from '../../../utils/contractHelper';
const {
  canto: {
    platforms: { beefyfinance },
    tokens: { BIFI },
  },
} = addressBook;

const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const REWARD_ORACLE = 'WCANTO';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getCantoBifiGovApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'canto-bifi-gov': apr,
    },
    apyBreakdowns: {
      'canto-bifi-gov': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const nativePrice = await fetchPrice({ oracle: ORACLE, id: REWARD_ORACLE });

  const rewardPool = getContractWithProvider(IRewardPool, beefyfinance.rewardPool, web3);
  const rewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const yearlyRewards = rewardRate.times(3).times(BLOCKS_PER_DAY).times(365);
  const yearlyRewardsInUsd = yearlyRewards.times(nativePrice).dividedBy(DECIMALS);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(chainId);

  const tokenContract = getContractWithProvider(ERC20, BIFI.address, web3);
  const totalStaked = new BigNumber(
    await tokenContract.methods.balanceOf(beefyfinance.rewardPool).call()
  );
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: ORACLE_ID });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getCantoBifiGovApy;
