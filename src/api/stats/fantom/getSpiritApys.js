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
  address: "0x44e314190D9E4cE6d4C0903459204F8E21ff940A",
  rewardPool: "0xFAE44b30F6F9BbD44E6B7687471dd73D71FaBDC6",
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
