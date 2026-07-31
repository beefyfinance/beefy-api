import { addressBookByChainId, type ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import { parseAbi } from 'viem';
import type { PricesById, StandardLpBreakdown } from '../../../types/prices.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { fetchContract } from '../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'mellow' });

const abi = parseAbi([
  'function previewMint(uint lpAmount) external view returns (uint amount0, uint amount1)',
  'function totalSupply() external view returns (uint)',
  'function totalSupplyLimit() external view returns (uint)',
]);

export type MellowVeloPool = {
  name: string;
  address: string;
  tokens: string[];
};

export const getMellowVeloPrices = async (chainId: ChainId, pools: MellowVeloPool[], tokenPrices: PricesById) => {
  let prices: Record<string, StandardLpBreakdown> = {};

  const contracts = pools.map(p => fetchContract(p.address, abi, chainId));
  const [supplies, limits] = await Promise.all([
    Promise.all(contracts.map(c => c.read.totalSupply().then(v => new BigNumber(v)))),
    Promise.all(contracts.map(c => c.read.totalSupplyLimit().then(v => new BigNumber(v)))),
  ]);
  const amounts = await Promise.all(contracts.map((c, i) => c.read.previewMint([BigInt(supplies[i].toString(10))])));

  pools.forEach((pool, i) => {
    const t0 = addressBookByChainId[chainId].tokens[pool.tokens[0]];
    const t1 = addressBookByChainId[chainId].tokens[pool.tokens[1]];

    const lp0Bal = new BigNumber(amounts[i][0]).div(`1e${t0.decimals}`);
    const lp1Bal = new BigNumber(amounts[i][1]).div(`1e${t1.decimals}`);
    const lp0Price = getTokenPrice(tokenPrices, t0.oracleId);
    const lp1Price = getTokenPrice(tokenPrices, t1.oracleId);
    const totalUsd = lp0Bal.times(lp0Price).plus(lp1Bal.times(lp1Price));

    const totalSupply = supplies[i].div('1e18');
    const price = totalUsd.div(totalSupply).toNumber();
    // console.log(pool.name, 'tvl', totalUsd.toString(10),'limit',limits[i].div('1e18').times(price).toString(10));

    prices[pool.name] = {
      price,
      tokens: [t0.address, t1.address],
      balances: [lp0Bal.toString(10), lp1Bal.toString(10)],
      totalSupply: totalSupply.toString(10),
    };
  });

  return prices;
};

const getTokenPrice = (tokenPrices: PricesById, token: string) => {
  let tokenPrice = 1;
  if (tokenPrices.hasOwnProperty(token)) {
    tokenPrice = tokenPrices[token];
  } else {
    logger.warn({ token }, 'unknown token, defaulting price to 1');
  }
  return tokenPrice;
};
