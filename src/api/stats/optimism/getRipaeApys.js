const { optimismWeb3: web3 } = require('../../../utils/web3');
const { OPTIMISM_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');

const pools = [
  {
    name: 'ripae-weth-petho',
    oracleId: 'velodrome-weth-petho',
    address: '0x20d33fF7880f65a3554bBEE9C4E9BF79812C6ef6',
    poolId: 0,
    beefyFee: 0.095,
  },
  {
    name: 'ripae-weth-setho',
    oracleId: 'velodrome-weth-setho',
    address: '0x9629a694C041f3b10cE974DC37eF4dD4596c4F54',
    poolId: 1,
    beefyFee: 0.095,
  },
];

export const getRipaeApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xf5e49b0a960459799F1E9b3f313dFA81D2CE553c',
    tokenPerBlock: 'paePerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'sETHo',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    // log: true,
  });
