const { getMultichainVaults, getSingleChainVaults } = require('../stats/getMultichainVaults');
const { getVaultFees } = require('./getVaultFees');

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

async function vaultsLastHarvest(ctx) {
  try {
    const lastHarvests = getMultichainVaults().reduce((res, vault) => {
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

module.exports = {
  multichainVaults,
  vaultsLastHarvest,
  singleChainVaults,
  vaultFees,
  vaultsLastHarvest,
};
