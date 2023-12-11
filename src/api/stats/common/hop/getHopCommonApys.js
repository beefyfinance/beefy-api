import { getRewardPoolApys } from '../getRewardPoolApys';
import BigNumber from 'bignumber.js';
import { getTradingFeeAprHop } from '../../../../utils/getTradingFeeApr';
import IStableSwapAbi from '../../../../abis/IStableSwap';
import { fetchContract } from '../../../rpc/client';
import ERC20Abi from '../../../../abis/ERC20Abi';
import { getFarmApys } from '../getRewardPoolApys';
import getApyBreakdown from '../getApyBreakdown';

export const getHopCommonApys = async params => {
  const [tradingAprs, farmApys, liquidStakingAprs] = await Promise.all([
    getTradingAprs(params),
    getFarmApys(params),
    getLsAprs(params),
  ]);

  return getApyBreakdown(params.pools, tradingAprs, farmApys, 0.0004, liquidStakingAprs);
};

const getTradingAprs = async params => {
  const tvls = await getTvl(params);
  const pairAddresses = params.pools.map(pool => pool.address.toLowerCase());
  const tokens = params.pools.map(pool => pool.tokens[0].address);
  const aprs = await getTradingFeeAprHop(
    params.client,
    pairAddresses,
    tokens,
    tvls,
    params.liquidityProviderFee
  );
  return aprs;
};

const getTvl = async params => {
  const lpCalls = [];
  const poolCalls = [];
  params.pools.forEach(pool => {
    const lpContract = fetchContract(pool.address, ERC20Abi, params.chainId);
    const poolContract = fetchContract(pool.pool, IStableSwapAbi, params.chainId);
    lpCalls.push(lpContract.read.totalSupply());
    poolCalls.push(poolContract.read.getVirtualPrice());
  });

  const [lpResults, poolResults] = await Promise.all([
    Promise.all(lpCalls),
    Promise.all(poolCalls),
  ]);

  const totalSupplys = lpResults.map(v => new BigNumber(v.toString()));
  const virtualPrices = poolResults.map(v => new BigNumber(v.toString()));

  const tvls = [];
  let i = 0;
  for (const pool of params.pools) {
    tvls.push(
      totalSupplys[i].times(virtualPrices[i]).times(pool.virtualDecimals).dividedBy('1e36')
    );
    ++i;
  }

  return tvls;
};

const getLsAprs = async params => {
  const liquidStakingAprs = [];
  for (let i = 0; i < params.pools.length; i++) {
    const pool = params.pools[i];
    if (pool.lsUrl) {
      try {
        const response = await fetch(pool.lsUrl).then(res => res.json());
        liquidStakingAprs.push(response.yearlyAPR / 100);
      } catch (e) {
        console.error(`Hop: Liquid Staking URL Fetch Error ${pool.name}`);
      }
    } else {
      liquidStakingAprs.push(0);
    }
  }

  return liquidStakingAprs;
};

module.exports = { getHopCommonApys };
