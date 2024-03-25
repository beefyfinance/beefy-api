import BigNumber from 'bignumber.js';

export const getCowApy = async (subgraphUrl: string, vaultMappings: { [key: string]: string }) => {
  try {
    const response: any = await fetch(subgraphUrl, {
      body: '{"query":"query BeefyAPRs {\\n  beefyCLVaults {\\n    id\\n    apr1D\\n    apr7D\\n  }\\n}","operationName":"BeefyCLss","extensions":{}}',
      method: 'POST',
    }).then(res => res.json());
    const vaults = response.data.beefyCLVaults;
    const apys = {};
    const apyBreakdowns = {};
    vaults.forEach(vault => {
      if (vaultMappings[vault.id.toLowerCase()]) {
        apys[vaultMappings[vault.id.toLowerCase()]] = new BigNumber(vault.apr1D).toNumber();
        apyBreakdowns[vaultMappings[vault.id.toLowerCase()]] = {
          totalApy: new BigNumber(vault.apr1D).toNumber(),
        };
      }
    });
    return { apys, apyBreakdowns };
  } catch (err) {
    console.error('> getCowApy Error: ', err.message);
    return {};
  }
};
