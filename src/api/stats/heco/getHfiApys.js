const axios = require('axios');
const https = require('https');

const pools = require('../../../data/heco/hfiPools.json');
const { compound } = require('../../../utils/compound');
const { BASE_HPY } = require('../../../constants');

const getHfiApys = async () => {
  let apys = {};

  const hfiStats = await fetchHfiStats();

  const values = pools.map(pool => {
    const poolStat = hfiStats[pool.poolId];

    const vaultApy = Number(poolStat['annual']);
    const vaultDec = vaultApy / 100;
    const aprHfi = Number(poolStat['hfi_annual']);
    const aprDec = aprHfi / 100;
    const hfiApy = compound(aprDec * 0.955, BASE_HPY, 1);
    const apy = vaultDec + hfiApy;

    // console.log(pool.name, apy);

    return { [pool.name]: apy };
  });

  for (let item of values) {
    apys = { ...apys, ...item };
  }

  return apys;
};

const fetchHfiStats = async () => {
  // Have to override the due to error in recieving certificates from HFI. Only done for this instance otherwise will increase vulnerability.
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });
  try {
    const response = await axios.get('https://api.hfi.one/apy', { httpsAgent: agent });
    return response.data.data;
  } catch (err) {
    console.error(err);
    return {};
  }
};

module.exports = getHfiApys;
