const { getBifiGovApr } = require('../common/getBifiGovApr');
const { CELO_CHAIN_ID } = require('../../../constants');

const BIFI = '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C';
const REWARDS = '0x2D250016E3621CfC50A0ff7e5f6E34bbC6bfE50E';
const DECIMALS = '1e18';
const BLOCKS_PER_DAY = 28800;

const getCeloBifiGovApy = async () => {
  return await getBifiGovApr(
    CELO_CHAIN_ID,
    'celo',
    'CELO',
    DECIMALS,
    REWARDS,
    BIFI,
    3 * 365,
    1,
    BLOCKS_PER_DAY
  );
};

module.exports = { getCeloBifiGovApy };
