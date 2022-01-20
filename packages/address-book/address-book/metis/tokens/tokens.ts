import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const METIS = {
  name: 'METIS',
  address: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
  symbol: 'WMETIS',
  decimals: 18,
  chainId: 1088,
  website: 'https://www.metis.io/',
  description:
    'METIS IS SOLVING ETHEREUMS SIX BIGGEST CHALLENGES. SIMPLICITY. SPEED. STORAGE. SCALABILITY. SECURITY. SAVINGS.',
  logoURI: '',
} as const;

const _tokens = {
  METIS,
  WMETIS: METIS,
  WNATIVE: METIS,
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0xe6801928061CDbE32AC5AD0634427E140EFd05F9',
    chainId: 1088,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  NETT: {
    name: 'Netswap Token',
    symbol: 'NETT',
    address: '0x90fE084F877C65e1b577c7b2eA64B8D8dd1AB278',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x90fE084F877C65e1b577c7b2eA64B8D8dd1AB278.svg',
    website: 'https://netswap.io/#/swap',
    description:
      'Netswap is a decentralized exchange (DEX) which runs on Metis Andromeda (Layer2), uses the same automated market-making (AMM) model as Uniswap, features a native governance token called NETT that is fully community distributed and is capable of trading all tokens issued on Ethereum and Metis Andromeda. In a crowded marketplace with multiple contenders, Netswap offers four critically important benefits: fast and cheap trades, built-in leverage swap function, community-driven development, and a fair and open token distribution.',
  },
  mUSDT: {
    name: 'USDT Token',
    symbol: 'm.USDT',
    address: '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC',
    chainId: 1088,
    decimals: 6,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC.svg',
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
  },
  mUSDC: {
    name: 'USDC Token',
    symbol: 'm.USDC',
    address: '0xEA32A96608495e54156Ae48931A7c20f0dcc1a21',
    chainId: 1088,
    decimals: 6,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0xEA32A96608495e54156Ae48931A7c20f0dcc1a21.svg',
    website: 'https://www.circle.com/usdc',
    description:
      'USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.',
  },
  WETH: {
    name: 'Ether',
    symbol: 'WETH',
    address: '0x420000000000000000000000000000000000000A',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x420000000000000000000000000000000000000A.svg',
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
  },
  BNB: {
    name: 'Poly-Peg BNB',
    symbol: 'BNB',
    address: '0x2692BE44A6E38B698731fDDf417d060f0d20A0cB',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x2692BE44A6E38B698731fDDf417d060f0d20A0cB.svg',
    website: 'https://www.binance.com/',
    description:
      'Binance Coin (BNB) is an exchange-based token created and issued by the cryptocurrency exchange Binance. Initially created on the Ethereum blockchain as an ERC-20 token in July 2017, BNB was migrated over to Binance Chain in February 2019 and became the native coin of the Binance Chain.',
  },
  TETHYS: {
    name: 'Tethys',
    symbol: 'TETHYS',
    address: '0x69fdb77064ec5c84FA2F21072973eB28441F43F3',
    chainId: 1088,
    decimals: 18,
    logoURI:
      'https://pancakeswap.finance/images/tokens/0x69fdb77064ec5c84FA2F21072973eB28441F43F3.svg',
    website:
      'https://tethys.finance/swap?inputCurrency=METIS&outputCurrency=0x69fdb77064ec5c84FA2F21072973eB28441F43F3',
    description:
      'We believe that in the future, L2 solutions will help Ethereum with scaling. Our mission is to empower the Metis Andromeda network with a fast, secure, reliable, and advanced native decentralized exchange app to handle all kinds of trading needs. Tethys was released on the 17th of December 2021 on Metis Andromeda network.',
  },
} as const;

export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
