const { moonriverWeb3: web3 } = require('../../../utils/web3');
import { MOONRIVER_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';
const getBlockTime = require('../../../utils/getBlockTime');

const pools = require('../../../data/moonriver/solarbeamLpPools.json');
const { SOLAR_LPF } = require('../../../constants');
import { solarbeamClient } from '../../../apollo/client';

const getSolarbeamLpApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xf03b75831397D4695a6b9dDdEEA0E578faa30907',
    tokenPerBlock: 'solarPerBlock',
    hasMultiplier: false,
    secondsPerBlock: await getBlockTime(1285),
    pools: pools,
    oracleId: 'SOLAR',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: solarbeamClient,
    liquidityProviderFee: SOLAR_LPF,
    // log: true,
  });

module.exports = { getSolarbeamLpApys };
