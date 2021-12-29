import { fantomWeb3 as web3 } from '../../../utils/web3';

const { getMasterChefApys } = require('../common/getMasterChefApys');
import MasterChefAbi from '../../../abis/fantom/MaiFarmChef.json';
import pools from '../../../data/fantom/maiLpPools.json';
import { beetClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';

const mai = addressBook.fantom.platforms.mai;

const getMaiApys = async () => {
  return await getMasterChefApys({
    web3: web3,
    masterchef: mai.chef,
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [],
    oracle: 'tokens',
    oracleId: 'QI',
    decimals: '1e18',
    tradingFeeInfoClient: beetClient,
    liquidityProviderFee: 0.0025,
    burn: 0.05,
    chainId: 250,
    // log: true,
  });
};

module.exports = getMaiApys;
