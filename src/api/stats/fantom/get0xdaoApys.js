import { SPOOKY_LPF } from '../../../constants';

const { getMasterChefApys } = require('../common/getMasterChefApys');
const { fantomWeb3 } = require('../../../utils/web3');
const pools = require('../../../data/fantom/0xdaoPools.json');
import { spookyClient } from '../../../apollo/client';

const get0xdaoApys = async () =>
  await getMasterChefApys({
    web3: fantomWeb3,
    chainId: 250,
    masterchef: '0xa7821C3e9fC1bF961e280510c471031120716c3d',
    tokenPerBlock: 'oxdPerSecond',
    hasMultiplier: false,
    pools: pools,
    oracleId: 'OXD',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: spookyClient,
    liquidityProviderFee: SPOOKY_LPF,
    // log: true,
  });

module.exports = get0xdaoApys;
