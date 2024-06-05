import BigNumber from 'bignumber.js';
import getApyBreakdown from './getApyBreakdown';
import { BIG_ZERO } from '../../../utils/big-number';
import { ChainId } from '../../../../packages/address-book/address-book';
import { ApiChain, toChainId } from '../../../utils/chain';
import { getCowVaultsMeta } from '../../cowcentrated/getCowVaultsMeta';
import { CowVaultMeta } from '../../cowcentrated/types';

export const getCowApy = async (apiChain: ApiChain) => {
  try {
    const chainId = toChainId(apiChain);
    const vaults = getCowVaultsMeta(apiChain);
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
  } catch (err) {
    console.error(`> getCLMApy Error on ${apiChain}:  ${err.message}`);
    return {};
  }
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

const getMerklAprForVault = (vault: CowVaultMeta, merklCampaigns: MerklChainCampaigns) => {
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
