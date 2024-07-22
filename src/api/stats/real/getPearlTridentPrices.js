import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import { parseAbi } from 'viem';
import { REAL_CHAIN_ID } from '../../../constants';

const pools = require('../../../data/real/pearlTridentPools.json');

const tridentAbi = parseAbi([
  'function totalSupply() view returns (uint256)',
  'function getTotalAmounts() view returns (uint total0,uint total1,uint pool0,uint pool1,uint128 liquidity)',
]);

export const getPearlTridentPrices = async tokenPrices => {
  const amountCalls = [];
  const totalSupplyCalls = [];
  pools.forEach(p => {
    const contract = fetchContract(p.address, tridentAbi, REAL_CHAIN_ID);
    amountCalls.push(contract.read.getTotalAmounts());
    totalSupplyCalls.push(contract.read.totalSupply());
  });
  const [amountResults, totalSupplyResults] = await Promise.all([
    Promise.all(amountCalls),
    Promise.all(totalSupplyCalls),
  ]);

  let prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lp0 = pool.lp0;
    const lp1 = pool.lp1;
    const bal0 = new BigNumber(amountResults[i][0]).div(lp0.decimals);
    const bal1 = new BigNumber(amountResults[i][1]).div(lp1.decimals);
    const totalSupply = new BigNumber(totalSupplyResults[i]).div('1e18');

    const price0 = getTokenPrice(tokenPrices, lp0.oracleId);
    const price1 = getTokenPrice(tokenPrices, lp1.oracleId);
    const price = bal0.times(price0).plus(bal1.times(price1)).div(totalSupply).toNumber();

    prices[pool.name] = {
      price,
      tokens: [lp0.address, lp1.address],
      balances: [bal0.toString(10), bal1.toString(10)],
      totalSupply: totalSupply.toString(10),
    };
  }
  return prices;
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`PearlTrident Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};
