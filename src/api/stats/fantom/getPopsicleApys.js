const { fantomWeb3: web3 } = require('../../../utils/web3');
import { FANTOM_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import SpellMasterChef from '../../../abis/arbitrum/SpellMasterChef.json';
import { sushiFantomClient } from '../../../apollo/client';

const pools = require('../../../data/fantom/popsicleLpPools.json');

const getPopsicleApys = async () => {
  return await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchefAbi: SpellMasterChef,
    masterchef: '0xbf513aCe2AbDc69D38eE847EFFDaa1901808c31c',
    tokenPerBlock: 'icePerSecond',
    hasMultiplier: false,
    secondsPerBlock: 1,
    allocPointIndex: '4',
    pools: pools,
    oracleId: 'ICE',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.003,
    tradingFeeInfoClient: sushiFantomClient,
    // log: true,
  });
};

module.exports = getPopsicleApys;
