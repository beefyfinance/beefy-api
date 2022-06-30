const BigNumber = require('bignumber.js');

const LPAbi = require('../../../abis/ISolidlyPair.json');
const { getContractWithProvider } = require('../../../utils/contractHelper');

const getSolidlyStablePrices = async (web3, pools, tokenPrices) => {
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
  const lpContract = getContractWithProvider(LPAbi, pool.address, web3);
  const reserves = await lpContract.methods.getReserves().call();
  const totalSupply = new BigNumber(await lpContract.methods.totalSupply().call());

  const lp0Bal = new BigNumber(reserves[0]);
  const lp1Bal = new BigNumber(reserves[1]);

  const lp0 = lp0Bal.multipliedBy(tokenPrices[pool.lp0.oracleId]).dividedBy(pool.lp0.decimals);
  const lp1 = lp1Bal.multipliedBy(tokenPrices[pool.lp1.oracleId]).dividedBy(pool.lp1.decimals);
  const price = lp0.plus(lp1).multipliedBy(pool.decimals).dividedBy(totalSupply).toNumber();

  return {
    [pool.name]: {
      price,
      tokens: [pool.lp0.address, pool.lp1.address],
      balances: [
        lp0Bal.dividedBy(pool.lp0.decimals).toString(10),
        lp1Bal.dividedBy(pool.lp1.decimals).toString(10),
      ],
      totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
    },
  };
};

module.exports = getSolidlyStablePrices;
