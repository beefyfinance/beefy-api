import type { Token } from '../../../types/token.js';

const ETH = {
  name: 'Wrapped Ether',
  address: '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73',
  symbol: 'WETH',
  oracleId: 'WETH',
  decimals: 18,
  chainId: 4663,
  website: 'https://weth.io/',
  description: 'Ether or ETH is the native currency built on the Ethereum blockchain.',
  bridge: 'robinhood-canonical',
  documentation: 'https://ethereum.org/en/developers/docs/',
  tags: ['BLUECHIP'],
} as const satisfies Token;

const USDG = {
  name: 'Global Dollar',
  address: '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168',
  symbol: 'USDG',
  oracleId: 'USDG',
  decimals: 6,
  chainId: 4663,
  website: 'https://globaldollar.com/',
  description:
    'Global Dollar (USDG) is a single-currency stablecoin pegged to the US dollar, issued by Paxos. Built for payments, settlements and treasury, USDG can be used as an interoperable building block for open-source smart contracts.',
  bridge: 'layer-zero',
  documentation: 'https://docs.paxos.com/guides/stablecoin/usdg',
  tags: ['STABLECOIN'],
} as const satisfies Token;

const CASHCAT = {
  name: 'Cash Cat',
  address: '0x020bfC650A365f8BB26819deAAbF3E21291018b4',
  symbol: 'CASHCAT',
  oracleId: 'CASHCAT',
  decimals: 18,
  chainId: 4663,
  website: 'https://cashcattoken.xyz/',
  description:
    'The cat that became a hood. The mascot of the movement before the movement had a logo. $CASHCAT honors the origin story of Robinhood Chain.',
  bridge: 'native',
  documentation: 'https://cashcattoken.xyz/#tokenomics',
  tags: ['MEMECOIN'],
} as const satisfies Token;

export const tokens = {
  WNATIVE: ETH,
  FEES: ETH,
  ETH,
  WETH: ETH,
  USDG,
  CASHCAT,
} as const satisfies Record<string, Token>;
