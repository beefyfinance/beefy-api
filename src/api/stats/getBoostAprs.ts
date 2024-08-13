import { getAllBoosts } from '../boosts/getBoosts';
import { Boost } from '../boosts/types';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../utils/fetchPrice';
import { Vault } from '../vaults/types';
import { ApiChain, toChainId } from '../../utils/chain';
import BeefyBoostAbi from '../../abis/BeefyBoost';
import { fetchContract } from '../rpc/client';
import { isFiniteNumber } from '../../utils/number';
import { partition } from 'lodash';
import { getBeefyRewardPoolV2Aprs } from './common/getBeefyRewardPoolV2Apr';
import { getAddress } from 'viem';
import { isDefined } from '../../utils/array';

const { getVaultByID } = require('../stats/getMultichainVaults');

export const BOOST_APR_EXPIRED = -1;

const updateBoostV2AprsForChain = async (chain: ApiChain, boosts: Boost[]) => {
  try {
    const chainId = toChainId(chain);

    //TODO: check boost update data frequency (/boosts already has periodFinish property) to see if periodFinish is still valid and rpc call can be avoided

    const results = await getBeefyRewardPoolV2Aprs(
      chainId,
      boosts
        .map(boost => {
          const vault = getVaultByID(boost.poolId);
          if (!vault) {
            console.warn(
              `updateBoostV2AprsForChain`,
              chain,
              `vault ${boost.poolId} not found for boost ${boost.id}`
            );
            return undefined;
          }

          return {
            oracleId: boost.id,
            address: getAddress(boost.earnContractAddress),
            stakedToken: {
              oracleId: vault.oracleId,
              address: vault.earnContractAddress,
              decimals: 18,
            },
          };
        })
        .filter(isDefined)
    );

    return results.reduce((aprs: Record<string, number>, result) => {
      if (
        result &&
        result.totalApr !== undefined &&
        result.rewardsApr &&
        result.rewardsApr.length > 0
      ) {
        aprs[result.oracleId] = result.totalApr;
      }
      return aprs;
    }, Object.fromEntries(boosts.map(boost => [boost.id, BOOST_APR_EXPIRED])));
  } catch (err) {
    console.error('updateBoostV2AprsForChain', chain, err.message);
    return {};
  }
};

const updateBoostV1AprsForChain = async (chain: ApiChain, boosts: Boost[]) => {
  const chainId = toChainId(chain);

  //TODO: check boost update data frequency (/boosts already has periodFinish property) to see if periodFinish is still valid and rpc call can be avoided

  const totalSupplyCalls = boosts.map(boost => {
    const contract = fetchContract(boost.earnContractAddress, BeefyBoostAbi, chainId);
    return contract.read.totalSupply();
  });
  const rewardRateCalls = boosts.map(boost => {
    const contract = fetchContract(boost.earnContractAddress, BeefyBoostAbi, chainId);
    return contract.read.rewardRate();
  });
  const periodFinishCalls = boosts.map(boost => {
    const contract = fetchContract(boost.earnContractAddress, BeefyBoostAbi, chainId);
    return contract.read.periodFinish();
  });

  try {
    const [totalSupply, rewardRate, periodFinish] = await Promise.all([
      Promise.all(totalSupplyCalls),
      Promise.all(rewardRateCalls),
      Promise.all(periodFinishCalls),
    ]);

    const boostAprs: { [boostId: string]: number } = {};
    for (let i = 0; i < boosts.length; i++) {
      const apr = await mapResponseToBoostApr(
        boosts[i],
        totalSupply[i],
        rewardRate[i],
        periodFinish[i]
      );
      if (isFiniteNumber(apr)) {
        boostAprs[boosts[i].id] = apr;
      }
    }

    return boostAprs;
  } catch (err) {
    console.error('updateBoostV1AprsForChain', chain, err.message);
    return {};
  }
};

const updateBoostAprsForChain = async (
  chain: ApiChain,
  boosts: Boost[]
): Promise<Record<string, number>> => {
  const [boostsV2, boostsV1] = partition(boosts, boost => boost.version >= 2);
  const [aprsV2, aprsV1] = await Promise.all([
    updateBoostV2AprsForChain(chain, boostsV2),
    updateBoostV1AprsForChain(chain, boostsV1),
  ]);

  return { ...aprsV1, ...aprsV2 };
};

/**
 * @returns -1 if boost has expired, null if error occurred, apr number value if successful
 */
const mapResponseToBoostApr = async (
  boost: Boost,
  supply: bigint,
  rate: bigint,
  finish: bigint
): Promise<number> => {
  const totalSupply = new BigNumber(supply.toString());
  const rewardRate = new BigNumber(rate.toString());
  const periodFinish = new BigNumber(finish.toString());

  if (periodFinish.times(1000).lte(new BigNumber(Date.now()))) return BOOST_APR_EXPIRED;

  try {
    const vault: Vault = getVaultByID(boost.poolId);
    if (!vault) {
      console.error(
        `[boost aprs] error calculating apr for ${boost.id}: vault ${boost.poolId} not found`
      );
      return null;
    }

    const depositTokenPrice = await fetchPrice({ oracle: vault.oracle, id: vault.oracleId });
    const earnedTokenPrice = await fetchPrice({
      oracle: boost.earnedOracle,
      id: boost.earnedOracleId,
    });

    //Price is missing, we can't consider this as a successful calculation
    if (
      !isFiniteNumber(depositTokenPrice) ||
      depositTokenPrice === 0 ||
      !isFiniteNumber(earnedTokenPrice) ||
      earnedTokenPrice === 0
    ) {
      console.error(
        `[boost aprs] error calculating apr for ${boost.id}: missing price deposit=${depositTokenPrice} earned=${earnedTokenPrice}`
      );
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
    console.error(`[boost aprs] error calculating apr for ${boost.id}: ${err.message}`);
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
    console.log('Failed to update boost aprs: ' + error.message);
    return {};
  }
};
