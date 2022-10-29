const { getMasterChefApys } = require('../common/getMasterChefApys');
const { ethereumWeb3: web3 } = require('../../../utils/web3');
import { ETH_CHAIN_ID as chainId } from '../../../constants';

const getStargateEthApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    singlePools: [
      {
        name: 'stargate-eth-usdc',
        poolId: 0,
        address: '0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56',
        oracle: 'tokens',
        oracleId: 'sethUSDC',
        decimals: '1e6',
      },
      {
        name: 'stargate-eth-usdt',
        poolId: 1,
        address: '0x38EA452219524Bb87e18dE1C24D3bB59510BD783',
        oracle: 'tokens',
        oracleId: 'sethUSDT',
        decimals: '1e6',
      },
      {
        name: 'stargate-eth-eth',
        poolId: 2,
        address: '0x101816545F6bd2b1076434B54383a1E633390A2E',
        oracle: 'tokens',
        oracleId: 'sethETH',
        decimals: '1e18',
      },
    ],
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateEthApys;
