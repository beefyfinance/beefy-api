const axios = require('axios');

const pools = require('../../../../data/autoPools.json');
const { compound } = require('../../../../utils/compound');
const { BASE_HPY } = require('../../../../constants');

const getAutoApys = async () => {
  let apys = {};

  const autoStats = await fetchAutoStats();
  const paused = [2, 3, 4, 16, 17];

  const values = pools.map(pool => {
    if (paused.includes(pool.poolId)) {
      return { [pool.name]: null };
    }
    const poolStat = autoStats[pool.poolId];

    const apr = Number(poolStat['APR']);
    const aprAuto = Number(poolStat['APR_AUTO']);
    const apy = compound(apr + aprAuto * 0.955, BASE_HPY, 1);

    // console.log(pool.name, apy);

    return { [pool.name]: apy };
  });

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const fetchAutoStats = async () => {
  try {
    const response = await axios.get('https://static.autofarm.network/bsc/farm_data.json');
    return response.data.pools;
  } catch (err) {
    console.error(err);
    return {};
  }
};

module.exports = getAutoApys;
