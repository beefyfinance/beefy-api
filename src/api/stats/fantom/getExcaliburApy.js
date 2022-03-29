const { fantomWeb3: web3 } = require('../../../utils/web3');
import { FANTOM_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import ExcaliburMasterChef from '../../../abis/fantom/ExcaliburChef.json';
import { addressBook } from '../../../../packages/address-book/address-book';
import { sushiFantomClient } from '../../../apollo/client';
const getBlockTime = require('../../../utils/getBlockTime');

const {
  fantom: {
    tokens: { EXC },
    platforms: { excalibur },
  },
} = addressBook;

const pools = require('../../../data/fantom/excaliburLpPools.json');

const getExcaliburApy = async () => {
  return await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchefAbi: ExcaliburMasterChef,
    masterchef: excalibur.masterchef,
    tokenPerBlock: 'rewardsPerSecond',
    hasMultiplier: false,
    secondsPerBlock: await getBlockTime(chainId),
    allocPointIndex: '3',
    pools: pools,
    oracleId: 'excalibur',
    oracle: 'tokens',
    decimals: '1e18',
    liquidityProviderFee: 0.002,
    tradingFeeInfoClient: sushiFantomClient,
    log: true,
  });
};

module.exports = getExcaliburApy;
