import pools from '../../../data/fantom/stakesteakLpPools.json';
import { fantomWeb3 as web3 } from '../../../utils/web3';
import StakeSteakPair from '../../../abis/fantom/StakeSteakPair.json';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { MULTICALL_V3 } from '../../../utils/web3Helpers';
import { ContractCallContext, Multicall, CallReturnContext } from 'ethereum-multicall';
import { ChainId } from '../../../../packages/address-book/types/chainid';

type PoolType = typeof pools[number];

type LpBreakdown = {
  price: number;
  tokens: string[];
  balances: string[];
  totalSupply: string;
};

export async function getStakeSteakPrices(
  tokenPrices: Record<string, number>
): Promise<Record<string, LpBreakdown>> {
  const multicallAddress = MULTICALL_V3[ChainId.fantom];
  return getPoolsData(web3, multicallAddress, pools, tokenPrices);
}

async function getPoolsData(
  web3: Web3,
  multicallAddress: string,
  pools: PoolType[],
  tokenPrices: Record<string, number>
): Promise<Record<string, LpBreakdown>> {
  const multicall = new Multicall({
    web3Instance: web3,
    tryAggregate: true,
    multicallCustomContractAddress: multicallAddress,
  });

  const calls: ContractCallContext[] = pools.map(pool => ({
    reference: pool.name,
    contractAddress: pool.address,
    abi: StakeSteakPair,
    calls: [
      {
        reference: `totalSupply`,
        methodName: 'totalSupply',
        methodParameters: [],
      },
      {
        reference: `reserve0`,
        methodName: 'reserve0',
        methodParameters: [],
      },
      {
        reference: `reserve1`,
        methodName: 'reserve1',
        methodParameters: [],
      },
    ],
  }));

  const multicallResults = await multicallResultsByReference(multicall, calls);

  return pools.reduce((poolData: Record<string, LpBreakdown>, pool: PoolType) => {
    const {
      [`${pool.name}_totalSupply`]: totalSupplyResult,
      [`${pool.name}_reserve0`]: reserves0Result,
      [`${pool.name}_reserve1`]: reserves1Result,
    } = multicallResults;

    if (!totalSupplyResult.success || !reserves0Result.success || !reserves1Result.success) {
      console.error(`Failed fetching data for pool ${pool.name}`);
      return poolData;
    }

    const lp0Price = getTokenPrice(tokenPrices, pool.lp0.oracleId);
    const lp1Price = getTokenPrice(tokenPrices, pool.lp1.oracleId);
    const reserves0 = new BigNumber(reserves0Result.returnValues[0].hex).dividedBy(
      pool.lp0.decimals
    );
    const reserves1 = new BigNumber(reserves1Result.returnValues[0].hex).dividedBy(
      pool.lp1.decimals
    );
    const totalSupply = new BigNumber(totalSupplyResult.returnValues[0].hex).dividedBy(
      pool.decimals
    );

    const reserves0InUsd = reserves0.times(lp0Price);
    const reserves1InUsd = reserves1.times(lp1Price);
    const totalBalInUsd = reserves0InUsd.plus(reserves1InUsd);
    const poolPrice = totalBalInUsd.dividedBy(totalSupply);

    poolData[pool.name] = {
      price: poolPrice.toNumber(),
      tokens: [pool.lp0.address, pool.lp1.address],
      balances: [reserves0.toString(10), reserves1.toString(10)],
      totalSupply: totalSupply.toString(10),
    };

    return poolData;
  }, {});
}

async function multicallResultsByReference(
  multicall: Multicall,
  calls: ContractCallContext[]
): Promise<Record<string, CallReturnContext>> {
  const multicallResult = await multicall.call(calls);
  const results: Record<string, CallReturnContext> = {};
  for (const contractResult of Object.values(multicallResult.results)) {
    for (const callResult of contractResult.callsReturnContext) {
      results[`${contractResult.originalContractCallContext.reference}_${callResult.reference}`] =
        callResult;
    }
  }

  return results;
}

function getTokenPrice(tokenPrices: Record<string, number>, oracleId: string): number {
  if (!oracleId) {
    throw new Error('Oracle ID is not defined');
  }

  if (!(oracleId in tokenPrices)) {
    console.error(`Oracle ID '${oracleId}' is not defined in tokenPrices`);
    return 0;
  }

  return tokenPrices[oracleId];
}
