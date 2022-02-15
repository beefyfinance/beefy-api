const { cronosWeb3: web3 } = require('../../../utils/web3');
const { CRONOS_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/cronos/darkCryptoLpPools.json');
import { vvsClient } from '../../../apollo/client';

const getDarkCryptoApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x42B652A523367e7407Fb4BF2fA1F430781e7db8C',
    tokenPerBlock: 'rewardPerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'SKY',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: vvsClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getDarkCryptoApys;
