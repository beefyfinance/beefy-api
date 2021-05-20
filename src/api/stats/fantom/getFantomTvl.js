const BigNumber = require('bignumber.js');
const { fantomWeb3: web3 } = require('../../../utils/web3');
const { FANTOM_CHAIN_ID } = require('../../../constants');
const getVaults = require('../../../utils/getVaults.js');
const fetchPrice = require('../../../utils/fetchPrice');
const { sleep } = require('../../../utils/time');

const StrategyABI = require('../../../abis/StrategyABI.json');
const BeefyVaultV6ABI = require('../../../abis/BeefyVaultV6.json');

const vaultsEndpoint =
  'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/features/configure/vault/fantom_pools.js';
const DECIMALS = '1e18';

const getFantomTvl = async () => {
  let vaults = await getVaults(vaultsEndpoint);

  let promises = [];
  for (var i = 0; i < vaults.length; i++) {
    promises.push(getVaultTvl(vaults[i]));
    await sleep(100);
  }

  const values = await Promise.allSettled(promises);
  let tvl = { [FANTOM_CHAIN_ID]: {} };

  for (item of values) {
    if (item.status !== 'fulfilled') {
      continue;
    }
    tvl[FANTOM_CHAIN_ID] = { ...tvl[FANTOM_CHAIN_ID], ...item.value };
  }

  return tvl;
};

const getVaultTvl = async vault => {
  const vaultContract = new web3.eth.Contract(BeefyVaultV6ABI, vault.earnedTokenAddress);
  const strategyAddress = await vaultContract.methods.strategy().call();
  const strategyContract = new web3.eth.Contract(StrategyABI, strategyAddress);
  const balanceOfWantLocked = new BigNumber(await strategyContract.methods.balanceOf().call());
  const tokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
  const tvl = balanceOfWantLocked.times(BigNumber(tokenPrice).dividedBy(DECIMALS));
  if (isNaN(tvl)) {
    return { [vault.id]: 0 };
  }
  return { [vault.id]: tvl };
};

module.exports = getFantomTvl;
