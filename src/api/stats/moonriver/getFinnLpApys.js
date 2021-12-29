const { moonriverWeb3: web3 } = require('../../../utils/web3');
import { MOONRIVER_CHAIN_ID as chainId } from '../../../constants';
import { getMasterChefApys } from '../common/getMasterChefApys';

const pools = require('../../../data/moonriver/finnLpPools.json');
import { finnClient } from '../../../apollo/client';

const getFinnLpApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0x1f4b7660b6AdC3943b5038e3426B33c1c0e343E6',
    tokenPerBlock: 'finnPerSecond',
    hasMultiplier: false,
    secondsPerBlock: 1,
    pools: pools,
    oracleId: 'FINN',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: finnClient,
    liquidityProviderFee: 0.0025,
    // log: true,
  });

module.exports = { getFinnLpApys };
