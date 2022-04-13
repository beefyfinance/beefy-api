const axios = require('axios');
const fetch = require('node-fetch');

const getVaults = async vaultsEndpoint => {
  try {
    const response = (await axios.get(vaultsEndpoint)).data;
    // const response = await fetch(vaultsEndpoint).then(res=> res.text());
    const data = response;
    let vaults = '[' + data.substring(data.indexOf('\n') + 1);
    vaults = eval(vaults);
    return vaults;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = getVaults;

// 55.28
