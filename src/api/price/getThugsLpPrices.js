const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const ERC20 = require('../../abis/ERC20.json');
const { getPrice } = require('../../utils/getPrice');
const lpTokens = require('../../data/thugsLpPools.json');

const web3 = new Web3(process.env.BSC_RPC_3 || process.env.BSC_RPC);

const getThugsLpPrices = async () => {
  let prices = {};

  let promises = [];
  lpTokens.forEach(lpToken => promises.push(getLpTokenPrice(lpToken)));
  const values = await Promise.all(promises);

  for (item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getLpTokenPrice = async lpToken => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, lpToken.address);
  const totalSupply = await tokenPairContract.methods.totalSupply().call();

  const token0Contract = await new web3.eth.Contract(ERC20, lpToken.lp0.address);
  const token1Contract = await new web3.eth.Contract(ERC20, lpToken.lp1.address);

  let [reserve0, reserve1, token0Price, token1Price] = await Promise.all([
    token0Contract.methods.balanceOf(lpToken.address).call(),
    token1Contract.methods.balanceOf(lpToken.address).call(),
    getPrice(lpToken.lp0.oracle, lpToken.lp0.oracleId),
    getPrice(lpToken.lp1.oracle, lpToken.lp1.oracleId),
  ]);

  reserve0 = new BigNumber(reserve0);
  reserve1 = new BigNumber(reserve1);

  const token0StakedInUsd = reserve0.times(token0Price);
  const token1StakedInUsd = reserve1.times(token1Price);

  const totalStakedInUsd = token0StakedInUsd.plus(token1StakedInUsd);
  const lpTokenPrice = totalStakedInUsd.dividedBy(totalSupply);

  return { [lpToken.name]: Number(lpTokenPrice) };
};

module.exports = getThugsLpPrices;
