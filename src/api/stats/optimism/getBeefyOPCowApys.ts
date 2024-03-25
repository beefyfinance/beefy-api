import { getCowApy } from '../common/getCowVaultApys';

const SUBGRAPH = 'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-optimism';

const vaultMapping = {
  ['0x44EF0a7023e7B19619F29C09db690fA3DA655453'.toLowerCase()]: 'uniswap-cow-op-moobifi-eth-t2',
  ['0xB8FB18a0F06a2Fd4c65B4168F561618Aab0768E7'.toLowerCase()]: 'uniswap-cow-op-op-eth-t2',
  ['0x9A864CAa21515D85C64323c5670C6a5b776D0e39'.toLowerCase()]: 'uniswap-cow-op-susd-usdc-t2',
};

export const getBeefyOPCowApys = async () => {
  return await getCowApy(SUBGRAPH, vaultMapping);
};
