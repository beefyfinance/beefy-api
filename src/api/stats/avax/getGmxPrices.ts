const { avaxWeb3: web3 } = require('../../../utils/web3');
const BigNumber = require('bignumber.js');
import pools from '../../../data/avax/gmxPools.json';
import { getContractWithProvider } from '../../../utils/contractHelper';
const GlpManager = require('../../../abis/arbitrum/GlpManager.json');
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import { AVAX_CHAIN_ID } from '../../../constants';
import { ERC20_ABI } from '../../../abis/common/ERC20';

const getGmxAvalanchePrices = async tokenPrices => {
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
    let results = await getLpTokenBalances(pool);
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

const getLpTokenBalances = async pool => {
  const multicall = new MultiCall(web3, multicallAddress(AVAX_CHAIN_ID));
  const balanceCalls = [];
  pool.tokens.forEach(token => {
    const tokenContract = getContractWithProvider(ERC20_ABI, token.address, web3);
    balanceCalls.push({ balances: tokenContract.methods.balanceOf(pool.vault) });
  });

  const res = await multicall.all([balanceCalls]);
  const bal = res[0].map(v => new BigNumber(v.balances));

  let tokens = [];
  let shiftedBalances = [];
  for (let i = 0; i < pool.tokens.length; i++) {
    shiftedBalances.push(new BigNumber(bal[i]).dividedBy(pool.tokens[i].decimals).toString(10));
    tokens.push(pool.tokens[i].address);
  }

  return [tokens, shiftedBalances];
};

const getLpPrice = async pool => {
  const multicall = new MultiCall(web3, multicallAddress(AVAX_CHAIN_ID));
  const managerCalls = [];
  const glpCalls = [];
  const glpManager = getContractWithProvider(GlpManager, pool.glpManager, web3);
  const glp = getContractWithProvider(ERC20_ABI, pool.address, web3);
  managerCalls.push({ aum: glpManager.methods.getAumInUsdg(true) });
  glpCalls.push({ totalSupply: glp.methods.totalSupply() });

  const res = await multicall.all([managerCalls, glpCalls]);

  const aum = new BigNumber(res[0].map(v => v.aum));
  const totalSupply = new BigNumber(res[1].map(v => v.totalSupply));
  const price = aum.dividedBy(totalSupply).toNumber();

  return [price, totalSupply];
};

export default getGmxAvalanchePrices;
