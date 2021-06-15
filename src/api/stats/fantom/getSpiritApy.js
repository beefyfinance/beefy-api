const getMasterChefApys = require('./getFantomMasterChefApys');

const MasterChefAbi = require('../../../abis/fantom/SpiritChef.json');
const spiritPools = require('../../../data/fantom/spiritPools.json');
const { spiritClient } = require('../../../apollo/client');

const getSpiritApys = async () => {
  const single = getMasterChefApys({
    masterchef: '0x9083EA3756BDE6Ee6f27a6e996806FBD37F6F093',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'spiritPerBlock',
    hasMultiplier: true,
    singlePools: [
      {
        name: 'spirit-spirit',
        poolId: 0,
        address: '0x5Cc61A78F164885776AA610fb0FE1257df78E59B',
        oracle: 'tokens',
        oracleId: 'SPIRIT',
        decimals: '1e18',
      },
    ],
    oracle: 'tokens',
    oracleId: 'SPIRIT',
    decimals: '1e18',
    // log: true,
  });

  const spirit = getMasterChefApys({
    masterchef: '0x9083EA3756BDE6Ee6f27a6e996806FBD37F6F093',
    masterchefAbi: MasterChefAbi,
    tokenPerBlock: 'spiritPerBlock',
    hasMultiplier: true,
    pools: spiritPools,
    oracleId: 'SPIRIT',
    oracle: 'tokens',
    decimals: '1e18',
    // log: true,
    tradingFeeInfoClient: spiritClient,
    liquidityProviderFee: 0.0025,
  });

  let apys = {};
  const values = await Promise.all([spirit, single]);
  for (const item of values) {
    apys = { ...apys, ...item };
  }
  return apys;
};

module.exports = getSpiritApys;
