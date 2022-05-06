const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID: chainId } = require('../../../constants');
import { getRewardPoolApys } from '../common/getRewardPoolApys';

const singlePool = [
  {
    name: 'hector-tor-crv',
    address: '0x24699312CB27C26Cfc669459D670559E5E44EE60',
    rewardPool: '0x61B71689684800f73eBb67378fc2e1527fbDC3b3',
    oracleId: 'curve-ftm-tor',
    chainId,
  },
];

const getHectorApy = async () =>
  getRewardPoolApys({
    pools: singlePool,
    oracleId: 'WFTM',
    oracle: 'tokens',
    decimals: 1e18,
    web3: web3,
    chainId,
    // log: true,
  });

module.exports = getHectorApy;
