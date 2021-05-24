const BigNumber = require('bignumber.js');
const { web3Factory } = require('../../utils/web3');
const getVaults = require('../../utils/getVaults.js');
const fetchPrice = require('../../utils/fetchPrice');

const BeefyVaultV6ABI = require('../../abis/BeefyVaultV6.json');

const DECIMALS = '1e18';

const getChainTvl = async chain => {
  let chainVaults = await getVaults(chain.vaultsEndpoint);

  let promises = [];
  chainVaults.forEach(vault => promises.push(getVaultTvl(vault, chain.chainId)));

  const values = await Promise.allSettled(promises);
  let tvl = { [chain.chainId]: {} };

  for (const item of values) {
    if (item.status !== 'fulfilled') {
      continue;
    }
    tvl[chain.chainId] = { ...tvl[chain.chainId], ...item.value };
  }

  return tvl;
};

const getVaultTvl = async (vault, chainId) => {
  const web3 = web3Factory(chainId);
  const vaultContract = new web3.eth.Contract(BeefyVaultV6ABI, vault.earnedTokenAddress);
  const vaultBal = new BigNumber(await vaultContract.methods.balance().call());
  const tokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
  const tvl = vaultBal.times(tokenPrice).dividedBy(DECIMALS);
  if (tvl.isNaN()) {
    return { [vault.id]: 0 };
  }
  return { [vault.id]: Number(tvl.toFixed(2)) };
};

module.exports = getChainTvl;
