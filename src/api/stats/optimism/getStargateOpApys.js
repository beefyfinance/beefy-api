const { getMasterChefApys } = require('../common/getMasterChefApys');
const { optimismWeb3: web3 } = require('../../../utils/web3');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');

const pools = require('../../../data/optimism/stargateOpPools.json')

const getStargateOpApys = async () =>
  await getMasterChefApys({
    web3,
    chainId,
    masterchef: '0x4DeA9e918c6289a52cd469cAC652727B7b412Cd2',
    tokenPerBlock: 'eTokenPerSecond',
    secondsPerBlock: 1,
    hasMultiplier: false,
    pools,
    oracleId: 'OP',
    oracle: 'tokens',
    decimals: '1e18'
  });

module.exports = getStargateOpApys;
