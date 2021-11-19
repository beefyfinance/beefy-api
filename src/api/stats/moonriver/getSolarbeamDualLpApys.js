const { moonriverWeb3: web3 } = require('../../../utils/web3');
import { MOONRIVER_CHAIN_ID as chainId } from '../../../constants';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys';

const pools = require('../../../data/moonriver/solarbeamDualLpPools.json');
const { SOLAR_LPF } = require('../../../constants');
import { solarbeamClient } from '../../../apollo/client';

const getSolarbeamDualLpApys = async () =>
  await getMultiRewardMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xA3Dce528195b8D15ea166C623DB197B2C3f8D127',
    secondsPerBlock: 1,
    pools: pools,
    oracleId: 'SOLAR',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: solarbeamClient,
    liquidityProviderFee: SOLAR_LPF,
    burn: 0.3,
    // log: true,
  });

module.exports = { getSolarbeamDualLpApys };
