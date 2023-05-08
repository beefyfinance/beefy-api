import { getContract } from '../../../utils/contractHelper';
import { MultiCall } from 'eth-multicall';
import { bscWeb3 as web3, multicallAddress } from '../../../utils/web3';
import { BSC_CHAIN_ID } from '../../../constants';
import ThenaLP from '../../../abis/bsc/ThenaLP.json';
import BigNumber from 'bignumber.js';

const pools = require('../../../data/degens/thenaGammaPools.json');

export const getThenaGammaPrices = async tokenPrices => {
  const calls = pools.map(pool => {
    const lp = getContract(ThenaLP, pool.address);
    return {
      amounts: lp.methods.getTotalAmounts(),
      totalSupply: lp.methods.totalSupply(),
    };
  });
  const multicall = new MultiCall(web3, multicallAddress(BSC_CHAIN_ID));
  const res = await multicall.all([calls]);

  let prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lp0 = pool.lp0;
    const lp1 = pool.lp1;
    const bal0 = new BigNumber(res[0][i].amounts['0']).div(lp0.decimals);
    const bal1 = new BigNumber(res[0][i].amounts['1']).div(lp1.decimals);
    const totalSupply = new BigNumber(res[0][i].totalSupply).div('1e18');

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
    console.error(`ThenaGamma Unknown token '${tokenSymbol}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};
