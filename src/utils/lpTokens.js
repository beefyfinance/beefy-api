const BigNumber = require('bignumber.js');
const { web3Factory } = require('./web3');
const fetchPrice = require('./fetchPrice');
const ERC20 = require('../abis/ERC20.json');

const nativeToken = '0x0000000000000000000000000000000000000000';

const lpTokenPrice = async lpToken => {
  const web3 = web3Factory(lpToken.chainId || 56);

  const tokenPairContract = new web3.eth.Contract(ERC20, lpToken.address);
  const token0Contract = new web3.eth.Contract(ERC20, lpToken.lp0.address);
  const token1Contract = new web3.eth.Contract(ERC20, lpToken.lp1.address);

  const token0Bal =
    lpToken.lp0.address === nativeToken
      ? web3.eth.getBalance(lpToken.address)
      : token0Contract.methods.balanceOf(lpToken.address).call();

  const token1Bal =
    lpToken.lp1.address === nativeToken
      ? web3.eth.getBalance(lpToken.address)
      : token1Contract.methods.balanceOf(lpToken.address).call();

  let [totalSupply, reserve0, reserve1, token0Price, token1Price] = await Promise.all([
    tokenPairContract.methods.totalSupply().call(),
    token0Bal,
    token1Bal,
    fetchPrice({ oracle: lpToken.lp0.oracle, id: lpToken.lp0.oracleId }),
    fetchPrice({ oracle: lpToken.lp1.oracle, id: lpToken.lp1.oracleId }),
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

  for (let item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const lpTokenStats = async lpToken => {
  // TODO: Refactor price calls to use getAmmPrices
  const lpPrice = await lpTokenPrice(lpToken);
  return { [lpToken.name]: lpPrice };
};

module.exports = { lpTokenPrice, lpTokenPrices };
