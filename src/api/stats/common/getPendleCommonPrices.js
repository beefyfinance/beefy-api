import BigNumber from 'bignumber.js';
import { parseAbi } from 'viem';
import { fetchContract } from '../../rpc/client';
import ERC20Abi from '../../../abis/ERC20Abi';
import {
  ARBITRUM_CHAIN_ID,
  BASE_CHAIN_ID,
  BSC_CHAIN_ID,
  ETH_CHAIN_ID,
  SONIC_CHAIN_ID,
} from '../../../constants';

const routerStatic = {
  [ARBITRUM_CHAIN_ID]: '0xAdB09F65bd90d19e3148D9ccb693F3161C6DB3E8',
  [ETH_CHAIN_ID]: '0x263833d47eA3fA4a30f269323aba6a107f9eB14C',
  [BSC_CHAIN_ID]: '0x2700ADB035F82a11899ce1D3f1BF8451c296eABb',
  [BASE_CHAIN_ID]: '0xB4205a645c7e920BD8504181B1D7f2c5C955C3e7',
  [SONIC_CHAIN_ID]: '0x0013ACc071f732fd6BF8210AB46A3794a7D8945e',
};
const routerAbi = parseAbi([
  'function isExpired() external view returns (bool)',
  'function readState(address router) external view returns (uint pt, uint sy, uint lp)',
  'function getLpToAssetRate(address market) external view returns (uint256)',
]);

export const getPendleCommonPrices = async (chainId, pools, tokenPrices, lpPrices) => {
  let prices = {};

  const isExpired = pools.map(p => {
    const old = { 'equilibria-arb-seth': '26dec24', 'equilibria-arb-reth': '26jun25' };
    const date = old[p.name] || p.name.split('-').pop();
    const timestamp = Date.parse(`${date} UTC`) || 0;
    if (timestamp === 0) console.error(p.name, 'no expiry date');
    return Date.now() > timestamp;
  });
  const supplyCalls = pools.map(pool => fetchContract(pool.address, ERC20Abi, chainId).read.totalSupply());
  const lpRatesCalls = pools.map(async (pool, i) => {
    const router = routerStatic[chainId];
    const market = pool.address;
    if (isExpired[i]) {
      try {
        return await fetchContract(router, routerAbi, chainId).read.getLpToAssetRate([market]);
      } catch (e) {
        console.error('Pendle lpToAssetRate failed', pool.name);
        const [pt, sy, lp] = await fetchContract(market, routerAbi, chainId).read.readState([router]);
        return new BigNumber(pt).plus(new BigNumber(sy)).times('1e18').div(new BigNumber(lp));
      }
    }
    return fetchContract(router, routerAbi, chainId).read.getLpToAssetRate([market]);
  });
  const [supplyResults, lpRates] = await Promise.all([Promise.all(supplyCalls), Promise.all(lpRatesCalls)]);

  const poolsData = supplyResults.map((_, i) => {
    return {
      lpRate: new BigNumber(lpRates[i]),
      totalSupply: new BigNumber(supplyResults[i]),
    };
  });
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const lpRate = poolsData[i].lpRate;
    // console.log(pool.name, 'lpRate', lpRate.div('1e18').valueOf());
    const underlyingPrice = getUnderlyingPrice(pool, tokenPrices, lpPrices);
    const price = lpRate.times(underlyingPrice).div(pool.decimals).toNumber();
    const totalSupply = poolsData[i].totalSupply.div('1e18').toString(10);
    prices[pool.name] = { price, totalSupply, tokens: [], balances: [] };

    // console.log(pool.name, 'tvl', poolsData[i].totalSupply.div(pool.decimals).times(price).toNumber());
  }
  return prices;
};

const getUnderlyingPrice = (pool, tokenPrices, lpPrices) => {
  const oracle = pool.oracle;
  const oracleId = pool.oracleId;
  if (!oracle || !oracleId) {
    console.error(`getPendlePrices no oracle or oracleId on ${pool.name}`);
    return 1;
  }
  let tokenPrice = 1;
  if (oracle === 'lps') {
    if (lpPrices.hasOwnProperty(oracleId)) {
      tokenPrice = lpPrices[oracleId];
    } else {
      console.error(`getPendlePrices Unknown lp '${oracleId}'`);
    }
  } else {
    if (tokenPrices.hasOwnProperty(oracleId)) {
      tokenPrice = tokenPrices[oracleId];
    } else {
      console.error(`getPendlePrices Unknown token '${oracleId}'`);
    }
  }
  return tokenPrice;
};
