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

const TENDIES = {
  name: 'TENDIES',
  address: '0x45242320DBB855EeA8Fd36804C6487E10E97FCF9',
  symbol: 'TENDIES',
  oracleId: 'TENDIES',
  decimals: 18,
  chainId: 4663,
  description: 'Tendies is a community/meme token. There is no team, there is no supply hoarding.',
  bridge: 'native',
  tags: ['MEMECOIN'],
} as const satisfies Token;

const UP = {
  name: 'up',
  symbol: 'UP',
  oracleId: 'UP33',
  address: '0x57C0E45cB534413D1C20A4240955d6bB250BB4F1',
  chainId: 4663,
  decimals: 18,
  website: 'https://up33.xyz/',
  description:
    'UP is the protocol token of Up Protocol on Robinhood. It is what emissions pay, what incentives buy votes with, and what trades freely on up. When locked as veUP, it becomes a governance token whose voting power equals the locked amount scaled by the remaining lock time, up to four years.',
  documentation: 'https://up33.xyz/docs',
  bridge: 'native',
} as const satisfies Token;

export const tokens = {
  WNATIVE: ETH,
  FEES: ETH,
  ETH,
  WETH: ETH,
  USDG,
  CASHCAT,
  TENDIES,
  UP,
  UP33: UP,
} as const satisfies Record<string, Token>;
