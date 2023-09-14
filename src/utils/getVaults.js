const getVaults = async vaultsEndpoint => {
  try {
    return await fetch(vaultsEndpoint).then(res => res.json());
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = getVaults;

// 55.28
