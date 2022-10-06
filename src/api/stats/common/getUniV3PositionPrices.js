const BigNumber = require('bignumber.js');

const StratAbi = require('../../../abis/StratUniV3.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');

const getUniV3PositionPrices = async (web3, pools, tokenPrices) => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPrice(web3, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (web3, pool, tokenPrices) => {
  const stratContract = getContractWithProvider(StratAbi, pool.strategy, web3);
  const tokenBal = await stratContract.methods.balanceOfTokens().call();
  const liquidity = new BigNumber(await stratContract.methods.balanceOfPool().call());

  const lp0Bal = new BigNumber(tokenBal[2]);
  const lp1Bal = new BigNumber(tokenBal[3]);

  const lp0 = lp0Bal.multipliedBy(tokenPrices[pool.lp0.oracleId]).dividedBy(pool.lp0.decimals);
  const lp1 = lp1Bal.multipliedBy(tokenPrices[pool.lp1.oracleId]).dividedBy(pool.lp1.decimals);
  const price = lp0.plus(lp1).multipliedBy(1e18).dividedBy(liquidity).toNumber();

  return {
    [pool.name]: {
      price,
      tokens: [pool.lp0.address, pool.lp1.address],
      balances: [
        lp0Bal.dividedBy(pool.lp0.decimals).toString(10),
        lp1Bal.dividedBy(pool.lp1.decimals).toString(10),
      ],
      totalSupply: liquidity.dividedBy(1e18).toString(10),
    },
  };
};

module.exports = getUniV3PositionPrices;
