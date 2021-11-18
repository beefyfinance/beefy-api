const { cronosWeb3: web3 } = require('../../../utils/web3');
const { CRONOS_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/cronos/cronaLpPools.json');

const getCronaApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254',
    tokenPerBlock: 'cronaPerSecond',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'crona-crona',
        poolId: 0,
        address: '0xadbd1231fb360047525BEdF962581F3eee7b49fe',
        oracle: 'tokens',
        oracleId: 'CRONA',
        decimals: '1e18',
      },
    ],
    oracleId: 'CRONA',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    // log: true,
  });

module.exports = getCronaApys;
