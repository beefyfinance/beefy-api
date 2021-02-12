const BigNumber = require('bignumber.js');
const { web3 } = require('./web3');
const { getPrice } = require('./getPrice');
const ERC20 = require('../abis/ERC20.json');

const lpTokenPrice = async lpToken => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, lpToken.address);
  const token0Contract = await new web3.eth.Contract(ERC20, lpToken.lp0.address);
  const token1Contract = await new web3.eth.Contract(ERC20, lpToken.lp1.address);

  let [totalSupply, reserve0, reserve1, token0Price, token1Price] = await Promise.all([
    tokenPairContract.methods.totalSupply().call(),
    token0Contract.methods.balanceOf(lpToken.address).call(),
    token1Contract.methods.balanceOf(lpToken.address).call(),
    getPrice(lpToken.lp0.oracle, lpToken.lp0.oracleId),
    getPrice(lpToken.lp1.oracle, lpToken.lp1.oracleId),
  ]);

  reserve0 = new BigNumber(reserve0);
  reserve1 = new BigNumber(reserve1);

  const token0StakedInUsd = reserve0.div(lpToken.lp0.decimals).times(token0Price);
  const token1StakedInUsd = reserve1.div(lpToken.lp1.decimals).times(token1Price);

  const totalStakedInUsd = token0StakedInUsd.plus(token1StakedInUsd);
  const lpTokenPrice = totalStakedInUsd.dividedBy(totalSupply).times(lpToken.decimals);

  return Number(lpTokenPrice);
};

const lpTokenPrices = async lpTokens => {
  let prices = {};

  let promises = [];
  lpTokens.forEach(lpToken => promises.push(lpTokenStats(lpToken)));
  const values = await Promise.all(promises);

  for (item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const lpTokenStats = async lpToken => {
  const lpPrice = await lpTokenPrice(lpToken);
  return { [lpToken.name]: lpPrice };
};

module.exports = { lpTokenPrice, lpTokenPrices };
