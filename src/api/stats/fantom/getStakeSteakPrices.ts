import pools from '../../../data/fantom/stakesteakLpPools.json';
import { fantomWeb3 as web3 } from '../../../utils/web3';
import ERC20 from '../../../abis/ERC20.json';
import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { MULTICALL_V3 } from '../../../utils/web3Helpers';
import { ContractCallContext, Multicall, CallReturnContext } from 'ethereum-multicall';
import { ChainId } from '../../../../packages/address-book/types/chainid';
import { groupBy } from 'lodash';

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

  const calls: Erc20Call[] = pools.reduce((acc: Erc20Call[], pool: PoolType) => {
    acc.push({
      reference: `${pool.name}_totalSupply`,
      type: 'totalSupply',
      contract: pool.address,
    });
    acc.push({
      reference: `${pool.name}_balanceOf_lp0`,
      type: 'balanceOf',
      contract: pool.lp0.address,
      target: pool.address,
    });
    acc.push({
      reference: `${pool.name}_balanceOf_lp1`,
      type: 'balanceOf',
      contract: pool.lp1.address,
      target: pool.address,
    });
    return acc;
  }, []);

  const multicallResults = await erc20Multicall(multicall, calls);

  return pools.reduce((poolData: Record<string, LpBreakdown>, pool: PoolType) => {
    const {
      [`${pool.name}_totalSupply`]: totalSupplyResult,
      [`${pool.name}_balanceOf_lp0`]: lp0BalanceResult,
      [`${pool.name}_balanceOf_lp1`]: lp1BalanceResult,
    } = multicallResults;

    if (!totalSupplyResult.success || !lp0BalanceResult.success || !lp1BalanceResult.success) {
      console.error(`Failed fetching data for pool ${pool.name}`);
      return poolData;
    }

    const lp0Price = getTokenPrice(tokenPrices, pool.lp0.oracleId);
    const lp1Price = getTokenPrice(tokenPrices, pool.lp1.oracleId);
    const lp0Bal = new BigNumber(lp0BalanceResult.returnValues[0].hex).dividedBy(pool.lp0.decimals);
    const lp1Bal = new BigNumber(lp1BalanceResult.returnValues[0].hex).dividedBy(pool.lp1.decimals);
    const totalSupply = new BigNumber(totalSupplyResult.returnValues[0].hex).dividedBy(
      pool.decimals
    );

    const lp0BalInUsd = lp0Bal.times(lp0Price);
    const lp1BalInUsd = lp1Bal.times(lp1Price);
    const totalBalInUsd = lp0BalInUsd.plus(lp1BalInUsd);
    const poolPrice = totalBalInUsd.dividedBy(totalSupply);

    poolData[pool.name] = {
      price: poolPrice.toNumber(),
      tokens: [pool.lp0.address, pool.lp1.address],
      balances: [lp0Bal.toString(10), lp1Bal.toString(10)],
      totalSupply: totalSupply.toString(10),
    };

    return poolData;
  }, {});
}

type TotalSupplyCall = {
  type: 'totalSupply';
  reference: string;
  contract: string;
};

type BalanceOfCall = {
  type: 'balanceOf';
  reference: string;
  contract: string;
  target: string;
};

type Erc20Call = TotalSupplyCall | BalanceOfCall;

async function erc20Multicall(
  multicall: Multicall,
  calls: Erc20Call[]
): Promise<Record<string, CallReturnContext>> {
  const callsByContract = groupBy(calls, 'contract');

  // potential improvement: de-dupe balanceOf calls
  const contexts: ContractCallContext[] = Object.entries(callsByContract).map(
    ([contract, calls]) => ({
      reference: contract,
      contractAddress: contract,
      abi: ERC20,
      calls: calls.map(call => {
        switch (call.type) {
          case 'totalSupply':
            return {
              reference: call.reference,
              methodName: 'totalSupply',
              methodParameters: [],
            };
          case 'balanceOf':
            return {
              reference: call.reference,
              methodName: 'balanceOf',
              methodParameters: [call.target],
            };
        }
      }),
    })
  );

  const multicallResult = await multicall.call(contexts);
  const results: Record<string, CallReturnContext> = {};
  for (const contractResult of Object.values(multicallResult.results)) {
    for (const callResult of contractResult.callsReturnContext) {
      results[callResult.reference] = callResult;
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
