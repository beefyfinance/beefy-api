const { metisWeb3: web3 } = require('../../../utils/web3');
const { METIS_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyGaugeApys } = require('../common/getSolidlyGaugeApys');
const stablePools = require('../../../data/metis/hermesStableLpPools.json');
const volatilePools = require('../../../data/metis/hermesLpPools.json');

const pools = [...stablePools, ...volatilePools];
const getHermesApys = async () =>
  getSolidlyGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'HERMES',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0xb27BbeaACA2C00d6258C3118BAB6b5B6975161c8',
    boosted: false,
    // log: true,
  });

module.exports = getHermesApys;
