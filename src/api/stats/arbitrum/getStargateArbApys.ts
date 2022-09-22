const { getMasterChefApys } = require('../common/getMasterChefApys');
const { arbitrumWeb3: web3 } = require('../../../utils/web3');
import { ARBITRUM_CHAIN_ID as chainId } from '../../../constants';

const getStargateArbApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xeA8DfEE1898a7e0a59f7527F076106d7e44c2176',
    tokenPerBlock: 'stargatePerBlock',
    secondsPerBlock: 12.1,
    hasMultiplier: false,
    singlePools: [
      {
        name: 'stargate-arb-usdc',
        poolId: 0,
        address: '0x892785f33CdeE22A30AEF750F285E18c18040c3e',
        oracle: 'tokens',
        oracleId: 'sarUSDC',
        decimals: '1e6',
      },
      {
        name: 'stargate-arb-usdt',
        poolId: 1,
        address: '0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641',
        oracle: 'tokens',
        oracleId: 'sarUSDT',
        decimals: '1e6',
      },
      {
        name: 'stargate-arb-eth',
        poolId: 2,
        address: '0x915A55e36A01285A14f05dE6e81ED9cE89772f8e',
        oracle: 'tokens',
        oracleId: 'sarETH',
        decimals: '1e18',
      },
    ],
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateArbApys;
