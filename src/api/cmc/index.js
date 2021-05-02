const { BigNumber, utils, ethers } = require('ethers');
const axios = require('axios');

const fetchPrice = require('../../utils/fetchPrice');
const { API_BASE_URL, BSC_RPC } = require('../../constants');

const vaults_json = require('../../data/cmc.json');
const BeefyVault = require('../../abis/BeefyVault.json');

const fetchVaultTvl = async ({ vault }) => {
  const provider = new ethers.providers.JsonRpcProvider(BSC_RPC);
  const vaultContract = new ethers.Contract(vault.contract, BeefyVault, provider);
  const vaultBalance = await vaultContract.balance();

  const price = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
  const normalizationFactor = 1000000000;
  const normalizedPrice = BigNumber.from(Math.round(price * normalizationFactor));
  const vaultBalanceInUsd = vaultBalance.mul(normalizedPrice.toString());
  const result = vaultBalanceInUsd.div(normalizationFactor);

  const vaultObjTvl = utils.formatEther(result);
  vault.totalStaked = Number(vaultObjTvl).toFixed(2);

  delete vault.apyId;
  delete vault.contract;
  delete vault.oracle;
  delete vault.oracleId;

  return result;
};

const vaults = async ctx => {
  try {
    let response = await axios.get(`${API_BASE_URL}/apy`);
    const apys = response.data;

    let promises = [];
    vaults_json.pools.forEach(vault => {
      vault.apr = apys[vault.apyId].toFixed(6);
      promises.push(fetchVaultTvl({ vault }));
    });
    await Promise.all(promises);
  } catch (err) {
    console.error('CMC error');
  }

  ctx.body = vaults_json;
};

module.exports = {
  vaults,
};
