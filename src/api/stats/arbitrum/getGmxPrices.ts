const BigNumber = require('bignumber.js');
import pools from '../../../data/arbitrum/gmxPools.json';
import { ARBITRUM_CHAIN_ID } from '../../../constants';
import GlpManagerAbi from '../../../abis/arbitrum/GlpManager';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';

const getGmxArbitrumPrices = async tokenPrices => {
  let prices = {};
  let promises = [];
  pools.forEach(pool => promises.push(getPrice(pool, tokenPrices)));
  const values = await Promise.all(promises);

  for (const item of values) {
    prices = { ...prices, ...item };
  }

  return prices;
};

const getPrice = async (pool, tokenPrices) => {
  if (pool.oracle == 'lps') {
    let price = await getLpPrice(pool);
    let results = await getLpTokenBalances(pool, tokenPrices);
    return {
      [pool.name]: {
        price: price[0],
        tokens: results[0],
        balances: results[1],
        totalSupply: price[1].dividedBy(pool.decimals).toString(10),
      },
    };
  } else {
    let price = getTokenPrice(tokenPrices, pool.tokenId);
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

const getLpTokenBalances = async (pool, tokenPrices) => {
  const balanceCalls = pool.tokens.map(token => {
    const contract = fetchContract(token.address, ERC20Abi, ARBITRUM_CHAIN_ID);
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

  return [tokens, shiftedBalances];
};

const getLpPrice = async pool => {
  const glpManagerContract = fetchContract(pool.glpManager, GlpManagerAbi, ARBITRUM_CHAIN_ID);
  const glpContract = fetchContract(pool.address, ERC20Abi, ARBITRUM_CHAIN_ID);

  const results = await Promise.all([
    glpManagerContract.read.getAumInUsdg([true]),
    glpContract.read.totalSupply(),
  ]);
  const aum = new BigNumber(results[0].toString());
  const totalSupply = new BigNumber(results[1].toString());
  const price = aum.dividedBy(totalSupply).toNumber();

  return [price, totalSupply];
};

export default getGmxArbitrumPrices;
