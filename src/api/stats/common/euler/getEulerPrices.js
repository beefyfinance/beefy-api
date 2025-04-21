import BigNumber from 'bignumber.js';
import { parseAbi } from 'viem';
import { fetchContract } from '../../../rpc/client';
import ERC20Abi from '../../../../abis/ERC20Abi';

const abi = parseAbi([
  'function convertToAssets(uint shares) external view returns (uint)',
  'function asset() external view returns (address)',
]);

export const getEulerPrices = async (chainId, pools, tokenPrices) => {
  const ppsCalls = pools.map(pool => fetchContract(pool.address, abi, chainId).read.convertToAssets([1e18]));
  const supplyCalls = pools.map(pool => fetchContract(pool.address, ERC20Abi, chainId).read.totalSupply());
  const assetCalls = pools.map(pool => fetchContract(pool.address, abi, chainId).read.asset());
  const [ppsRes, supplyRes, assetRes] = await Promise.all([
    Promise.all(ppsCalls),
    Promise.all(supplyCalls),
    Promise.all(assetCalls),
  ]);

  let prices = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const pps = new BigNumber(ppsRes[i]).div('1e18');
    const tokenPrice = tokenPrices[pool.oracleId];
    const price = pps.times(tokenPrice).toNumber();
    const totalSupply = new BigNumber(supplyRes[i]).div(pool.decimals).toString(10);
    prices[pool.name] = {
      price,
      totalSupply,
      tokens: [assetRes[i]],
      balances: [new BigNumber(totalSupply).times(pps).toString(10)],
    };
  }
  return prices;
};
