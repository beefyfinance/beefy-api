const { fuseWeb3: web3 } = require('../../../utils/web3');
const { FUSE_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/fuse/voltageLpPools.json');
const { FUSEFI_LPF } = require('../../../constants');
const { fusefiClient } = require('../../../apollo/client');

const getVoltageApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xE3e184a7b75D0Ae6E17B58F5283b91B4E0A2604F',
    tokenPerBlock: 'voltPerSec',
    allocPointIndex: '3',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'VOLT',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: fusefiClient,
    liquidityProviderFee: FUSEFI_LPF,
    // log: true,
  });

module.exports = getVoltageApys;
