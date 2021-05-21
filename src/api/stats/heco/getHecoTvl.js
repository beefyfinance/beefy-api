const BigNumber = require('bignumber.js');
const { hecoWeb3: web3 } = require('../../../utils/web3');
const getVaults = require('../../../utils/getVaults.js');
const fetchPrice = require('../../../utils/fetchPrice');
const { sleep } = require('../../../utils/time');

const StrategyABI = require('../../../abis/heco/StrategyABI.json');
const BeefyVaultV6ABI = require('../../../abis/heco/BeefyVaultV6.json');

const vaultsEndpoint =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/heco_pools.js';
const DECIMALS = '1e18';

const getHecoTvl = async () => {
  let vaults = await getVaults(vaultsEndpoint);

  let promises = [];
  for (var i = 0; i < vaults.length; i++) {
    promises.push(getVaultTvl(vaults[i]));
    await sleep(100);
  }

  const values = await Promise.all(promises);
  let tvl = {};

  for (item of values) {
    tvl = { ...tvl, ...item };
  }

  return tvl;
};

const getVaultTvl = async vault => {
  const tvl = await getTotalTvlStakedInUsd(vault);
  return { [vault.id]: tvl };
};

getTotalTvlStakedInUsd = async vault => {
  const vaultContract = new web3.eth.Contract(BeefyVaultV6ABI, vault.earnedTokenAddress);
  const strategyAddress = await vaultContract.methods.strategy().call();
  const strategyContract = new web3.eth.Contract(StrategyABI, strategyAddress);
  const balanceOfWantLocked = new BigNumber(await strategyContract.methods.balanceOf().call());
  const tokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
  return balanceOfWantLocked.times(BigNumber(tokenPrice).dividedBy(DECIMALS));
};

module.exports = getHecoTvl;
