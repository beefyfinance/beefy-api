const BigNumber = require('bignumber.js');
const { ethereumWeb3: web3, web3Factory } = require('../../../utils/web3');

const IAuraGauge = require('../../../abis/ethereum/AuraGauge.json');
const fetchPrice = require('../../../utils/fetchPrice');
const ERC20 = require('../../../abis/ERC20.json');
const { ETH_CHAIN_ID: chainId, DAILY_HPY } = require('../../../constants');
const { compound } = require('../../../utils/compound');
import { getTotalPerformanceFeeForVault } from '../../vaults/getVaultFees';
import { addressBook } from '../../../../packages/address-book/address-book';
import { getContractWithProvider } from '../../../utils/contractHelper';
import { getAuraData } from './getAuraApys';

const {
  ethereum: {
    tokens: { BAL, AURA, bbaUSD, auraBAL },
  },
} = addressBook;

const ORACLE = 'tokens';
const auraBalGauge = '0x5e5ea2048475854a5702F5B8468A51Ba1296EFcC';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getAuraBalApy = async () => {
  const [yearlyRewardsInUsd, totalStakedInUsd] = await Promise.all([
    getYearlyRewardsInUsd(),
    getTotalStakedInUsd(),
  ]);

  const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd);
  const beefyPerformanceFee = getTotalPerformanceFeeForVault('aura-auraBal');
  const shareAfterBeefyPerformanceFee = 1 - beefyPerformanceFee;
  const apy = compound(apr, DAILY_HPY, 1, shareAfterBeefyPerformanceFee);

  return {
    apys: {
      'aura-aurabal': apy,
    },
    apyBreakdowns: {
      'aura-aurabal': {
        vaultApr: apr,
        totalApy: apy,
      },
    },
  };
};

const getYearlyRewardsInUsd = async () => {
  const balPrice = await fetchPrice({ oracle: ORACLE, id: BAL.symbol });
  const auraPrice = await fetchPrice({ oracle: ORACLE, id: AURA.symbol });
  const bbaUSDPrice = await fetchPrice({ oracle: ORACLE, id: bbaUSD.symbol });

  const rewardPool = getContractWithProvider(IAuraGauge, auraBalGauge, web3);
  const balRewardRate = new BigNumber(await rewardPool.methods.rewardRate().call());
  const bbaUSDVirtualGaugeAddress = await rewardPool.methods.extraRewards(1).call();
  const bbaUSDVirtualGauge = getContractWithProvider(IAuraGauge, bbaUSDVirtualGaugeAddress, web3);
  const bbaUSDRewardRate = new BigNumber(await bbaUSDVirtualGauge.methods.rewardRate().call());
  const auraData = await getAuraData();
  const yearlyRewards = balRewardRate.times(3).times(BLOCKS_PER_DAY).times(365);

  let auraYearlyRewards = yearlyRewards.times(auraData[0]).dividedBy(auraData[1]);
  // e.g. amtTillMax = 5e25 - 1e25 = 4e25

  if (auraYearlyRewards.gte(auraData[2])) {
    auraYearlyRewards = auraData[2];
  }

  let bbausdYearlyRewards = bbaUSDRewardRate.times(3).times(BLOCKS_PER_DAY).times(365);

  const balYearlyRewardsInUsd = yearlyRewards.times(balPrice).dividedBy(DECIMALS);
  const auraYearlyRewardsInUsd = auraYearlyRewards.times(auraPrice).dividedBy(DECIMALS);
  const bbaUSDYearlyRewardsInUsd = bbausdYearlyRewards.times(bbaUSDPrice).dividedBy(DECIMALS);

  const yearlyRewardsInUsd = balYearlyRewardsInUsd
    .plus(auraYearlyRewardsInUsd)
    .plus(bbaUSDYearlyRewardsInUsd);

  return yearlyRewardsInUsd;
};

const getTotalStakedInUsd = async () => {
  const web3 = web3Factory(chainId);

  const tokenContract = getContractWithProvider(ERC20, auraBAL.address, web3);
  const totalStaked = new BigNumber(await tokenContract.methods.balanceOf(auraBalGauge).call());
  const tokenPrice = await fetchPrice({ oracle: ORACLE, id: auraBAL.symbol });

  return totalStaked.times(tokenPrice).dividedBy(DECIMALS);
};

module.exports = getAuraBalApy;
