const getVaults = async vaultsEndpoint => {
  const response = await fetch(vaultsEndpoint);
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch vaults for ${vaultsEndpoint}: ${response.status} ${response.statusText}`
    );
  }

  const vaults = await response.json();
  if (!vaults || !Array.isArray(vaults)) {
    throw new Error(`Invalid vaults data for ${vaultsEndpoint}`);
  }

  // Backwards compatibility
  return vaults.map(vault => {
    if ('type' in vault) {
      return {
        ...vault,
        isGovVault: vault.type === 'gov',
        type: vault.type,
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
};

module.exports = getVaults;

// 55.28
