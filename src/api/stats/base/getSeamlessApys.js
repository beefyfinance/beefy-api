const { getAaveV3ApyData } = require('../common/aave/getAaveV3Apys');
const pools = require('../../../data/base/seamlessPools.json');
const { BASE_CHAIN_ID } = require('../../../constants');

const config = {
  dataProvider: '0x2A0979257105834789bC6b9E1B00446DFbA8dFBa',
  incentives: '0x91Ac2FfF8CBeF5859eAA6DdA661feBd533cD3780',
  rewards: [
    {
      token: '0x1C7a460413dD4e964f96D8dFC56E7223cE88CD85',
      oracle: 'tokens',
      oracleId: 'SEAM',
      decimals: '1e18',
    },
  ],
};

const getSeamlessApys = async () => {
  return getAaveV3ApyData(config, pools, BASE_CHAIN_ID);
};

module.exports = { getSeamlessApys };
