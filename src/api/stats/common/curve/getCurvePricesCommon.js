const BigNumber = require('bignumber.js');
const { MultiCall } = require('eth-multicall');
const ICurvePool = require('../../../../abis/ICurvePool.json');
const ICurvePoolOld = require('../../../../abis/ICurvePoolOld.json');
const ERC20 = require('../../../../abis/ERC20.json');
const { getContract } = require('../../../../utils/contractHelper');
const { multicallAddress } = require('../../../../utils/web3');

const DECIMALS = '1e18';

const getCurvePricesCommon = async (web3, pools, tokenPrices) => {
  let prices = {};

  const chainId = await web3.eth.getChainId();
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const supplyCalls = pools.map(pool => {
    const lp = getContract(ERC20, pool.token ?? pool.pool);
    return {
      pool: pool.pool,
      totalSupply: lp.methods.totalSupply(),
    };
  });
  const tokensCalls = [];
  pools.forEach(pool => {
    const curvePool = getContract(pool.oldAbi ? ICurvePoolOld : ICurvePool, pool.pool);
    return pool.tokens.forEach((token, index) => {
      tokensCalls.push({
        pool: pool.pool,
        oracleId: token.oracleId,
        balance: curvePool.methods.balances(index),
        address: curvePool.methods.coins(index),
      });
    });
  });
  const res = await multicall.all([supplyCalls, tokensCalls]);
  const tokensInfo = res[1].map(v => ({
    ...v,
    balance: new BigNumber(v.balance),
    token: pools.find(p => p.pool === v.pool).tokens.find(t => t.oracleId === v.oracleId),
  }));

  // reverse to calc base pools (3pool, fraxbp) first and use their prices in metapools
  for (const pool of pools.slice().reverse()) {
    const supplyInfo = res[0].find(r => r.pool === pool.pool);
    const totalSupply = new BigNumber(supplyInfo.totalSupply).div(DECIMALS);
    const tokens = tokensInfo.filter(r => r.pool === pool.pool);

    let totalBalInUsd = new BigNumber(0);
    for (const t of tokens) {
      const price = getTokenPrice(prices, tokenPrices, t.token);
      const usdBalance = t.balance.times(price).div(t.token.decimals);
      totalBalInUsd = totalBalInUsd.plus(usdBalance);
    }
    const price = totalBalInUsd.div(totalSupply).toNumber();

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
