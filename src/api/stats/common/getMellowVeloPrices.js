import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import { BASE_CHAIN_ID, OPTIMISM_CHAIN_ID } from '../../../constants';
import { parseAbi } from 'viem';
import { addressBookByChainId } from '../../../../packages/address-book/src/address-book';

const helpers = {
  [OPTIMISM_CHAIN_ID]: '0xF32cc62a8D35CAFA6FCFF475A939d046fFDf24a6',
  [BASE_CHAIN_ID]: '0x3f812916E5C050305D8b4744f0254DE3e195d5E5',
};
const abi = parseAbi(['function getData(address lpWrapper) external view returns (uint, uint, uint)']);

export const getMellowVeloPrices = async (chainId, pools, tokenPrices) => {
  let prices = {};

  const res = await Promise.all(
    pools.map(p => fetchContract(helpers[chainId], abi, chainId).read.getData([p.address]))
  );

  pools.forEach((pool, i) => {
    const t0 = addressBookByChainId[chainId].tokens[pool.tokens[0]];
    const t1 = addressBookByChainId[chainId].tokens[pool.tokens[1]];

    const lp0Bal = new BigNumber(res[i][0]).div(`1e${t0.decimals}`);
    const lp1Bal = new BigNumber(res[i][1]).div(`1e${t1.decimals}`);
    const lp0Price = getTokenPrice(tokenPrices, t0.oracleId);
    const lp1Price = getTokenPrice(tokenPrices, t1.oracleId);
    const totalUsd = lp0Bal.times(lp0Price).plus(lp1Bal.times(lp1Price));

    const totalSupply = new BigNumber(res[i][2]).div('1e18');
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

const getTokenPrice = (tokenPrices, token) => {
  let tokenPrice = 1;
  if (tokenPrices.hasOwnProperty(token)) {
    tokenPrice = tokenPrices[token];
  } else {
    console.error(`MellowVelo unknown token '${token}'. Consider adding it to .json file`);
  }
  return tokenPrice;
};
