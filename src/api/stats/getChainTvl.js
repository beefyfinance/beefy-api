const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const { web3Factory, multicallAddress } = require('../../utils/web3');
const getVaults = require('../../utils/getVaults.js');
const fetchPrice = require('../../utils/fetchPrice');

const BeefyVaultV6ABI = require('../../abis/BeefyVaultV6.json');

const getChainTvl = async chain => {
  const chainId = chain.chainId;
  const vaults = await getVaults(chain.vaultsEndpoint);
  const vaultBalances = await getVaultBalances(chainId, vaults);

  let tvls = { [chainId]: {} };
  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i];
    const vaultBal = vaultBalances[i];
    let tokenPrice = 0;
    try {
      tokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
    } catch (e) {
      console.error('getTvl fetchPrice', chainId, vault.oracle, vault.oracleId, e);
    }
    const tvl = vaultBal.times(tokenPrice).dividedBy(10 ** (vault.tokenDecimals ?? 18));

    let item = { [vault.id]: 0 };
    if (!tvl.isNaN()) {
      item = { [vault.id]: Number(tvl.toFixed(2)) };
    }

    tvls[chainId] = { ...tvls[chainId], ...item };
  }
  return tvls;
};

const getVaultBalances = async (chainId, vaults) => {
  const web3 = web3Factory(chainId);
  const multicall = new MultiCall(web3, multicallAddress(chainId));
  const balanceCalls = [];
  vaults.forEach(vault => {
    const vaultContract = new web3.eth.Contract(BeefyVaultV6ABI, vault.earnedTokenAddress);
    balanceCalls.push({
      balance: vaultContract.methods.balance(),
    });
  });
  const res = await multicall.all([balanceCalls]);
  return res[0].map(v => new BigNumber(v.balance));
};

module.exports = getChainTvl;
