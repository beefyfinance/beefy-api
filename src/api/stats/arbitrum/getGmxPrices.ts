const { arbitrumWeb3: web3 } = require('../../../utils/web3');
const BigNumber = require('bignumber.js');
import pools from '../../../data/arbitrum/gmxPools.json';
import { getContractWithProvider } from '../../../utils/contractHelper';
const GlpManager = require('../../../abis/arbitrum/GlpManager.json');
import { MultiCall } from 'eth-multicall';
import { multicallAddress } from '../../../utils/web3';
import { ARBITRUM_CHAIN_ID } from '../../../constants';
import { ERC20_ABI } from '../../../abis/common/ERC20';

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
  let price = 0;
  if (pool.oracle == "lps") {
    price = await getLpPrice(pool);
  } else {
    price = getTokenPrice(tokenPrices, pool.tokenId);
  }

  return { [pool.name]: price };
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

const getLpPrice = async (pool) => {
  const multicall = new MultiCall(web3, multicallAddress(ARBITRUM_CHAIN_ID));
  const managerCalls = [];
  const glpCalls = [];
  const glpManager = getContractWithProvider(GlpManager, pool.glpManager, web3);
  const glp = getContractWithProvider(ERC20_ABI, pool.address, web3);
  managerCalls.push({aum: glpManager.methods.getAumInUsdg(true)});
  glpCalls.push({totalSupply: glp.methods.totalSupply()});

  const res = await multicall.all([managerCalls, glpCalls]);

  const aum = new BigNumber(res[0].map(v => v.aum));
  const totalSupply = new BigNumber(res[1].map(v => v.totalSupply));

  return aum.dividedBy(totalSupply).toNumber();
}

export default getGmxArbitrumPrices;
