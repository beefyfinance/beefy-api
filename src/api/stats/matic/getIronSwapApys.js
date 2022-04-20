import { DFYN_LPF } from '../../../constants';
import { dfynClient } from '../../../apollo/client';

const MasterChefAbi = require('../../../abis/degens/IronChef.json');
const { getMasterChefApys } = require('./getMaticMasterChefApys');
const pools = require('../../../data/matic/ironSwapPools.json');

const getIronSwapApys = async () => {
  return getMasterChefApys({
    masterchef: '0x1fD1259Fa8CdC60c6E8C86cfA592CA1b8403DFaD',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerSecond',
    secondsPerBlock: 1,
    allocPointIndex: '2',
    hasMultiplier: false,
    pools: pools,
    oracle: 'tokens',
    oracleId: 'ICEiron',
    decimals: '1e18',
    tradingFeeInfoClient: dfynClient,
    liquidityProviderFee: DFYN_LPF,
    // log: true,
  });
};

module.exports = getIronSwapApys;
