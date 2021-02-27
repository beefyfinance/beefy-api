const BigNumber = require('bignumber.js');
const { web3Factory } = require('./web3');
const { BSC_CHAIN_ID } = require('../../constants');
const ERC20 = require('../abis/ERC20.json');

const fetchPoolTokenBalance = async (lpAddress, tokenAddress, chainId = BSC_CHAIN_ID) => {
  const web3 = web3Factory(chainId);

  if (web3.utils.isAddress(lpAddress) === false) {
    throw new Error(`Invalid pool address: '${lpAddress}'`);
  }
  if (web3.utils.isAddress(tokenAddress) === false) {
    throw new Error(`Invalid token address: '${tokenAddress}'`);
  }

  const tokenContract = new web3.eth.Contract(ERC20, tokenAddress);
  const tokenBalance = new BigNumber(await tokenContract.methods.balanceOf(lpAddress).call());

  return tokenBalance;
};

const fetchPoolTokenSupply = async (tokenAddress, chainId = BSC_CHAIN_ID) => {
  const web3 = web3Factory(chainId);

  const tokenContract = new web3.eth.Contract(ERC20, tokenAddress);
  const tokenSupply = new BigNumber(await tokenContract.methods.totalSupply().call());

  return tokenSupply;
}

const fetchPoolPrices = async (
  lp,
  unknownToken,
  knownToken,
  knownTokenPricePerUnit,
  chainId = BSC_CHAIN_ID
) => {
  const knownTokenBalance = await fetchPoolTokenBalance(lp.address, knownToken.address, chainId);
  const knownTokenPrecision = Number(knownToken.decimals);
  const knownTokenValuation = knownTokenBalance.dividedBy(knownTokenPrecision).times(knownTokenPricePerUnit);

  const unknownTokenBalance = await fetchPoolTokenBalance(lp.address, unknownToken.address, chainId);
  const unknownTokenPrecision = Number(unknownToken.decimals);
  const unknownTokenPriceUnit = knownTokenValuation.dividedBy(unknownTokenBalance).times(unknownTokenPrecision);

  const lpTokenSupply = await fetchPoolTokenSupply(lp.address, chainId);
  const lpTokenValuation = knownTokenValuation.times(2);
  const lpTokenPricePerUnit = lpTokenValuation.dividedBy(lpTokenSupply).times(lp.decimals);

  return {
    lpTokenPrice: lpTokenPricePerUnit.toNumber(),
    unknownTokenPrice: unknownTokenPriceUnit.toNumber(),
    knownTokenPrice: knownTokenPricePerUnit,
  };
};

const fetchAmmPoolsPrices = async (oracle, pools, knownPrices, chainId = BSC_CHAIN_ID) => {
  let poolPrices = {};
  let tokenPrices = { ...knownPrices };
  let knownToken, unknownToken;
  for (const pool of [...pools].reverse()) {
    if (pool.lp0.oracle != oracle || pool.lp1.oracle != oracle) {
      continue;
    }

    if (tokenPrices.hasOwnProperty(pool.lp0.oracleId) && tokenPrices.hasOwnProperty(pool.lp1.oracleId)) {
      continue;
    }

    if (tokenPrices.hasOwnProperty(pool.lp0.oracleId) || tokenPrices.hasOwnProperty(pool.lp1.oracleId)) {
      if (tokenPrices.hasOwnProperty(pool.lp0.oracleId)) {
        knownToken = pool.lp0;
        unknownToken = pool.lp1;
      } else {
        knownToken = pool.lp1;
        unknownToken = pool.lp0;
      }
    } else {
      console.warn('No path to resolve price of tokens in LP:', pool.name, 'Skipping it.');
      console.warn('Please move leading pairs to the bottom of .json pools file');
      continue;
    }

    let {lpTokenPrice, unknownTokenPrice} = await fetchPoolPrices(
      pool,
      unknownToken,
      knownToken,
      tokenPrices[knownToken.oracleId],
      chainId
    );

    poolPrices[pool.name] = lpTokenPrice;
    tokenPrices[unknownToken.oracleId] = unknownTokenPrice;
  }

  return {
    poolPrices: poolPrices,
    tokenPrices: tokenPrices,
  };
};

module.exports = {
  fetchAmmPoolsPrices,
  fetchPoolPrices,
  fetchPoolTokenBalance,
  fetchPoolTokenSupply,
};
