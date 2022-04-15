const { moonriverWeb3: web3 } = require('../../../utils/web3');
import { MOONRIVER_CHAIN_ID as chainId } from '../../../constants';
import { getMultiRewardMasterChefApys } from '../common/getMultiRewardMasterChefApys';

const lpPools = require('../../../data/moonriver/solarbeamDualLpV2Pools.json');
const stablePools = require('../../../data/moonriver/solarbeamStablePools.json');

const { SOLAR_LPF } = require('../../../constants');
import { solarbeamClient } from '../../../apollo/client';

const getSolarbeamDualLpV2Apys = async () =>
  await getMultiRewardMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x0329867a8c457e9F75e25b0685011291CD30904F',
    secondsPerBlock: 1,
    pools: [...lpPools, ...stablePools],
    oracleId: 'SOLAR',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: solarbeamClient,
    liquidityProviderFee: SOLAR_LPF,
    // log: true,
  });

module.exports = { getSolarbeamDualLpV2Apys };
