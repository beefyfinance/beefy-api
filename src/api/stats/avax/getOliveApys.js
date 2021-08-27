const { avaxWeb3: web3 } = require('../../../utils/web3');
const { AVAX_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const getBlockTime = require('../../../utils/getBlockTime');
const pools = require('../../../data/avax/oliveLpPools.json');
import { oliveClient } from '../../../apollo/client';

const getOliveApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x5A9710f3f23053573301C2aB5024D0a43A461E80',
    tokenPerBlock: 'olivePerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'OLIVE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: await getBlockTime(chainId),
    tradingFeeInfoClient: oliveClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getOliveApys;
