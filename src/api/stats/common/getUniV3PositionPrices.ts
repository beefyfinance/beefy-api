import BigNumber from 'bignumber.js';
import { fetchContract } from '../../rpc/client';
import { ChainId } from '../../../../packages/address-book/src/address-book';
import { BaseLpBreakdown } from '../getAmmPrices';
import BeefyUniswapPositionHelperAbi from '../../../abis/BeefyUniswapPositionHelper';

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
): Promise<Record<string, BaseLpBreakdown>> => {
  const positionTokens = await getPoolData(params);
  const prices: Record<string, BaseLpBreakdown> = {};

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
): Record<string, BaseLpBreakdown> => {
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
      balances: [
        lp0Bal.dividedBy(pool.lp0.decimals).toString(10),
        lp1Bal.dividedBy(pool.lp1.decimals).toString(10),
      ],
      totalSupply: liquidity.dividedBy(1e18).toString(10),
    },
  };
};

const getPoolData = async (params: UniV3PositionPricesParams): Promise<PositionTokens[]> => {
  const beefyHelperContract = fetchContract(
    params.beefyHelper,
    BeefyUniswapPositionHelperAbi,
    params.chainId
  ) as {
    read: {
      getPositionTokens: (args: [bigint, `0x${string}`, `0x${string}`]) => Promise<PositionTokens>;
    };
  };
  const calls = params.pools.map(pool =>
    beefyHelperContract.read.getPositionTokens([
      BigInt(pool.nftId),
      pool.address as `0x${string}`,
      params.nftManager as `0x${string}`,
    ])
  );
  return await Promise.all(calls);
};

// Default export for CommonJS compatibility
export default getUniV3PositionPrices;
