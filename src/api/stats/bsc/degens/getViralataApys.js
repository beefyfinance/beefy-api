const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
const { getMasterChefApys } = require('../../common/getMasterChefApys');

const pools = require('../../../../data/degens/viralataLpPools.json');

const getViralataApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xa734b55a5e9FDFcacE5D262A3860f8eDD267f186',
    tokenPerBlock: 'auroPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'AURO',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getViralataApys;
