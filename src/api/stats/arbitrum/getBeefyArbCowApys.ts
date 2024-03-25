import { getCowApy } from '../common/getCowVaultApys';

const SUBGRAPH = 'https://api.0xgraph.xyz/subgraphs/name/beefyfinance/clm-arbitrum';

const vaultMapping = {
  ['0x86B75C2926a28aE94A0C61EA3f7dcDDDA1DE296A'.toLowerCase()]: 'uniswap-cow-arb-wseth-eth',
  ['0xb4f4CAC762ea999775ff425d27c2c5ef24EAb097'.toLowerCase()]: 'uniswap-cow-arb-arb-eth',
};

export const getBeefyArbCowApys = async () => {
  return await getCowApy(SUBGRAPH, vaultMapping);
};
