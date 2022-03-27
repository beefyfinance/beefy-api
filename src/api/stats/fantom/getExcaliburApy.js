const { fantomWeb3: web3 } = require('../../../utils/web3');
import { FANTOM_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import SpellMasterChef from '../../../abis/arbitrum/SpellMasterChef.json';
import { sushiFantomClient } from '../../../apollo/client';
const getBlockTime = require('../../../utils/getBlockTime');

const pools = require('../../../data/fantom/excaliburLpPools.json');

const getExcaliburApy = async () => {
  return await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    // masterchefAbi: SpellMasterChef,
    masterchef: '0x70B9611f3cd33e686ee7535927cE420C2A111005',
    tokenPerBlock: 'excPerBlock',
    hasMultiplier: false,
    secondsPerBlock: await getBlockTime(chainId),
    // allocPointIndex: '4',
    pools: pools,
    oracleId: 'EXC',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.002,
    tradingFeeInfoClient: sushiFantomClient,
    // log: true,
  });
};

module.exports = getExcaliburApy;
