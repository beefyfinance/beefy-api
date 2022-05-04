import { getMasterChefApys } from '../common/getMasterChefApys';
import MasterChefAbi from '../../../abis/fantom/MaiFarmChef.json';
import pools from '../../../data/fantom/maiLpPools.json';
import { beetClient } from '../../../apollo/client';
import { fantomWeb3 } from '../../../utils/web3';

const getMaiApys = async () =>
  await getMasterChefApys({
    web3: fantomWeb3,
    chainId: 250,
    masterchef: '0x230917f8a262bF9f2C3959eC495b11D1B7E1aFfC',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'rewardPerBlock',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'QI',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: beetClient,
    liquidityProviderFee: 0.0025,
    // log: true,
  });

module.exports = getMaiApys;
