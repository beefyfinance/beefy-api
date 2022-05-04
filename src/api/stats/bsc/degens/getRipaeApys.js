const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId, BISWAP_LPF } = require('../../../../constants');
const { getMasterChefApys } = require('../../common/getMasterChefApys');
const pools = require('../../../../data/degens/ripaeLpPools.json');
const { biswapClient } = require('../../../../apollo/client');

const getRipaeApys = async () =>
  await getMasterChefApys({
    web3,
    chainId,
    masterchef: '0x18A5aefA5a6B20FeEeF0a3AabF876c813b04dB3d',
    tokenPerBlock: 'paePerSecond',
    hasMultiplier: false,
    pools,
    oracleId: 'PAE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: biswapClient,
    liquidityProviderFee: BISWAP_LPF,
    // log: true,
  });

module.exports = getRipaeApys;
