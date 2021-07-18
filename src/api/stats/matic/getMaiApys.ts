import { getMasterChefApys } from './getMaticMasterChefApys';
import MasterChefAbi from '../../../abis/matic/MaiFarmChef.json';
import pools from '../../../data/matic/maiLpPools.json';
import { quickClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
import { AbiItem } from 'ethereum-abi-types-generator';

const mai = addressBook.polygon.platforms.mai;

const getMaiApys = async () =>
  getMasterChefApys({
    masterchef: mai.chef,
    masterchefAbi: MasterChefAbi as AbiItem[],
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [],
    oracle: 'tokens',
    oracleId: 'QI',
    decimals: '1e18',
    tradingFeeInfoClient: quickClient,
    liquidityProviderFee: 0.0025,
    // log: true,
  });

export default getMaiApys;
