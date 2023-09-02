import { BASE_CHAIN_ID as chainId } from '../../../constants';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys';

const pools = require('../../../data/base/alienBaseLpPools.json');

const getAlienBaseApys = async () =>
  await getMultiRewardMasterChefApys({
    chainId: chainId,
    masterchef: '0x52eaeCAC2402633d98b95213d0b473E069D86590',
    secondsPerBlock: 1,
    pools,
    singlePools: [
      {
        name: 'alienbase-alb',
        poolId: 0,
        address: '0x1dd2d631c92b1aCdFCDd51A0F7145A50130050C4',
        oracle: 'tokens',
        oracleId: 'ALB',
        decimals: '1e18',
      },
    ],
    oracleId: 'ALB',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.0016,
    // log: true,
  });

module.exports = getAlienBaseApys;
