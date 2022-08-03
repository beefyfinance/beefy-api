const { getMasterChefApys } = require('../common/getMasterChefApys');
const { polygonWeb3: web3 } = require('../../../utils/web3');
import { POLYGON_CHAIN_ID } from '../../../constants';

const getStargatePolygonApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: POLYGON_CHAIN_ID,
    masterchef: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    singlePools: [
      {
        name: 'stargate-polygon-usdc',
        poolId: 0,
        address: '0x1205f31718499dBf1fCa446663B532Ef87481fe1',
        oracle: 'tokens',
        oracleId: 'spUSDC',
        decimals: '1e6',
      },
      {
        name: 'stargate-polygon-usdt',
        poolId: 1,
        address: '0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c',
        oracle: 'tokens',
        oracleId: 'spUSDT',
        decimals: '1e6',
      },
    ],
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargatePolygonApys;
