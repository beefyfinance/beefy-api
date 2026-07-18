import { BigNumber } from 'bignumber.js';
import { fetchContract } from '../../rpc/client.ts';
import ERC20Abi from '../../../abis/ERC20Abi.ts';
import { MONAD_CHAIN_ID } from '../../../constants.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';

import pools from '../../../data/monad/neverlandPools.json' with { type: "json" };
const logger = getLoggerFor({ module: 'prices', platform: 'neverland', chain: MONAD_CHAIN_ID });

export const getNeverlandPrices = async tokenPrices => {
  const totalSupplyCalls = [];

  for (const pool of pools) {
    const erc20Contract = fetchContract(pool.aToken, ERC20Abi, MONAD_CHAIN_ID) as any;
    totalSupplyCalls.push(erc20Contract.read.totalSupply());
  }

  const [totalSupplyResults] = await Promise.all([Promise.all(totalSupplyCalls)]);

  let prices = {};
  for (const pool of pools) {
    const token = pool.address;
    const totalSupply = new BigNumber(totalSupplyResults[pools.indexOf(pool)]).div(pool.decimals);

    const price = getTokenPrice(tokenPrices, pool.oracleId);

    prices[pool.name] = {
      price,
      tokens: [token],
      balances: [totalSupply.toString(10)],
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
    logger.debug({ token: tokenSymbol }, 'unknown token price');
  }
  return tokenPrice;
};
