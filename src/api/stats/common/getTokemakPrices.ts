const BigNumber = require('bignumber.js');
const { default: ITokemakVault } = require('../../../abis/ITokemakVault');
const { fetchContract } = require('../../rpc/client');

const DECIMALS = '1e18';

export const getTokemakPrices = async (chainId, pools, tokenPrices) => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPrice(chainId, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (chainId, vault, tokenPrices) => {
  const vaultContract = fetchContract(vault.address, ITokemakVault, chainId);

  const totalAssets = new BigNumber((await vaultContract.read.totalAssets()).toString());
  const totalSupply = new BigNumber((await vaultContract.read.totalSupply()).toString());
  const tokenPrice = getTokenPrice(tokenPrices, vault.underlyingOracleId);
  const price = totalAssets
    .multipliedBy(DECIMALS)
    .dividedBy(totalSupply)
    .multipliedBy(tokenPrice)
    .dividedBy(vault.decimals)
    .toNumber();
  //console.log(`Price for ${vault.name} is ${price}`);

  let tokens = [];
  let balances = [];
  const supply = totalSupply.dividedBy(vault.decimals).toString(10);

  // console.log(`Vault: ${vault.name}, Tokens: ${tokens}, ${balances}, Total Supply: ${totalSupply.dividedBy(vault.decimals).toString(10)}`);

  return { [vault.name]: { price, tokens, balances, totalSupply: supply } };
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

module.exports = getTokemakPrices;
