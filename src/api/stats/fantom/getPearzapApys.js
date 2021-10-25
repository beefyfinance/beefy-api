const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');

const pools = require('../../../data/fantom/pearzapLpPools.json');
const { spiritClient } = require('../../../apollo/client');

const getPearzapApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x8c7c3c72205459e4190D9d3b80A51921f2678383',
    tokenPerBlock: 'pearPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'fPEAR',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: spiritClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getPearzapApys;
