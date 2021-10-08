const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
const { getMasterChefApys } = require('../../common/getMasterChefApys');

const pools = require('../../../../data/degens/cafeLpPools.json');

const getCafeLpApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xc772955c33088a97D56d0BBf473d05267bC4feBB',
    tokenPerBlock: 'cakePerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'BREW',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getCafeLpApys;
