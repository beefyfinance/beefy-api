const { moonbeamWeb3: web3 } = require('../../../utils/web3');
import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys';
const pools = require('../../../data/moonbeam/stellaswapLpPools.json');

const getStellaswapApys = async () =>
  await getMultiRewardMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E',
    secondsPerBlock: 1,
    pools: pools,
    oracleId: 'STELLA',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
  });

module.exports = { getStellaswapApys };
