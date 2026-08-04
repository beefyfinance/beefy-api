import type { ChainId } from '@beefyfinance/blockchain-addressbook';
import { BigNumber } from 'bignumber.js';
import { parseAbi } from 'viem';
import ERC20Abi from '../../../../abis/ERC20Abi.ts';
import type { PricesById, StandardLpBreakdown } from '../../../../types/prices.ts';
import { BIGINT_UNIT_18 } from '../../../../utils/big-int.ts';
import { getLoggerFor } from '../../../../utils/logger/index.ts';
import { withTracing } from '../../../../utils/tracing.ts';
import { fetchContract } from '../../../rpc/client.ts';

const logger = getLoggerFor({ module: 'prices', component: 'gearbox' });

const abi = parseAbi(['function convertToAssets(uint shares) external view returns (uint)']);

export type GearboxPricePool = {
  name: string;
  address: string;
  oracleId: string;
  decimals: string;
};

export const getGearboxPrices = withTracing(
  async (chainId: ChainId, pools: GearboxPricePool[], tokenPrices: PricesById) => {
    const ppsCalls = pools.map(pool =>
      fetchContract(pool.address, abi, chainId).read.convertToAssets([BIGINT_UNIT_18])
    );
    const supplyCalls = pools.map(pool => fetchContract(pool.address, ERC20Abi, chainId).read.totalSupply());
    const [ppsRes, supplyRes] = await Promise.all([Promise.all(ppsCalls), Promise.all(supplyCalls)]);

    let prices: Record<string, StandardLpBreakdown> = {};
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const pps = new BigNumber(ppsRes[i]).div('1e18');
      const tokenPrice = tokenPrices[pool.oracleId] ?? 0;
      const price = pps.times(tokenPrice).toNumber();
      const totalSupply = new BigNumber(supplyRes[i]).div(pool.decimals).toString(10);
      prices[pool.name] = {
        price,
        totalSupply,
        tokens: [],
        balances: [],
      };
    }
    return prices;
  },
  { logger, fieldsFn: (chainId: ChainId) => ({ chain: chainId }) }
);
