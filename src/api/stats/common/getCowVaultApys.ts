import BigNumber from 'bignumber.js';
import getApyBreakdown, { ApyBreakdownResult } from './getApyBreakdown';
import { BIG_ZERO } from '../../../utils/big-number';
import { ChainId } from '../../../../packages/address-book/src/address-book';
import { ApiChain, toChainId } from '../../../utils/chain';
import { getCowVaultsMeta } from '../../cowcentrated/getCowVaultsMeta';
import {
  type AnyCowClmMeta,
  type CowClmMeta,
  type CowClmWithRewardPoolMeta,
  isCowClmWithRewardPoolMeta,
} from '../../cowcentrated/types';
import { isDefined } from '../../../utils/array';
import { ApyBreakdownFromInput, getApyBreakdownFrom } from './getApyBreakdownFrom';
import { getBeefyRewardPoolV2Apr } from './getBeefyRewardPoolV2Apr';

/**
 * Base CLMs + Reward Pools
 */
export const getCowApys = async (apiChain: ApiChain) => {
  const clms = getCowVaultsMeta(apiChain);
  if (!clms.length) {
    throw new Error(`No clms found for ${apiChain}`);
  }

  const chainId = toChainId(apiChain);
  const [clmBreakdownsResult, rewardPoolAprsResult] = await Promise.allSettled([
    getCowClmApyBreakdown(chainId, clms),
    getCowRewardPoolAprs(chainId, clms),
  ]);

  if (clmBreakdownsResult.status === 'rejected') {
    throw new Error(
      `Failed to get clm apy breakdowns for ${apiChain}: ${clmBreakdownsResult.reason}`
    );
  }

  const clmBreakdowns = clmBreakdownsResult.value;
  if (rewardPoolAprsResult.status === 'rejected') {
    console.error(
      `Failed to get clm reward pool aprs for ${apiChain}: ${rewardPoolAprsResult.reason}`
    );
    // keep clm data even if reward pool data is missing
    return clmBreakdowns;
  }

  const rewardPoolAprs = rewardPoolAprsResult.value;
  const rewardPoolBreakdowns = getCowRewardPoolApyBreakdown(clms, clmBreakdowns, rewardPoolAprs);

  if (!rewardPoolBreakdowns) {
    // this just means none of the CLMs had reward pools defined in config
    return clmBreakdowns;
  }

  return {
    apys: { ...clmBreakdowns.apys, ...rewardPoolBreakdowns.apys },
    apyBreakdowns: { ...clmBreakdowns.apyBreakdowns, ...rewardPoolBreakdowns.apyBreakdowns },
  };
};

function getCowRewardPoolApyBreakdown(
  clms: AnyCowClmMeta[],
  clmApys: ApyBreakdownResult,
  rewardPoolAprs: (number | undefined)[]
): ApyBreakdownResult | undefined {
  const inputs = clms
    .map((clm, index): ApyBreakdownFromInput | undefined => {
      if (isCowClmWithRewardPoolMeta(clm)) {
        return {
          oracleId: clm.rewardPool.oracleId,
          address: clm.rewardPool.address,
          beefyFee: 0,
          farmApr: rewardPoolAprs[index],
          clmApr: clmApys.apyBreakdowns[clm.oracleId]?.clmApr,
          merklApr: clmApys.apyBreakdowns[clm.oracleId]?.merklApr,
        };
      }
      return undefined;
    })
    .filter(isDefined);

  return inputs.length ? getApyBreakdownFrom(inputs) : undefined;
}

const getCowRewardPoolAprs = async (
  chainId: ChainId,
  clms: AnyCowClmMeta[]
): Promise<(number | undefined)[]> => {
  const resolveUndefined = Promise.resolve(undefined);
  return Promise.all(
    clms.map(clm =>
      isCowClmWithRewardPoolMeta(clm) ? getCowRewardPoolApr(chainId, clm) : resolveUndefined
    )
  );
};

const getCowRewardPoolApr = async (
  chainId: ChainId,
  clm: CowClmWithRewardPoolMeta
): Promise<number | undefined> => {
  try {
    const result = await getBeefyRewardPoolV2Apr(chainId, {
      oracleId: clm.rewardPool.oracleId,
      address: clm.rewardPool.address,
      stakedToken: {
        oracleId: clm.oracleId,
        address: clm.address,
        decimals: 18,
      },
      rewards: clm.rewardPool.rewards,
    });

    if (!result) {
      console.error(
        `> getCowRewardPoolApr Error for ${clm.rewardPool.oracleId}: getBeefyRewardPoolV2Apr returned undefined`
      );
      return undefined;
    }

    //for (const reward of result.rewardsApr) {
    //  console.log(reward.oracleId, reward.apr);
    //}

    return result.totalApr;
  } catch (err) {
    console.error(`> getCowRewardPoolApr Error for ${clm.rewardPool.oracleId}: ${err.message}`);
    return undefined;
  }
};

const getCowClmApyBreakdown = async (
  chainId: ChainId,
  vaults: AnyCowClmMeta[]
): Promise<ApyBreakdownResult> => {
  const merklCampaigns = await getMerklCampaigns(chainId);
  const pools = [];
  const farmAprs: BigNumber[] = [];
  const clmAprs: number[] = [];
  const merklAprs: number[] = [];
  vaults.forEach(vault => {
    pools.push({ name: vault.oracleId });
    farmAprs.push(BIG_ZERO);
    clmAprs.push(new BigNumber(vault.apr).toNumber());
    merklAprs.push(getMerklAprForVault(vault, merklCampaigns));
  });
  return getApyBreakdown(
    pools,
    undefined,
    farmAprs,
    undefined,
    undefined,
    undefined,
    clmAprs,
    merklAprs
  );
};

type Forwarder = {
  almAPR: number;
  almAddress: string;
};

type Campaign = {
  mainParameter: string;
  forwarders: Forwarder[];
};

type MerklChainCampaigns = {
  [poolIdentifier: string]: {
    [campaignID: string]: Campaign;
  };
};

type MerklAPIChainCampaigns = {
  [chainId in ChainId]: MerklAPIChainCampaigns;
};

const getMerklCampaigns = async (chainID: ChainId) => {
  try {
    const response = await fetch('https://api.merkl.xyz/v3/campaigns?chainIds=' + chainID).then(
      res => res.json() as Promise<MerklAPIChainCampaigns>
    );
    return response[chainID];
  } catch (err) {
    console.error(`> getMerklCampaigns Error on ${chainID}  ${err.message}`);
    console.error(err);
    return {};
  }
};

const getMerklAprForVault = (vault: CowClmMeta, merklCampaigns: MerklChainCampaigns) => {
  if (!merklCampaigns) return 0;
  let apr = 0;
  for (const [poolId, campaigns] of Object.entries(merklCampaigns)) {
    for (const [campaignId, campaign] of Object.entries(campaigns)) {
      if (campaign.mainParameter.toLowerCase() === vault.lpAddress.toLowerCase()) {
        campaign.forwarders.forEach(forwarder => {
          if (forwarder.almAddress.toLowerCase() === vault.address.toLowerCase()) {
            if (forwarder.almAPR === 0 || isNaN(forwarder.almAPR)) return;
            apr += forwarder.almAPR / 100;
          }
        });
      }
    }
  }
  return apr;
};
