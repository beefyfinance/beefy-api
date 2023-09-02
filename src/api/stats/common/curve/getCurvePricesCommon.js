const BigNumber = require('bignumber.js');
const { fetchContract } = require('../../../rpc/client');
const { default: ERC20Abi } = require('../../../../abis/ERC20Abi');
const { default: ICurvePool } = require('../../../../abis/ICurvePool');

const DECIMALS = '1e18';

const getCurvePricesCommon = async (chainId, pools, tokenPrices) => {
  let prices = {};

  //Split needed pool data and calls
  const poolData = pools.map(pool => pool.pool);
  const supplyCalls = pools.map(pool => {
    const contract = fetchContract(pool.token ?? pool.pool, ERC20Abi, chainId);
    return contract.read.totalSupply();
  });

  //Split needed token data and calls
  const tokenData = [],
    tokenBalanceCalls = [],
    tokenAddressCalls = [];
  pools.forEach(pool => {
    const contract = fetchContract(pool.pool, ICurvePool, chainId);
    pool.tokens.forEach((token, index) => {
      tokenData.push({
        pool: pool.pool,
        oracleId: token.oracleId,
        token,
      });
      tokenBalanceCalls.push(contract.read.balances([index]));
      tokenAddressCalls.push(contract.read.coins([index]));
    });
  });

  //Single await for all calls
  const [balanceResults, addressResults, supplyResults] = await Promise.all([
    Promise.all(tokenBalanceCalls),
    Promise.all(tokenAddressCalls),
    Promise.all(supplyCalls),
  ]);

  //Build token result object
  const tokensInfo = balanceResults.map((_, index) => {
    return {
      ...tokenData[index],
      balance: new BigNumber(balanceResults[index]),
      address: addressResults[index],
    };
  });
  //Build supply result object
  const poolsInfo = supplyResults.map((totalSupply, index) => {
    return {
      pool: poolData[index],
      totalSupply: new BigNumber(totalSupply),
    };
  });

  // reverse to calc base pools (3pool, fraxbp) first and use their prices in metapools
  for (const pool of pools.slice().reverse()) {
    const supplyInfo = poolsInfo.find(r => r.pool === pool.pool);
    const totalSupply = supplyInfo.totalSupply.div(DECIMALS);
    const tokens = tokensInfo.filter(r => r.pool === pool.pool);

    let totalBalInUsd = new BigNumber(0);
    for (const t of tokens) {
      const price = getTokenPrice(prices, tokenPrices, t.token);
      const usdBalance = t.balance.times(price).div(t.token.decimals);
      totalBalInUsd = totalBalInUsd.plus(usdBalance);
    }
    let price = totalBalInUsd.div(totalSupply).toNumber();

    if (['convex-aleth', 'convex-mseth'].includes(pool.name)) price = 0;
    prices[pool.name] = {
      price,
      tokens: tokens.map(t => t.address),
      balances: tokens.map(t => t.balance.div(t.token.decimals).toString(10)),
      totalSupply: totalSupply.toString(10),
    };
  }
  return prices;
};

const getTokenPrice = (lpPrices, tokenPrices, token) => {
  if (token.basePool) {
    const basePool = lpPrices[token.basePool];
    if (basePool) return basePool.price;
    else console.error('Curve prices no basePool price', token.basePool, 'move it to the bottom');
  }
  if (!token.oracleId) {
    console.error('Curve prices oracleId is not defined', token);
    return 1;
  }
  let tokenPrice = 1;
  const tokenSymbol = token.oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Curve prices unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

module.exports = getCurvePricesCommon;
