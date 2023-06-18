const { getBifiGovApr } = require('../common/getBifiGovApr');
const { HECO_CHAIN_ID } = require('../../../constants');

const BIFI = '0x765277EebeCA2e31912C9946eAe1021199B39C61';
const REWARDS = '0x5f7347fedfD0b374e8CE8ed19Fc839F59FB59a3B';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getHecoBifiGovApy = async () => {
  return await getBifiGovApr(
    HECO_CHAIN_ID,
    'heco',
    'HT',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = getHecoBifiGovApy;
