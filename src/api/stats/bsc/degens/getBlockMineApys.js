const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
const { getMasterChefApys } = require('../../common/getMasterChefApys');
const { apeClient } = require('../../../../apollo/client');

const pools = require('../../../../data/degens/blockMineLpPools.json');

const getBlockMineLpApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x6CB1Cdbae9a20413e37aF1491507cd5faE2DdD3e',
    tokenPerBlock: 'nuggetPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'NUGGET',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: apeClient,
    liquidityProviderFee: 0.0015,
    burn: 0.1,
    // log: true,
  });

module.exports = getBlockMineLpApys;
