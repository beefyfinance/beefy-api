const axios = require('axios');

const getVaults = async vaultsEndpoint => {
  try {
    const response = await axios.get(vaultsEndpoint);

    const data = response.data;
    const etag = response.headers.etag;

    // Debugging source file updates
    // console.log(etag)

    let vaults = '[' + data.substring(data.indexOf('\n') + 1);
    vaults = eval(vaults);

    return {
      etag: etag,
      vaults: vaults,
    };
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = getVaults;
