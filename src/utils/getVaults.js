const fetch = require('node-fetch');

const cache = {};

const getVaults = async vaultsEndpoint => {
  if (vaultsEndpoint in cache) {
    return cache[vaultsEndpoint];
  }
  try {
    const response = await fetch(vaultsEndpoint).then(res => res.text());
    const data = response;
    let vaults = '[' + data.substring(data.indexOf('\n') + 1);
    vaults = eval(vaults);
    cache[vaultsEndpoint] = vaults;
    return vaults;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = getVaults;

// 55.28
