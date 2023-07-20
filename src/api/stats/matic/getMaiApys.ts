import { getMasterChefApys } from './getMaticMasterChefApys';
import pools from '../../../data/matic/maiLpPools.json';
import { quickClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import MaiFarmChefAbi from '../../../abis/matic/MaiFarmChef';

const mai = addressBook.polygon.platforms.mai;

const getMaiApys = async () =>
  getMasterChefApys({
    masterchef: mai.chef3,
    masterchefAbi: MaiFarmChefAbi,
    tokenPerBlock: 'rewardPerSecond',
    hasMultiplier: false,
    pools: pools,
    singlePools: [],
    oracle: 'tokens',
    oracleId: 'QI',
    decimals: '1e18',
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: 0.0025,
    secondsPerBlock: 1,
    // log: true,
  });

export default getMaiApys;
