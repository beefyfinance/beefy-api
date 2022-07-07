const { getMasterChefApys } = require('../common/getMasterChefApys');
const { optimismWeb3: web3 } = require('../../../utils/web3');
import { OPTIMISM_CHAIN_ID as chainId } from '../../../constants';

const getStargateOpApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    singlePools: [
      {
        name: 'stargate-op-usdc',
        poolId: 0,
        address: '0xDecC0c09c3B5f6e92EF4184125D5648a66E35298',
        oracle: 'tokens',
        oracleId: 'soUSDC',
        decimals: '1e6',
      },
      {
        name: 'stargate-op-eth',
        poolId: 1,
        address: '0xd22363e3762cA7339569F3d33EADe20127D5F98C',
        oracle: 'tokens',
        oracleId: 'soETH',
        decimals: '1e18',
      },
    ],
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateOpApys;
