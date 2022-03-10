const { moonbeamWeb3: web3 } = require('../../../utils/web3');
import { MOONBEAM_CHAIN_ID as chainId } from '../../../constants';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys';

const pools = require('../../../data/moonbeam/solarFlareLpPools.json');
const { SOLAR_LPF } = require('../../../constants');
import { solarflareClient } from '../../../apollo/client';

const getSolarFlareApys = async () =>
  await getMultiRewardMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x995da7dfB96B4dd1e2bd954bE384A1e66cBB4b8c',
    secondsPerBlock: 1,
    pools: pools,
    oracleId: 'FLARE',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: solarflareClient,
    liquidityProviderFee: SOLAR_LPF,
    // log: true,
  });

module.exports = { getSolarFlareApys };
