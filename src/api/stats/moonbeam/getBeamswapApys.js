const { moonbeamWeb3: web3 } = require('../../../utils/web3');
const { MOONBEAM_CHAIN_ID: chainId, BEAMSWAP_LPF } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
import { getEDecimals } from '../../../utils/getEDecimals';
const pools = require('../../../data/moonbeam/beamswapLpPools.json');
import { beamClient } from '../../../apollo/client';
import { addressBook } from '../../../../packages/address-book/address-book';
const {
  moonbeam: {
    platforms: {
      beamswap: { masterchef },
    },
    tokens: { GLINT },
  },
} = addressBook;

const getBeamswapApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: masterchef,
    tokenPerBlock: 'beamPerSec',
    secondsPerBlock: 1,
    hasMultiplier: false,
    pools: pools,
    oracleId: 'GLINT',
    oracle: 'tokens',
    decimals: getEDecimals(GLINT.decimals),
    tradingFeeInfoClient: beamClient,
    liquidityProviderFee: BEAMSWAP_LPF,
    //log: true,
  });

module.exports = getBeamswapApys;
