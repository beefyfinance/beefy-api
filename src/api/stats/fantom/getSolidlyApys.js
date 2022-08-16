const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
const { getSolidlyNotBoostedGaugeApys } = require('../common/getSolidlyNotBoostedGaugeApys');
const volatilePools = require('../../../data/fantom/solidlyLpPools.json');

const pools = [...volatilePools];
const getSolidlyApys = async () =>
  getSolidlyNotBoostedGaugeApys({
    web3: web3,
    chainId: chainId,
    pools: pools,
    oracleId: 'SOLID',
    oracle: 'tokens',
    decimals: '1e18',
    reward: '0x888EF71766ca594DED1F0FA3AE64eD2941740A20',
    boosted: true,
    // log: true,
  });

module.exports = getSolidlyApys;
