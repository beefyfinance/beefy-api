const BigNumber = require('bignumber.js');
const { web3Factory } = require('../../utils/web3');
const getVaults = require('../../utils/getVaults.js');
const fetchPrice = require('../../utils/fetchPrice');
const { sleep } = require('../../utils/time');

const StrategyABI = require('../../abis/StrategyABI.json');
const BeefyVaultV6ABI = require('../../abis/BeefyVaultV6.json');

const DECIMALS = '1e18';

const getChainTvl = async chain => {
  let chainVaults = await getVaults(chain.vaultsEndpoint);

  let promises = [];
  chainVaults.forEach(async vault => promises.push(getVaultTvl(vault, chain.chainId)));

  const values = await Promise.allSettled(promises);
  let tvl = { [chain.chainId]: {} };

  for (item of values) {
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
  const strategyAddress = await vaultContract.methods.strategy().call();
  const strategyContract = new web3.eth.Contract(StrategyABI, strategyAddress);
  const balanceOfWantLocked = new BigNumber(await strategyContract.methods.balanceOf().call());
  const tokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
  const tvl = balanceOfWantLocked.times(BigNumber(tokenPrice).dividedBy(DECIMALS));
  if (isNaN(tvl)) {
    return { [vault.id]: '0' };
  }
  return { [vault.id]: tvl };
};

module.exports = getChainTvl;
