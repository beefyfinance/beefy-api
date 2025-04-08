const { SONIC_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/sonic/defiveLpPools.json');
import { defiveClient } from '../../../apollo/client';

const getDefiveApys = async () =>
  await getMasterChefApys({
    chainId: chainId,
    masterchef: '0x4aDe5608127594CD9eA131f0826AEA02FE517461',
    tokenPerBlock: 'emission',
    pools: pools,
    oracleId: 'FIVE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: defiveClient,
    liquidityProviderFee: 0.0014,
    // log: true,
  });

module.exports = getDefiveApys;
