const { avaxWeb3: web3 } = require('../../../utils/web3');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/avax/siclePools.json');
import { joeClient } from '../../../apollo/client';
const getBlockTime = require('../../../utils/getBlockTime');

const getSwapsicleApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xd3344E9a4Bc67de0dF101CEe5B047fe2dc5AF354',
    tokenPerBlock: 'popsPerBlock',
    hasMultiplier: true,
    pools: pools,
    oracleId: 'POPS',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: await getBlockTime(chainId),
    liquidityProviderFee: 0.003,
  });

module.exports = getSwapsicleApys;
