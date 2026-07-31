import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import type { Address } from 'viem';
import SiloAbi from '../../../abis/arbitrum/Silo.ts';
import SiloTokenAbi from '../../../abis/arbitrum/SiloToken.ts';
import SiloV2Abi from '../../../abis/SiloV2.ts';
import type { PricesById, StandardLpBreakdown } from '../../../types/prices.ts';
import { getLoggerFor } from '../../../utils/logger/index.ts';
import { fetchContract } from '../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'silo' });

type SiloPool = {
  name: string;
  address: string;
  silo: string;
  underlying: string;
  oracleId: string;
  decimals: string;
  chainId: number;
  v2?: boolean;
  vault?: boolean;
  vaultId?: number;
  collateral?: boolean;
};

type SiloAmount = bigint | { collateralOnlyDeposits: bigint; totalDeposits: bigint };

export const getSiloPrices = async (chainId: ChainId, pools: SiloPool[], tokenPrices: PricesById) => {
  const [amountCalls, totalSupplyCalls, decimalsCalls] = pools.reduce<
    [Promise<SiloAmount>[], Promise<bigint>[], Promise<number>[]]
  >(
    (acc, pool) => {
      const siloTokenContract = fetchContract(pool.address, SiloTokenAbi, chainId);
      if (pool.v2 || pool.vault) {
        const siloContract = fetchContract(pool.silo, SiloV2Abi, chainId);
        acc[0].push(siloContract.read.totalAssets());
      } else {
        const siloContract = fetchContract(pool.silo, SiloAbi, chainId);
        acc[0].push(siloContract.read.assetStorage([pool.underlying as Address]));
      }
      acc[1].push(siloTokenContract.read.totalSupply());
      acc[2].push(siloTokenContract.read.decimals());
      return acc;
    },
    [[], [], []]
  );

  const [amountResults, totalSupplyResults, decimalsResults] = await Promise.all([
    Promise.all(amountCalls),
    Promise.all(totalSupplyCalls),
    Promise.all(decimalsCalls),
  ]);

  const prices: Record<string, StandardLpBreakdown> = {};
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i];
    const token = pool.underlying;
    const totalSupplyDecimals = new BigNumber(decimalsResults[i]).toNumber(); // [as X, not Xe18] Needed as V2 uses SiloMathLib._DECIMALS_OFFSET extra decimals for LP tokens
    const amount = amountResults[i];
    const balance =
      typeof amount === 'bigint'
        ? new BigNumber(amount.toString()).div(pool.decimals)
        : pool.collateral
          ? new BigNumber(amount.collateralOnlyDeposits.toString()).div(pool.decimals)
          : new BigNumber(amount.totalDeposits.toString()).div(pool.decimals);
    const totalSupply = new BigNumber(totalSupplyResults[i]).shiftedBy(-totalSupplyDecimals);

    const priceUnderlying = getTokenPrice(tokenPrices, pool.oracleId);
    const price = balance.times(priceUnderlying).div(totalSupply).toNumber();

    prices[pool.name] = {
      price,
      tokens: [token],
      balances: [balance.toString(10)],
      totalSupply: totalSupply.toString(10),
    };
  }
  return prices;
};

const getTokenPrice = (tokenPrices: PricesById, oracleId: string) => {
  const price = tokenPrices[oracleId];
  if (price === undefined) {
    logger.warn({ oracleId }, 'unknown token, defaulting price to 0');
    return 0;
  }
  return price;
};
