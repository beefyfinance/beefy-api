import { BigNumber, utils, ethers } from 'ethers';

import { fetchPrice } from '../../utils/fetchPrice.ts';
import { API_BASE_URL, BSC_RPC } from '../../constants.ts';

import vaults_json from '../../data/cmc.json' with { type: "json" };
import BeefyVault from '../../abis/BeefyVault.ts';

import { getLoggerFor } from '../../utils/logger/index.ts';
const logger = getLoggerFor({ module: 'cmc' });

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

export const vaults = async ctx => {
  try {
    const apys = await fetch(`${API_BASE_URL}/apy`).then(res.json());

    let promises = [];
    vaults_json.pools.forEach(vault => {
      vault.apr = apys[vault.apyId].toFixed(6);
      promises.push(fetchVaultTvl({ vault }));
    });
    await Promise.all(promises);
  } catch (err) {
    logger.warn({ err }, 'cmc request failed');
  }

  ctx.body = vaults_json;
};
