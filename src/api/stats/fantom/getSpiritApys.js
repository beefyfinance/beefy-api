const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId, SPIRIT_LPF } = require('../../../constants');
import { getEDecimals } from '../../../utils/getEDecimals';
const { getMasterChefApys } = require('../common/getMasterChefApys');
const { getGaugeApys } = require('../common/getGaugeApys');
import { getRewardPoolApys } from '../common/getRewardPoolApys';

const pools = require('../../../data/fantom/spiritPools.json');
const { spiritClient } = require('../../../apollo/client');
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  fantom: {
    platforms: { spiritswap },
    tokens: { SPIRIT, binSPIRIT },
  },
} = addressBook;

const singlePool = [{
  name: "beefy-binspirit",
  address: "0xe1908Ab7e03F0699773ceCc4Dc5D38893E532cd1",
  rewardPool: "0x680332E76C95E9395975483E93d483f133a67553",
  decimals: "1e18",
  oracleId: "binSPIRIT",
  oracle: "tokens",
  chainId: 250,
}];

const getSpiritApys = async () => {
  const chefApys = getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: spiritswap.masterchef,
    tokenPerBlock: 'spiritPerBlock',
    pools: pools.filter(pool => !!pool.poolId),
    oracleId: SPIRIT.symbol,
    oracle: 'tokens',
    decimals: getEDecimals(SPIRIT.decimals),
    tradingFeeInfoClient: spiritClient,
    liquidityProviderFee: SPIRIT_LPF,
    // log: true,
  });

  const gaugeApys = getGaugeApys({
    web3: web3,
    chainId: chainId,
    gaugeStaker: spiritswap.gaugeStaker,
    pools: pools.filter(pool => !!pool.gauge),
    oracleId: 'SPIRIT',
    oracle: 'tokens',
    decimals: getEDecimals(SPIRIT.decimals),
    tradingFeeInfoClient: spiritClient,
    liquidityProviderFee: SPIRIT_LPF,
    // log: true,
  });

  const binSpiritApy = getRewardPoolApys({
    pools: singlePool,
    oracleId: binSPIRIT.symbol,
    oracle: 'tokens',
    decimals: getEDecimals(binSPIRIT.decimals),
    web3: web3,
    chainId: 250,
    // log: true,
  });

  let apys = {};
  let apyBreakdowns = {};

  const results = await Promise.allSettled([chefApys, gaugeApys, binSpiritApy]);
  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('getSpiritApys error', result.reason);
    } else {
      apys = { ...apys, ...result.value.apys };
      apyBreakdowns = { ...apyBreakdowns, ...result.value.apyBreakdowns };
    }
  }

  return {
    apys,
    apyBreakdowns,
  };
};

module.exports = getSpiritApys;
