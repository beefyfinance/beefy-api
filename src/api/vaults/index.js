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
    const vaultFees = await getVaultFees();
    ctx.status = 200;
    ctx.body = vaultFees;
  } catch (err) {
    console.error(err);
    ctx.status = 500;
  }
}

module.exports = {
  multichainVaults,
  singleChainVaults,
  vaultFees,
};
