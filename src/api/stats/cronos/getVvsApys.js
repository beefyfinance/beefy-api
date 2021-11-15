const { cronosWeb3: web3 } = require('../../../utils/web3');
const { CRONOS_CHAIN_ID: chainId } = require('../../../constants');
const { getMasterChefApys } = require('../common/getMasterChefApys');
const pools = require('../../../data/cronos/vvsLpPools.json');
import { vvsClient } from '../../../apollo/client';

const getVvsApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xDccd6455AE04b03d785F12196B492b18129564bc',
    tokenPerBlock: 'vvsPerBlock',
    hasMultiplier: false,
    pools: pools,
    singlePools: [
      {
        name: 'vvs-vvs',
        poolId: 0,
        address: '0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03',
        oracle: 'tokens',
        oracleId: 'VVS',
        decimals: '1e18',
      },
    ],
    oracleId: 'VVS',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: vvsClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getVvsApys;
