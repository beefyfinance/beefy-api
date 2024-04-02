import BigNumber from 'bignumber.js';
import getApyBreakdown from './getApyBreakdown';
import { BIG_ZERO } from '../../../utils/big-number';

export const getCowApy = async (subgraphUrl: string, vaultMappings: { [key: string]: string }) => {
  try {
    const response: any = await fetch(subgraphUrl, {
      body: '{"query":"query BeefyAPRs {\\n  beefyCLVaults {\\n    id\\n    apr1D\\n    apr7D\\n  }\\n}","operationName":"BeefyCLss","extensions":{}}',
      method: 'POST',
    }).then(res => res.json());
    const vaults = response.data.beefyCLVaults;
    const pools = [];
    const farmAprs: BigNumber[] = [];
    const clmAprs: number[] = [];
    vaults.forEach(vault => {
      if (vaultMappings[vault.id.toLowerCase()]) {
        pools.push({ name: vaultMappings[vault.id.toLowerCase()] });
        farmAprs.push(BIG_ZERO);
        clmAprs.push(new BigNumber(vault.apr1D).toNumber());
      }
    });
    return getApyBreakdown(pools, undefined, farmAprs, undefined, undefined, undefined, clmAprs);
  } catch (err) {
    console.error('> getCowApy Error: ', err.message);
    return {};
  }
};
