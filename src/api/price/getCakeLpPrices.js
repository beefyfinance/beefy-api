const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const ERC20 = require('../../abis/ERC20.json');
const { getPrice } = require('../../utils/getPrice');
const lpTokens = require('../../data/cakeLpPools.json');

const web3 = new Web3(process.env.BSC_RPC_3 || process.env.BSC_RPC);

const getCakeLpPrices = async () => {
  let prices = {};

  for (lpToken of lpTokens) {
    prices[lpToken.name] = await getLpTokenPrice(lpToken);
  }

  return prices;
};

const getLpTokenPrice = async lpToken => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, lpToken.address);
  const totalSupply = await tokenPairContract.methods.totalSupply().call();

  const token0Contract = await new web3.eth.Contract(ERC20, lpToken.lp0.address);
  const reserve0 = new BigNumber(await token0Contract.methods.balanceOf(lpToken.address).call());
  const token0Price = await getPrice(lpToken.lp0.oracle, lpToken.lp0.oracleId);
  const token0StakedInUsd = reserve0.times(token0Price);

  const token1Contract = await new web3.eth.Contract(ERC20, lpToken.lp1.address);
  const reserve1 = new BigNumber(await token1Contract.methods.balanceOf(lpToken.address).call());
  const token1Price = await getPrice(lpToken.lp1.oracle, lpToken.lp1.oracleId);
  const token1StakedInUsd = reserve1.times(token1Price);

  const totalStakedInUsd = token0StakedInUsd.plus(token1StakedInUsd);
  const lpTokenPrice = totalStakedInUsd.dividedBy(totalSupply);

  return Number(lpTokenPrice);
};

module.exports = getCakeLpPrices;
