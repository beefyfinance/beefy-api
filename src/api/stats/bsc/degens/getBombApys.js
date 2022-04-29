const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId, PCS_LPF } = require('../../../../constants');
const { getMasterChefApys } = require('../../common/getMasterChefApys');
const pools = require('../../../../data/degens/bombLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const getBombLpApys = async () =>
  await getMasterChefApys({
    web3,
    chainId,
    masterchef: '0x1083926054069AaD75d7238E9B809b0eF9d94e5B',
    tokenPerBlock: 'tSharePerSecond',
    hasMultiplier: false,
    pools,
    oracleId: 'BOMBSHARE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: PCS_LPF,
    // log: true,
  });

module.exports = getBombLpApys;
