import { SPOOKY_LPF } from '../../../constants';

const { getMasterChefApys } = require('../common/getMasterChefApys');
const { avaxWeb3: web3 } = require('../../../utils/web3');
import { spookyClient } from '../../../apollo/client';
import { AVAX_CHAIN_ID as chainId } from '../../../constants';

const getStargateFantomApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x224D8Fd7aB6AD4c6eb4611Ce56EF35Dec2277F03',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    singlePools: [
      {
        name: 'stargate-ftm-usdc',
        poolId: 0,
        address: '0x1205f31718499dBf1fCa446663B532Ef87481fe1',
        oracle: 'tokens',
        oracleId: 'USDC',
        decimals: '1e6',
      },
      {
        name: 'stargate-ftm-usdt',
        poolId: 1,
        address: '0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c',
        oracle: 'tokens',
        oracleId: 'USDT',
        decimals: '1e6',
      },
    ],
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: spookyClient,
    liquidityProviderFee: SPOOKY_LPF,
    // log: true,
  });

module.exports = getStargateFantomApys;
