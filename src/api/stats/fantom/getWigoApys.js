const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/fantom/wigoLpPools.json');

const getWigoApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xA1a938855735C0651A6CfE2E93a32A28A236d0E9',
    tokenPerBlock: 'wigoPerSecond',
    hasMultiplier: true,
    useMultiplierTimestamp: true,
    pools: pools,
    oracleId: 'WIGO',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    liquidityProviderFee: 0.0018,
    // log: true,
  });

module.exports = getWigoApys;
