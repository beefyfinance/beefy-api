// make sure to sure https://api.* url. The endpoint for api data is different than for the UI data
// i.e, for https://bscscan.com, use https://api.bscscan.com

export const etherscanApiUrlMap = {
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
  heco: {
    url: 'https://api.hecoinfo.com',
    apiToken: '6XRRGTTB5ZQWXV55IDQJWYNF2F4GK7I1KK',
  },
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
} as const;
