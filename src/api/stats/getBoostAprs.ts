import {
  ContractCallContext,
  ContractCallResults,
  ContractCallReturnContext,
  Multicall,
} from 'ethereum-multicall';
import { chunk } from 'lodash';
import { web3Factory } from '../../utils/web3';
import { getAllBoosts } from '../boosts/getBoosts';
import { Boost } from '../boosts/types';
import BoostAbi from '../../abis/BeefyBoost.json';
import BigNumber from 'bignumber.js';
import fetchPrice from '../../utils/fetchPrice';
import { Vault } from '../vaults/types';
import { MULTICALL_V3 } from '../../utils/web3Helpers';
import { ApiChain, toChainId } from '../../utils/chain';

const { getVaultByID } = require('../stats/getMultichainVaults');

const MULTICALL_BATCH_SIZE = 768;

const updateBoostAprsForChain = async (chain: ApiChain, boosts: Boost[]) => {
  const chainId = toChainId(chain);
  const web3 = web3Factory(chainId);
  const multicallAddress = MULTICALL_V3[chainId];
  if (!multicallAddress) {
    console.warn(`> Boost Aprs: Skipping chain ${chainId} as no multicall address found`);
    return {};
  }

  const multicall = new Multicall({
    web3Instance: web3,
    tryAggregate: true,
    multicallCustomContractAddress: multicallAddress,
  });

  const callContext: ContractCallContext[] = mapBoostsToCalls(boosts);
  const promises: Promise<ContractCallResults>[] = chunk(callContext, MULTICALL_BATCH_SIZE).map(
    batch => multicall.call(batch)
  );

  try {
    const results = await Promise.allSettled(promises);

    const fulfilledResults = results
      .filter(promise => promise.status === 'fulfilled')
      .flatMap((res: PromiseFulfilledResult<ContractCallResults>) =>
        Object.entries(res.value.results)
      );

    const boostAprs: { [boostId: string]: number } = {};
    for (const [id, callReturnContext] of fulfilledResults) {
      const apr = await mapResponseToBoostApr(callReturnContext);
      if (!isNaN(parseFloat(apr.toString()))) {
        boostAprs[id] = apr;
      }
    }
    return boostAprs;
  } catch (err) {
    console.log(err.message);
    return {};
  }
};

const mapBoostsToCalls = (boosts: Boost[]): ContractCallContext[] => {
  return boosts.map(boost => ({
    reference: boost.id,
    contractAddress: boost.earnContractAddress,
    abi: BoostAbi,
    calls: [
      {
        reference: 'totalSupply',
        methodName: 'totalSupply',
        methodParameters: [],
      },
      {
        reference: 'rewardRate',
        methodName: 'rewardRate',
        methodParameters: [],
      },
      {
        reference: 'periodFinish',
        methodName: 'periodFinish',
        methodParameters: [],
      },
    ],
    context: boost,
  }));
};
/**
 * @param callReturnContext
 * @returns -1 if boost has expired, null if error ocurred, apr number value if successful
 */
const mapResponseToBoostApr = async (
  callReturnContext: ContractCallReturnContext
): Promise<number> => {
  const boost: Boost = callReturnContext.originalContractCallContext.context;
  const totalSupply = new BigNumber(callReturnContext.callsReturnContext[0].returnValues[0].hex);
  const rewardRate = new BigNumber(callReturnContext.callsReturnContext[1].returnValues[0].hex);
  const periodFinish = new BigNumber(callReturnContext.callsReturnContext[2].returnValues[0].hex);

  if (periodFinish.times(1000).lte(new BigNumber(Date.now()))) return -1;

  try {
    const vault: Vault = getVaultByID(boost.poolId);
    const depositTokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
    const earnedTokenPrice = await fetchPrice({
      oracle: boost.earnedOracle,
      id: boost.earnedOracleId,
    });

    //Price is missing, we can't consider this as a succesful calculation
    if (
      isNaN(parseFloat(depositTokenPrice)) ||
      depositTokenPrice === 0 ||
      isNaN(parseFloat(earnedTokenPrice)) ||
      earnedTokenPrice === 0
    ) {
      return null;
    }

    const amountStakedInUsd = totalSupply
      .times(vault.pricePerFullShare)
      .times(depositTokenPrice)
      .shiftedBy(-(vault.tokenDecimals + 18));
    const yearlyRewardsInUsd = rewardRate
      .times(earnedTokenPrice)
      .times(365 * 24 * 3600)
      .shiftedBy(-boost.earnedTokenDecimals);

    return yearlyRewardsInUsd.dividedBy(amountStakedInUsd).toNumber();
  } catch (err) {
    console.log(`[boost aprs] error calculating apr for ${boost.id}: ${err.message}`);
    return null;
  }
};

export const fetchBoostAprs = async () => {
  const boostByChain: { [chain: string]: Boost[] } = getAllBoosts().reduce(
    (allBoosts, previousBoost) => {
      if (!allBoosts[previousBoost.chain]) allBoosts[previousBoost.chain] = [];
      allBoosts[previousBoost.chain].push(previousBoost);
      return allBoosts;
    },
    {}
  );

  const chainPromises = Object.keys(boostByChain).map(chain =>
    updateBoostAprsForChain(chain as ApiChain, boostByChain[chain])
  );

  try {
    let results = await Promise.all(chainPromises);
    return results.reduce(
      (allBoostAprs, currentChainBoostChainAprs) => ({
        ...allBoostAprs,
        ...currentChainBoostChainAprs,
      }),
      {}
    );
  } catch (error) {
    return {};
  }
};
