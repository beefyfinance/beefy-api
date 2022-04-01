import { bscWeb3 as web3 } from '../../../../utils/web3';
const { getMasterChefApys } = require('../../common/getMasterChefApys');
import { BSC_CHAIN_ID } from '../../../../constants';

const getStargateBscApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: BSC_CHAIN_ID,
    masterchef: '0x3052A0F6ab15b4AE1df39962d5DdEFacA86DaB47',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    singlePools: [
      {
        name: 'stargate-bsc-busd',
        poolId: 1,
        address: '0x98a5737749490856b401DB5Dc27F522fC314A4e1',
        oracle: 'tokens',
        oracleId: 'BUSD',
        decimals: '1e6',
      },
      {
        name: 'stargate-bsc-usdt',
        poolId: 0,
        address: '0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda',
        oracle: 'tokens',
        oracleId: 'USDT',
        decimals: '1e6',
      },
    ],
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateBscApys;
