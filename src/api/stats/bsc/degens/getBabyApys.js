const { bscWeb3: web3 } = require('../../../../utils/web3');
const { BSC_CHAIN_ID: chainId } = require('../../../../constants');
const { getMasterChefApys } = require('../../common/getMasterChefApys');

const pools = require('../../../../data/degens/babyLpPools.json');
const { babyClient } = require('../../../../apollo/client');

const getBabyApys = () =>
  getMasterChefApys({
    web3: web3,
    chainId: chainId,
    masterchef: '0xdfAa0e08e357dB0153927C7EaBB492d1F60aC730',
    tokenPerBlock: 'cakePerBlock',
    pools: pools,
    singlePools: [
      {
        name: 'baby-baby',
        poolId: 0,
        address: '0x53E562b9B7E5E94b81f10e96Ee70Ad06df3D2657',
        oracle: 'tokens',
        oracleId: 'BABY',
        decimals: '1e18',
      },
    ],
    oracleId: 'BABY',
    oracle: 'tokens',
    decimals: '1e18',
    tradingFeeInfoClient: babyClient,
    liquidityProviderFee: 0.003,
    // log: true,
  });

module.exports = getBabyApys;
