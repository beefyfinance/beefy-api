const { getMasterChefApys } = require('../../common/getMasterChefApys');
const bombAcsiPools = require('../../../../data/bombAcsiPools.json');
const { bscWeb3 } = require('../../../../utils/web3');
import { acsiClient } from '../../../../apollo/client';
const RewardPool = require('../../../../abis/BombReward.json');

const getBombPrices = async () =>
  await getMasterChefApys({
    web3: bscWeb3,
    chainId: 56,
    masterchef: '0x1083926054069AaD75d7238E9B809b0eF9d94e5B',
    masterchefAbi: RewardPool,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    allocPointIndex: '0',
    pools: bombAcsiPools,
    oracleId: 'BSHARE',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: acsiClient,
    liquidityProviderFee: 0.0017,
    burn: 0.128,
    // log: true,
  });

module.exports = getBombPrices;
