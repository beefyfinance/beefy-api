const { moonbeamWeb3: web3 } = require('../../../utils/web3');
import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
import { stellaClient } from '../../../apollo/client';
const pools = require('../../../data/moonbeam/stellaswapLpPools.json');
const getBlockTime = require('../../../utils/getBlockTime');

const getStellaswapApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E',
    tokenPerBlock: 'stellaPerBlock',
    hasMultiplier: false,
    secondsPerBlock: await getBlockTime(1284),
    pools: pools,
    oracleId: 'STELLA',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: stellaClient,
    liquidityProviderFee: 0.0025,
    // log: true,
  });

module.exports = { getStellaswapApys };
