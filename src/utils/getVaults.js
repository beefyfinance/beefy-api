const fetch = require('node-fetch');

const getVaults = async vaultsEndpoint => {
  try {
    let vaults = await fetch(vaultsEndpoint).then(res => res.json());
    vaults = vaults.filter(vault => !vault.isGovVault);
    return vaults;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = getVaults;

// 55.28
