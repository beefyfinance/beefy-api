const axios = require('axios');

const pools = require('../../../data/autoPools.json');
const { compound } = require('../../../utils/compound');
const { BASE_HPY } = require('../../../../constants');

const getAutoApys = async () => {
  let apys = {};

  const autoStats = await fetchAutoStats();

  const values = pools.map(pool => {
    const poolStat = autoStats[pool.poolId];

    const apr = Number(poolStat['APR']);
    const aprAuto = Number(poolStat['APR_AUTO']);
    const apy = compound(apr + aprAuto, BASE_HPY, 1, 0.955);

    return { [pool.name]: apy };
  });

  for (item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const fetchAutoStats = async () => {
  try {
    const response = await axios.get('https://api.autofarm.network/bsc/get_farms_data');
    return response.data.pools;
  } catch (err) {
    console.error(err);
    return {};
  }
};

module.exports = getAutoApys;
