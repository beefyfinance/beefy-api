const BigNumber = require('bignumber.js');

const LPAbi = require('../../../abis/ISolidlyPair.json');
const { getContract } = require('../../../utils/contractHelper');
const { MultiCall } = require('eth-multicall');
const { multicallAddress } = require('../../../utils/web3');

const getSolidlyStablePrices = async (web3, pools, tokenPrices) => {
  let prices = {};

  const chainId = await web3.eth.getChainId();
  const multicall = new MultiCall(web3, multicallAddress(chainId));

  const calls = pools.map(pool => {
    const lp = getContract(LPAbi, pool.address);
    return {
      reserves: lp.methods.getReserves(),
      totalSupply: lp.methods.totalSupply(),
    };
  });
  const res = await multicall.all([calls]);
  const poolsData = res[0].map(v => ({
    ...v,
    lp0Bal: new BigNumber(v.reserves[0]),
    lp1Bal: new BigNumber(v.reserves[1]),
    totalSupply: new BigNumber(v.totalSupply),
  }));

  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lp0Bal = poolsData[i].lp0Bal;
    const lp1Bal = poolsData[i].lp1Bal;
    const totalSupply = poolsData[i].totalSupply;

    const lp0 = lp0Bal.multipliedBy(tokenPrices[pool.lp0.oracleId]).dividedBy(pool.lp0.decimals);
    const lp1 = lp1Bal.multipliedBy(tokenPrices[pool.lp1.oracleId]).dividedBy(pool.lp1.decimals);
    const price = lp0.plus(lp1).multipliedBy(pool.decimals).dividedBy(totalSupply).toNumber();

    prices[pool.name] = {
      price,
      tokens: [pool.lp0.address, pool.lp1.address],
      balances: [
        lp0Bal.dividedBy(pool.lp0.decimals).toString(10),
        lp1Bal.dividedBy(pool.lp1.decimals).toString(10),
      ],
      totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
    };
  }
  return prices;
};

module.exports = getSolidlyStablePrices;
