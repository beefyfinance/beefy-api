import BigNumber from 'bignumber.js';
import getApyBreakdown from './getApyBreakdown';
import { BIG_ZERO } from '../../../utils/big-number';
import { ChainId } from '../../../../packages/address-book/address-book';
import { CowVault } from './getBeefyCowcentratedVaultPrices';

export const getCowApy = async (subgraphUrl: string, clmVaults: CowVault[], chainID: ChainId) => {
  try {
    const vaults = await getBeefyCLMVaults(subgraphUrl);
    const merkleCampaigns = await getMerkleCampaigns(chainID);

    const pools = [];
    const farmAprs: BigNumber[] = [];
    const clmAprs: number[] = [];
    const merkleAprs: number[] = [];
    vaults.forEach(vault => {
      const matchedVaultIndex = clmVaults.findIndex(
        v => v.address.toLowerCase() === vault.id.toLowerCase()
      );
      if (matchedVaultIndex === -1) return;

      const matchedVault = clmVaults[matchedVaultIndex];
      pools.push({ name: matchedVault.oracleId });
      farmAprs.push(BIG_ZERO);
      clmAprs.push(new BigNumber(vault.apr1D).toNumber());
      merkleAprs.push(getMerkleAprForVault(matchedVault, merkleCampaigns));
    });
    return getApyBreakdown(
      pools,
      undefined,
      farmAprs,
      undefined,
      undefined,
      undefined,
      clmAprs,
      merkleAprs
    );
  } catch (err) {
    console.error(`> getCLMApy Error on ${chainID}:  ${err.message}`);
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

type MerkleChainCampaigns = {
  [poolIdentifier: string]: {
    [campaignID: string]: Campaign;
  };
};

type MerkleAPIChainCampaigns = {
  [chainId in ChainId]: MerkleAPIChainCampaigns;
};

const getBeefyCLMVaults = async (subgraphUrl: string) => {
  const response: any = await fetch(subgraphUrl, {
    body: '{"query":"query BeefyAPRs {\\n  beefyCLVaults {\\n    id\\n    apr1D\\n    apr7D\\n  }\\n}","operationName":"BeefyCLss","extensions":{}}',
    method: 'POST',
  }).then(res => res.json());
  return response.data.beefyCLVaults;
};

const getMerkleCampaigns = async (chainID: ChainId) => {
  try {
    const response = await fetch('https://api.merkl.xyz/v3/campaigns?chainIds=' + chainID).then(
      res => res.json() as Promise<MerkleAPIChainCampaigns>
    );
    return response[chainID];
  } catch (err) {
    console.error(`> getMerkleCampaigns Error on ${chainID}  ${err.message}`);
    console.error(err);
    return {};
  }
};

const getMerkleAprForVault = (vault: CowVault, merkleCampaigns: MerkleChainCampaigns) => {
  let apr = 0;
  for (const [poolId, campaigns] of Object.entries(merkleCampaigns)) {
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
