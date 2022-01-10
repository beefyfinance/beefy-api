const { bscWeb3: web3 } = require('../../../../utils/web3');
import { BSC_CHAIN_ID as chainId } from '../../../../constants';

const { getMasterChefApys } = require('../../common/getMasterChefApys');
const { cakeClient } = require('../../../../apollo/client');
const pools = require('../../../../data/degens/dibsLpPools.json');

const getDibsApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x8f75dfc6A598b00cC18edCe9E458451F3742007D',
    tokenPerBlock: 'dSharePerSecond',
    secondsPerBlock: 1,
    hasMultiplier: false,
    pools: pools,
    oracleId: 'DSHARE',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getDibsApys;
