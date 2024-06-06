import BigNumber from 'bignumber.js';
import StargateLPAbi from '../../../../abis/StargateLP';
import { fetchContract } from '../../../rpc/client';

const getStargateV2Prices = async (chainId, pools, tokenPrices) => {
  const [totalSupplyCalls] = pools.reduce(
    (acc, pool) => {
      const tokenContract = fetchContract(pool.address, StargateLPAbi, chainId);
      acc[0].push(tokenContract.read.totalSupply());
      return acc;
    },
    [[]]
  );

  const [supplyRes] = await Promise.all([Promise.all(totalSupplyCalls)]);
  const supply = supplyRes.map(v => new BigNumber(v.toString()));

  let prices = {};

  for (let i = 0; i < pools.length; i++) {
    const price = tokenPrices[pools[i].underlying];

    prices = {
      ...prices,
      [pools[i].name]: {
        price,
        tokens: [pools[i].token],
        balances: [supply[i].div(pools[i].decimals).toString(10)],
        totalSupply: supply[i].div(pools[i].decimals).toString(10),
      },
    };
  }

  return prices;
};

module.exports = getStargateV2Prices;
