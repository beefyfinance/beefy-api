const BigNumber = require('bignumber.js');
const { kavaWeb3: web3, web3Factory } = require('../../../utils/web3');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { KAVA_CHAIN_ID: chainId } = require('../../../constants');
import { addressBook } from '../../../../packages/address-book/address-book';
import IRewardPool from '../../../abis/IRewardPool';
import { getContractWithProvider } from '../../../utils/contractHelper';
import { fetchContract } from '../../rpc/client';
const {
  kava: {
    platforms: { beefyfinance },
    tokens: { BIFI },
  },
} = addressBook;

const ORACLE = 'tokens';
const ORACLE_ID = 'BIFI';
const REWARD_ORACLE = 'WKAVA';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getKavaBifiGovApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);

  return {
    apys: {
      'kava-bifi-gov': apr,
    },
    apyBreakdowns: {
      'kava-bifi-gov': {
        vaultApr: apr,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const nativePrice = await fetchPrice({ oracle: ORACLE, id: REWARD_ORACLE });

  const rewardPool = fetchContract(beefyfinance.rewardPool);
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

module.exports = getKavaBifiGovApy;
