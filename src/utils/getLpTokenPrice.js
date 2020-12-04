const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const { getPrice } = require('./getPrice');
const ERC20 = require('../abis/ERC20.json');

const web3 = new Web3(process.env.BSC_RPC);

const getLpTokenPrice = async pool => {
  const tokenPairContract = await new web3.eth.Contract(ERC20, pool.address);
  const totalSupply = await tokenPairContract.methods.totalSupply().call();

  const token0Contract = await new web3.eth.Contract(ERC20, pool.lp0.address);
  const reserve0 = new BigNumber(await token0Contract.methods.balanceOf(pool.address).call());
  const token0Price = await getPrice(pool.lp0.oracle, pool.lp0.oracleId);
  const token0StakedInUsd = reserve0.times(token0Price);

  const token1Contract = await new web3.eth.Contract(ERC20, pool.lp1.address);
  const reserve1 = new BigNumber(await token1Contract.methods.balanceOf(pool.address).call());
  const token1Price = await getPrice(pool.lp1.oracle, pool.lp1.oracleId);
  const token1StakedInUsd = reserve1.times(token1Price);

  const totalStakedInUsd = token0StakedInUsd.plus(token1StakedInUsd);
  const lpTokenPrice = totalStakedInUsd.dividedBy(totalSupply);

  return lpTokenPrice;
};

module.exports = getLpTokenPrice;
