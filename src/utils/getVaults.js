const getVaults = async vaultsEndpoint => {
  try {
    let vaults = await fetch(vaultsEndpoint).then(res => res.json());
    return vaults;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = getVaults;

// 55.28
