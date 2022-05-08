const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId, PCS_LPF } = require('../../../../constants');
const { getMasterChefApys } = require('../../common/getMasterChefApys');
const pools = require('../../../../data/degens/empLpPools.json');
const { cakeClient } = require('../../../../apollo/client');

const getEmpLpApys = async () =>
  await getMasterChefApys({
    web3,
    chainId,
    masterchef: '0x97a68a7949ee30849d273b0c4450314ae26235b1',
    tokenPerBlock: 'tSharePerSecond',
    hasMultiplier: false,
    pools,
    oracleId: 'ESHARE',
    oracle: 'tokens',
    decimals: '1e18',
    secondsPerBlock: 1,
    tradingFeeInfoClient: cakeClient,
    liquidityProviderFee: PCS_LPF,
    // log: true,
  });

module.exports = getEmpLpApys;
