import BigNumber from 'bignumber.js';
import StargateLPAbi from '../../../abis/StargateLP';
import { fetchContract } from '../../rpc/client';

const getStargatePrices = async (chainId, pools, tokenPrices) => {
  const [totalLiquidityCalls, totalSupplyCalls, tokenCalls] = pools.reduce(
    (acc, pool) => {
      const tokenContract = fetchContract(pool.address, StargateLPAbi, chainId);
      acc[0].push(tokenContract.read.totalLiquidity());
      acc[1].push(tokenContract.read.totalSupply());
      acc[2].push(tokenContract.read.token());
      return acc;
    },
    [[], [], []]
  );

  const [liquidityRes, supplyRes, tokenRes] = await Promise.all([
    Promise.all(totalLiquidityCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(tokenCalls),
  ]);

  const stakedInsPool = liquidityRes.map(v => new BigNumber(v.toString()));
  const totalsSupply = supplyRes.map(v => new BigNumber(v.toString()));
  const token = tokenRes.map(v => v.toString());
  let prices = {};

  for (let i = 0; i < pools.length; i++) {
    const price = stakedInsPool[i]
      .times(tokenPrices[pools[i].underlying])
      .dividedBy(totalsSupply[i])
      .toNumber();

    prices = {
      ...prices,
      [pools[i].name]: {
        price,
        tokens: [token[i]],
        balances: [stakedInsPool[i].div(pools[i].decimals).toString(10)],
        totalSupply: totalsSupply[i].div(pools[i].decimals).toString(10),
      },
    };
  }

  return prices;
};

module.exports = getStargatePrices;
