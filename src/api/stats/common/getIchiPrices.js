import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import IchiAbi from '../../../abis/Ichi.json';
import { addressBookByChainId, ChainId } from '../../../../packages/address-book/src/address-book';

export const getIchiPrices = async (chainId, pools, tokenPrices) => {
  const contracts = pools.map(p => fetchContract(p.address, IchiAbi, chainId));
  const [amounts, totalSupplies] = await Promise.all([
    Promise.all(contracts.map(c => c.read.getTotalAmounts())),
    Promise.all(contracts.map(c => c.read.totalSupply().then(v => new BigNumber(v)))),
  ]);

  let prices = {};
  pools.forEach((pool, i) => {
    const t0 = addressBookByChainId[chainId].tokens[pool.tokens[0]];
    const t1 = addressBookByChainId[chainId].tokens[pool.tokens[1]];
    if (!t0) console.error(`Ichi No token ${pool.tokens[0]} in ${ChainId[chainId]} address book`);
    if (!t1) console.error(`Ichi No token ${pool.tokens[1]} in ${ChainId[chainId]} address book`);
    const lp0Bal = new BigNumber(amounts[i][0]).div(`1e${t0.decimals}`);
    const lp1Bal = new BigNumber(amounts[i][1]).div(`1e${t1.decimals}`);
    const lp0Price = getTokenPrice(tokenPrices, t0.oracleId);
    const lp1Price = getTokenPrice(tokenPrices, t1.oracleId);

    const totalUsd = lp0Bal.times(lp0Price).plus(lp1Bal.times(lp1Price));
    const totalSupply = totalSupplies[i].div('1e18');
    const price = totalUsd.div(totalSupply).toNumber();
    // console.log(pool.name, 'tvl', totalUsd.toString(10));

    prices[pool.name] = {
      price,
      tokens: [t0.address, t1.address],
      balances: [lp0Bal.toString(10), lp1Bal.toString(10)],
      totalSupply: totalSupply.toString(10),
    };
  });
  return prices;
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Ichi Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};
