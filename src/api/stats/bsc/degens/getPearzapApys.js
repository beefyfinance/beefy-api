const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
const { getMasterChefApys } = require('../../common/getMasterChefApys');

const pools = require('../../../../data/degens/pearzapLpPools.json');
const { apeClient } = require('../../../../apollo/client');

const getPearzapApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xd6D8EBf01b79EE3fC1Ab76Dc3eA79bcB209205E4',
    tokenPerBlock: 'pearPerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'pearzap-bscpear',
        poolId: 2,
        address: '0xdf7C18ED59EA738070E665Ac3F5c258dcc2FBad8',
        oracle: 'tokens',
        oracleId: 'bPEAR',
        decimals: '1e18',
      },
    ],
    oracleId: 'bPEAR',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: apeClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getPearzapApys;
