const BigNumber = require('bignumber.js');
const { web3Factory } = require('./web3');
const { BSC_CHAIN_ID } = require('../../constants');
const ERC20 = require('../abis/ERC20.json');

const nativeToken = '0x0000000000000000000000000000000000000000';

const fetchPoolTokenBalance = async (lpAddress, tokenAddress, chainId = BSC_CHAIN_ID) => {
  const web3 = web3Factory(chainId);

  if (web3.utils.isAddress(lpAddress) === false) {
    throw new Error(`Invalid pool address: '${lpAddress}'`);
  }
  if (web3.utils.isAddress(tokenAddress) === false) {
    throw new Error(`Invalid token address: '${tokenAddress}'`);
  }

  let tokenBalance = 0;
  if (tokenAddress === nativeToken) {
    tokenBalance = new BigNumber(await web3.eth.getBalance(lpAddress));
  } else {
    const tokenContract = new web3.eth.Contract(ERC20, tokenAddress);
    tokenBalance = new BigNumber(await tokenContract.methods.balanceOf(lpAddress).call());
  }

  return tokenBalance;
};

const fetchPoolTokenSupply = async (tokenAddress, chainId = BSC_CHAIN_ID) => {
  const web3 = web3Factory(chainId);

  const tokenContract = new web3.eth.Contract(ERC20, tokenAddress);
  const tokenSupply = new BigNumber(await tokenContract.methods.totalSupply().call());

  return tokenSupply;
};

const fetchPoolPrices = async (
  lp,
  unknownToken,
  knownToken,
  knownTokenPricePerUnit,
  chainId = BSC_CHAIN_ID,
) => {
  const knownTokenBalance = await fetchPoolTokenBalance(lp.address, knownToken.address, chainId);
  const knownTokenValuation = knownTokenBalance.div(knownToken.decimals).times(knownTokenPricePerUnit);

  const unknownTokenBalance = await fetchPoolTokenBalance(lp.address, unknownToken.address, chainId);
  const unknownTokenValuation = knownTokenValuation;
  const unknownTokenPriceUnit = unknownTokenValuation.div(unknownTokenBalance.div(unknownToken.decimals));

  const lpTokenSupply = await fetchPoolTokenSupply(lp.address, chainId);
  const lpTokenValuation = knownTokenValuation.times(2);
  const lpTokenPricePerUnit = lpTokenValuation.div(lpTokenSupply.div(lp.decimals));

  return {
    lpTokenPrice: lpTokenPricePerUnit.toNumber(),
    unknownTokenValuation: unknownTokenValuation.toNumber(),
    unknownTokenPrice: unknownTokenPriceUnit.toNumber(),
    knownTokenPrice: knownTokenPricePerUnit,
  };
};

const fetchAmmPoolsPrices = async (pools, knownPrices) => {
  let poolPrices = {};
  let tokenValuations = {};
  let processedPools = {};
  let tokenPrices = { ...knownPrices };
  let knownToken, unknownToken;
  for (const pool of [...pools].reverse()) {

    if (processedPools.hasOwnProperty(pool.address)) {
      poolPrices[pool.name] = poolPrices[processedPools[pool.address]];
      continue;
    }
    processedPools[pool.address] = pool.name;

    if (pool.lp0.oracle != pool.lp1.oracle) {
      // console.warn(`Skipped fetching prices for pool '${pool.name}' because of oracle mismatch`)
      continue;
    }

    if (tokenPrices.hasOwnProperty(pool.lp0.oracleId) || tokenPrices.hasOwnProperty(pool.lp1.oracleId)) {
      if (tokenPrices.hasOwnProperty(pool.lp1.oracleId)) {
        knownToken = pool.lp1;
        unknownToken = pool.lp0;
      } else {
        knownToken = pool.lp0;
        unknownToken = pool.lp1;
      }
    } else {
      console.warn('No path to resolve price of tokens in LP:', pool.name, 'Skipping it.');
      console.warn('Please move leading pairs to the bottom of .json pools file');
      continue;
    }

    let { lpTokenPrice, unknownTokenValuation, unknownTokenPrice } = await fetchPoolPrices(
      pool,
      unknownToken,
      knownToken,
      tokenPrices[knownToken.oracleId],
      pool.chainId || BSC_CHAIN_ID,
    );

    if (unknownTokenValuation > (tokenValuations[unknownToken.oracleId] || 0)) {
      // console.log(`Found ${unknownToken.oracleId} with greater valuation:`, unknownTokenValuation, 'was:', tokenValuations[unknownToken.oracleId], "on:", pool.name);
      tokenPrices[unknownToken.oracleId] = unknownTokenPrice;
      tokenValuations[unknownToken.oracleId] = unknownTokenValuation;
    }

    poolPrices[pool.name] = lpTokenPrice;
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
