import { ChainId } from '../../../../packages/address-book/src/types/chainid';
import BigNumber from 'bignumber.js';
import { getJson } from '../../../utils/http';
import { MerklApiCampaignsResponse } from '../../offchain-rewards/providers/merkl/types';
import { BIG_ZERO } from '../../../utils/big-number';
import { mapKeys } from 'lodash';
import { isFiniteNumber } from '../../../utils/number';

type MerklPoolRequest = {
  /** address of ALM contract */
  address: string;
  /** address of pool (mainParameter) */
  pool: string;
};

export enum MerklPoolType {
  ERC20 = 1,
  ConcentratedLiquidity,
  ERC20Snapshot,
  Airdrops,
  Silo,
  RadiantEmissions,
  Morpho,
  Dolomite,
}

export async function getMerklAprs(
  chainId: ChainId,
  pools: MerklPoolRequest[],
  types: MerklPoolType[] = [MerklPoolType.ConcentratedLiquidity]
): Promise<BigNumber[]> {
  const aprs = pools.map(() => BIG_ZERO);

  try {
    const params = new URLSearchParams({
      chainIds: chainId.toString(),
      live: 'true',
    });
    for (const type of types) {
      params.append('types', type.toString());
    }

    const data = await getJson<MerklApiCampaignsResponse>({
      url: 'https://api.merkl.xyz/v3/campaigns',
      params,
    });

    if (!data || typeof data !== 'object') {
      throw new Error(`response error`);
    }

    if (Object.keys(data).length === 0) {
      throw new Error(`no data returned`);
    }

    const dataForChain = data[chainId];
    if (!dataForChain) {
      throw new Error(`no data for chain returned`);
    }

    for (const poolCampaigns of Object.values(dataForChain)) {
      for (const campaign of Object.values(poolCampaigns)) {
        for (let i = 0; i < pools.length; ++i) {
          const pool = pools[i];
          if (pool.pool.toLowerCase() !== campaign.mainParameter.toLowerCase()) {
            continue;
          }

          const poolForwarders = campaign.forwarders.filter(
            forwarder => pool.address.toLowerCase() === forwarder.almAddress.toLowerCase()
          );
          if (poolForwarders.length === 0) {
            continue;
          }

          const aprByLabel = mapKeys(campaign.aprs, (_, key) => key.toLowerCase());
          for (const forwarder of poolForwarders) {
            const apr = aprByLabel[forwarder.label.toLowerCase()];
            if (apr && isFiniteNumber(apr)) {
              aprs[i] = aprs[i].plus(apr / 100);
            }
          }
        }
      }
    }
  } catch (err: unknown) {
    console.error(`getMerklAprs(${chainId}):`, err);
  }

  return aprs;
}
