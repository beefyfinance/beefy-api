import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import BeefyUniswapPositionHelperAbi from '../../../abis/BeefyUniswapPositionHelper.ts';
import type { StandardLpBreakdown } from '../../../types/prices.ts';
import { fetchContract } from '../../rpc/client.ts';

interface LpTokenConfig {
  address: string;
  oracle: string;
  oracleId: string;
  decimals: string;
}

interface UniV3Pool {
  name: string;
  address: string;
  nftId: number;
  poolFee?: number;
  chainId?: number;
  lp0: LpTokenConfig;
  lp1: LpTokenConfig;
}

interface UniV3PositionPricesParams {
  pools: UniV3Pool[];
  tokenPrices: Record<string, number>;
  chainId: ChainId;
  beefyHelper: string;
  nftManager: string;
}

type PositionTokens = readonly [bigint, bigint, bigint];

export const getUniV3PositionPrices = async (
  params: UniV3PositionPricesParams
): Promise<Record<string, StandardLpBreakdown>> => {
  const positionTokens = await getPoolData(params);
  const prices: Record<string, StandardLpBreakdown> = {};

  for (let i = 0; i < params.pools.length; i++) {
    const price = getPrice(params.pools[i], positionTokens[i], params.tokenPrices);
    Object.assign(prices, price);
  }

  return prices;
};

const getPrice = (
  pool: UniV3Pool,
  positionTokens: PositionTokens,
  tokenPrices: Record<string, number>
): Record<string, StandardLpBreakdown> => {
  const lp0Bal = new BigNumber(positionTokens[0].toString());
  const lp1Bal = new BigNumber(positionTokens[1].toString());
  const liquidity = new BigNumber(positionTokens[2].toString());

  const lp0 = lp0Bal.multipliedBy(tokenPrices[pool.lp0.oracleId]).dividedBy(pool.lp0.decimals);
  const lp1 = lp1Bal.multipliedBy(tokenPrices[pool.lp1.oracleId]).dividedBy(pool.lp1.decimals);
  const price = liquidity.eq(0) ? 0 : lp0.plus(lp1).multipliedBy(1e18).dividedBy(liquidity).toNumber();

  return {
    [pool.name]: {
      price,
      tokens: [pool.lp0.address, pool.lp1.address],
      balances: [lp0Bal.dividedBy(pool.lp0.decimals).toString(10), lp1Bal.dividedBy(pool.lp1.decimals).toString(10)],
      totalSupply: liquidity.dividedBy(1e18).toString(10),
    },
  };
};

const getPoolData = async (params: UniV3PositionPricesParams): Promise<PositionTokens[]> => {
  const beefyHelperContract = fetchContract(params.beefyHelper, BeefyUniswapPositionHelperAbi, params.chainId) as {
    read: {
      getPositionTokens: (args: [bigint, Address, Address]) => Promise<PositionTokens>;
    };
  };
  const calls = params.pools.map(pool =>
    beefyHelperContract.read.getPositionTokens([
      BigInt(pool.nftId),
      pool.address as Address,
      params.nftManager as Address,
    ])
  );
  return await Promise.all(calls);
};

// Default export for CommonJS compatibility
export default getUniV3PositionPrices;
