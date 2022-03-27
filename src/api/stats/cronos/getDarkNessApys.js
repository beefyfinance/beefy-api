const { cronosWeb3: web3 } = require('../../../utils/web3');
const { CRONOS_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/cronos/darkNessLpPools.json');
import { vvsClient } from '../../../apollo/client';

const getDarkNessApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x63Df75d039f7d7A8eE4A9276d6A9fE7990D7A6C5',
    tokenPerBlock: 'rewardPerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'NESS',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: vvsClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getDarkNessApys;
