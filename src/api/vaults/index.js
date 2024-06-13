const {
  getMultichainVaults,
  getSingleChainVaults,
  getMultichainGovVaults,
  getSingleChainGovVaults,
  getVaultByID,
  getMultichainCowVaults,
  getSingleChainCowVaults,
  getCowVaultById,
} = require('../stats/getMultichainVaults');
const { getVaultFees } = require('./getVaultFees');

async function multichainHarvestableVaults(ctx) {
  try {
    const multichainVaults = getMultichainVaults().concat(getMultichainCowVaults());
    ctx.status = 200;
    ctx.body = [...multichainVaults];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function singleHarvestableVaults(ctx) {
  try {
    const chainVaults = getSingleChainVaults(ctx.params.chainId).concat(
      getSingleChainCowVaults(ctx.params.chainId)
    );
    ctx.status = 200;
    ctx.body = [...chainVaults];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function multichainVaults(ctx) {
  try {
    const multichainVaults = getMultichainVaults();
    ctx.status = 200;
    ctx.body = [...multichainVaults];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function multichainGovVaults(ctx) {
  try {
    const multichainGovVaults = getMultichainGovVaults();
    ctx.status = 200;
    ctx.body = [...multichainGovVaults];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function multichainCowVaults(ctx) {
  try {
    const multichainCowVaults = getMultichainCowVaults();
    ctx.status = 200;
    ctx.body = [...multichainCowVaults];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function vaultsLastHarvest(ctx) {
  try {
    const lastHarvests = getMultichainVaults()
      .concat(getMultichainCowVaults())
      .reduce((res, vault) => {
        const { id, lastHarvest } = vault;
        res[id] = lastHarvest;
        return res;
      }, {});
    ctx.status = 200;
    ctx.body = lastHarvests;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function singleChainVaults(ctx) {
  try {
    const chainVaults = getSingleChainVaults(ctx.params.chainId);
    ctx.status = 200;
    ctx.body = chainVaults ? [...chainVaults] : [];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function singleVault(ctx) {
  try {
    const vault = getVaultByID(ctx.params.vaultId);
    ctx.status = vault ? 200 : 404;
    ctx.body = vault ?? {};
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function singleCowVault(ctx) {
  try {
    const vault = getCowVaultById(ctx.params.vaultId);
    ctx.status = vault ? 200 : 404;
    ctx.body = vault ?? {};
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function singleGovChainVaults(ctx) {
  try {
    const chainVaults = getSingleChainGovVaults(ctx.params.chainId);
    ctx.status = 200;
    ctx.body = chainVaults ? [...chainVaults] : [];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function singleCowChainVaults(ctx) {
  try {
    const chainVaults = getSingleChainCowVaults(ctx.params.chainId);
    ctx.status = 200;
    ctx.body = chainVaults ? [...chainVaults] : [];
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function vaultFees(ctx) {
  try {
    const vaultFees = getVaultFees();
    ctx.status = 200;
    ctx.body = vaultFees;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

async function singleHarvestableVault(ctx) {
  try {
    let vault = getVaultByID(ctx.params.vaultId);
    if (!vault) {
      vault = getCowVaultById(ctx.params.vaultId);
    }
    ctx.status = vault ? 200 : 404;
    ctx.body = vault ?? {};
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = {
  multichainHarvestableVaults,
  multichainVaults,
  multichainGovVaults,
  multichainCowVaults,
  singleChainVaults,
  singleGovChainVaults,
  singleCowChainVaults,
  singleVault,
  singleCowVault,
  vaultFees,
  vaultsLastHarvest,
  singleHarvestableVaults,
  singleHarvestableVault,
};
