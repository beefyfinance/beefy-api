import { getAllBoosts } from '../boosts/getBoosts';
import { Boost } from '../boosts/types';
import BigNumber from 'bignumber.js';
import { fetchPrice } from '../../utils/fetchPrice';
import { Vault } from '../vaults/types';
import { ApiChain, toChainId } from '../../utils/chain';
import BeefyBoostAbi from '../../abis/BeefyBoost';
import { fetchContract } from '../rpc/client';
import { isFiniteNumber } from '../../utils/number';

const { getVaultByID } = require('../stats/getMultichainVaults');

const updateBoostAprsForChain = async (chain: ApiChain, boosts: Boost[]) => {
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
      if (!isNaN(parseFloat(apr.toString()))) {
        boostAprs[boosts[i].id] = apr;
      }
    }

    return boostAprs;
  } catch (err) {
    console.log(err.message);
    return {};
  }
};

/**
 * @param callReturnContext
 * @returns -1 if boost has expired, null if error ocurred, apr number value if successful
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
      !isFiniteNumber(depositTokenPrice) ||
      depositTokenPrice === 0 ||
      !isFiniteNumber(earnedTokenPrice) ||
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
    console.log('Failed to update boost aprs: ' + error.message);
    return {};
  }
};
