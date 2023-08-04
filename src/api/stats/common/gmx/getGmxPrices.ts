import BigNumber from 'bignumber.js';
import GlpManagerAbi from '../../../../abis/arbitrum/GlpManager';
import ERC20Abi from '../../../../abis/ERC20Abi';
import { fetchContract } from '../../../rpc/client';

export const getGmxPrices = async (chainId, pools, tokenPrices) => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPrice(chainId, pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (chainId, pool, tokenPrices) => {
  if (pool.oracle == 'lps') {
    const [{ price, totalSupply }, { tokens, shiftedBalances }] = await Promise.all([
      getLpPrice(chainId, pool),
      getLpTokenBalances(chainId, pool),
    ]);
    return {
      [pool.name]: {
        price: price,
        tokens: tokens,
        balances: shiftedBalances,
        totalSupply: totalSupply.dividedBy(pool.decimals).toString(10),
      },
    };
  } else {
    let price = getTokenPrice(tokenPrices, pool.oracleId);
    return { [pool.name]: price };
  }
};

const getTokenPrice = (tokenPrices, oracleId) => {
  if (!oracleId) return 1;
  let tokenPrice = 1;
  const tokenSymbol = oracleId;
  if (tokenPrices.hasOwnProperty(tokenSymbol)) {
    tokenPrice = tokenPrices[tokenSymbol];
  } else {
    console.error(`Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};

const getLpTokenBalances = async (chainId, pool) => {
  const balanceCalls = pool.tokens.map(token => {
    const contract = fetchContract(token.address, ERC20Abi, chainId);
    return contract.read.balanceOf([pool.vault]);
  });
  const balanceResults = await Promise.all(balanceCalls);
  const bal = balanceResults.map(v => new BigNumber(v.toString()));

  let tokens = [];
  let shiftedBalances = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    shiftedBalances.push(new BigNumber(bal[i]).dividedBy(pool.tokens[i].decimals).toString(10));
    tokens.push(pool.tokens[i].address);
  }

  return { tokens, shiftedBalances };
};

const getLpPrice = async (chainId, pool) => {
  const glpManagerContract = fetchContract(pool.glpManager, GlpManagerAbi, chainId);
  const glpContract = fetchContract(pool.address, ERC20Abi, chainId);

  const result = await Promise.all([
    glpManagerContract.read.getAum([false]),
    glpContract.read.totalSupply(),
  ]);
  const aum = new BigNumber((result[0] as BigInt).toString());
  const totalSupply = new BigNumber(result[1].toString());
  const price = aum.dividedBy(totalSupply).dividedBy('1e12').toNumber();

  return { price, totalSupply };
};
