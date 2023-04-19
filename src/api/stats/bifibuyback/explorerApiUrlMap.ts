// Etherscan uses api subdomains + Blockscout does not have apiToken

export const explorerApiUrlMap = {
  bsc: {
    url: 'https://api.bscscan.com',
    apiToken: '1R1VIWFIS3B3SZRVD5W9EV68SRCNB8ZH77',
  },
  polygon: {
    url: 'https://api.polygonscan.com',
    apiToken: 'AXIPYQNDK2M98DMKSRMZEJ78PIJSBA9K3V',
  },
  fantom: {
    url: 'https://api.ftmscan.com',
    apiToken: 'HT3241A1K3ZVN4368JGHAFJXRR36VD8NCC',
  },
  // Etherscan API getblocknobytime broken
  // heco: {
  //   url: 'https://api.hecoinfo.com',
  //   apiToken: '6XRRGTTB5ZQWXV55IDQJWYNF2F4GK7I1KK',
  // },
  avax: {
    url: 'https://api.snowtrace.io',
    apiToken: 'RAQVQ1H9766QWV3JYF49CCYCB6WAK8STVB',
  },
  moonriver: {
    url: 'https://api-moonriver.moonscan.io',
    apiToken: 'ERD8CW11NEI89IFQPJ1I5SJTCIDEG9SZCW',
  },
  arbitrum: {
    url: 'https://api.arbiscan.io',
    apiToken: 'QR9KETWZEU64T1TQN4V8VD7H6HIE3X95UW',
  },
  cronos: {
    url: 'https://api.cronoscan.com',
    apiToken: 'YPA7TM6IBEYHVVG9S5WQZT7URDNFVNTRDJ',
  },
  moonbeam: {
    url: 'https://api-moonbeam.moonscan.io',
    apiToken: '8THZGIQCVDJ86DTNDBZ8WB5G4F4DH9NZCQ',
  },
  optimism: {
    url: 'https://api-optimistic.etherscan.io',
    apiToken: 'PZ2NFPV2XVNMAP5A6ZMZ92U7SXYJNCIGQX',
  },
  ethereum: {
    url: 'https://api.etherscan.io',
    apiToken: '8VFUTPCXKW4G7QF8F5VRDHANUAKRTCGY65',
  },
  canto: {
    url: 'https://tuber.build',
  },
  kava: {
    url: 'https://explorer.kava.io',
  },
  metis: {
    url: 'https://andromeda-explorer.metis.io',
  },
  celo: {
    url: 'https://explorer.celo.org',
  },
  aurora: {
    url: 'https://explorer.mainnet.aurora.dev',
  },
  // Blockscout API start_block/tokentx broken
  // fuse: {
  //   url: 'https://explorer.fuse.io',
  // },
} as const;
