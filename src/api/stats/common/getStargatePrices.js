import BigNumber from 'bignumber.js';
import StargateLPAbi from '../../../abis/StargateLP';
import { fetchContract } from '../../rpc/client';

const getStargatePrices = async (chainId, pools, tokenPrices) => {
  const [totalLiquidityCalls, totalSupplyCals] = pools.reduce(
    (acc, pool) => {
      const tokenContract = fetchContract(pool.address, StargateLPAbi, chainId);
      acc[0].push(tokenContract.read.totalLiquidity());
      acc[1].push(tokenContract.read.totalSupply());
      return acc;
    },
    [[], []]
  );

  const [liquidityRes, supplyRes] = await Promise.all([
    Promise.all(totalLiquidityCalls),
    Promise.all(totalSupplyCals),
  ]);

  const stakedInsPool = liquidityRes.map(v => new BigNumber(v.toString()));
  const totalsSupply = supplyRes.map(v => new BigNumber(v.toString()));
  let prices = {};

  for (let i = 0; i < pools.length; i++) {
    const price = stakedInsPool[i]
      .times(tokenPrices[pools[i].underlying])
      .dividedBy(totalsSupply[i])
      .toNumber();

    prices = { ...prices, [pools[i].name]: price };
  }

  return prices;
};

module.exports = getStargatePrices;
