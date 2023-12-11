const getVaults = async vaultsEndpoint => {
  try {
    const response = await fetch(vaultsEndpoint).then(res => res.json());

    // Backwards compatibility
    if (response && Array.isArray(response)) {
      return response.map(vault => {
        if ('type' in vault) {
          return {
            ...vault,
            isGovVault: vault.type === 'gov',
          };
        } else if ('isGovVault' in vault) {
          return {
            ...vault,
            type: vault.isGovVault ? 'gov' : 'standard',
          };
        } else {
          return {
            ...vault,
            isGovVault: false,
            type: 'standard',
          };
        }
      });
    }

    throw new Error('Invalid response');
  } catch (err) {
    console.error(err);
    return 0;
  }
};

module.exports = getVaults;

// 55.28
