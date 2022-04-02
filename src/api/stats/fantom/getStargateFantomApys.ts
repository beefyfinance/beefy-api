const { getMasterChefApys } = require('../common/getMasterChefApys');
const { fantomWeb3: web3 } = require('../../../utils/web3');

const getStargateFantomApys = async () =>
  await getMasterChefApys({
    web3: web3,
    chainId: 250,
    masterchef: '0x224D8Fd7aB6AD4c6eb4611Ce56EF35Dec2277F03',
    tokenPerBlock: 'stargatePerBlock',
    hasMultiplier: false,
    singlePools: [
      {
        name: 'stargate-fantom-usdc',
        poolId: 0,
        address: '0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97',
        oracle: 'tokens',
        oracleId: 'USDC',
        decimals: '1e6',
      },
    ],
    oracleId: 'STG',
    oracle: 'tokens',
    decimals: '1e18',
  });

module.exports = getStargateFantomApys;
