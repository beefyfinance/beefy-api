import { ConstRecord } from '../../../types/const';
import Token from '../../../types/token';

const HT = {
  name: 'Wrapped HT',
  symbol: 'WHT',
  address: '0x5545153CCFcA01fbd7Dd11C0b23ba694D9509A6F',
  chainId: 128,
  decimals: 18,
  website: 'https://www.huobi.com/en-us/',
    description:
      'HT (Huobi Token) is a blockchain-powered loyalty point system. It is the only token that Huobi officially launched. HT supports Huobi Global business and all products, such as VIP discount, HT exclusive events, trading against popular coins and "let your voice be heard".',
  logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/8524.png',
} as const;

const _tokens = {
  HT,
  WHT: HT,
  WNATIVE: HT,
  ETH: {
    name: 'Etheruem',
    symbol: 'ETH',
    address: '0x64FF637fB478863B7468bc97D30a5bF3A428a1fD',
    chainId: 128,
    decimals: 18,
    website: 'https://ethereum.org/',
    description:
      'The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.',
    logoURI: 'https://hecoinfo.com/token/images/HETH_32.png',
  },
  USDT: {
    name: 'Heco USDT',
    symbol: 'USDT',
    address: '0xa71EdC38d189767582C38A3145b5873052c3e47a',
    chainId: 128,
    decimals: 18,
    website: 'https://tether.to/',
    description:
      'Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold.Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.',
    logoURI: 'https://hecoinfo.com/token/images/USDTHECO_32.png',
  },
  LHB: {
    name: 'Lendhub',
    symbol: 'LHB',
    address: '0x8F67854497218043E1f72908FFE38D0Ed7F24721',
    chainId: 128,
    website: 'https://www.lendhub.org/',
    description:
      'LendHub is a decentralized lending platform based on the Huobi Ecological Chain. It supports pledged lending of multiple currencies on the Heco chain. Users can obtain incentive token LHB rewards by borrowing on LendHub.',
    decimals: 18,
    logoURI: 'https://hecoinfo.com/token/images/lendhub_32.png',
  },
  BIFI: {
    name: 'Beefy.Finance',
    symbol: 'BIFI',
    address: '0x765277EebeCA2e31912C9946eAe1021199B39C61',
    chainId: 128,
    decimals: 18,
    website: 'https://www.beefy.finance/',
    description:
      'Beefy.Finance (BIFI), is a multi-chain yield optimization tool that helps maximize the return from yield farming.',
    logoURI:
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png',
  },
  SNX: {
    name: 'Synthetix',
    symbol: 'SNX',
    address: '0x777850281719d5a96C29812ab72f822E0e09F3Da',
    chainId: 128,
    decimals: 18,
    website: 'https://www.synthetix.io/',
    description:
      'Synthetix is the backbone for derivatives trading in DeFi, allowing anyone, anywhere to gain on-chain exposure to a vast range of assets.',
    logoURI:
      'https://hecoinfo.com/token/images/snx_32.png',
  },
  MDX: {
    name: 'Mdex',
    symbol: 'MDX',
    address: '0x25D2e80cB6B86881Fd7e07dd263Fb79f4AbE033c',
    chainId: 128,
    decimals: 18,
    website: 'https://mdex.com/',
    description:
      'MDEX.COM is a decentralized platform for cross-chain transactions and deployed on BSC, HECO and Ethereum.',
    logoURI:
      'https://hecoinfo.com/token/images/mdex_32.png',
  },
  HBTC: {
    name: 'Huobi Bitcoin',
    symbol: 'HBTC',
    address: '0x66a79D23E58475D2738179Ca52cd0b41d73f0BEa',
    chainId: 128,
    decimals: 18,
    website: 'https://www.htokens.finance/en-us/',
    description:
      'HBTC is a ERC20 token backed 1:1 with BTC. H-tokens are a suite of assets issued on Ethereum and backed by cryptocurrencies from other blockchains.',
    logoURI:
      'https://hecoinfo.com/token/images/HBTC_32.png',
  },
  AAVE: {
    name: 'Aave',
    symbol: 'AAVE',
    address: '0x202b4936fE1a82A4965220860aE46d7d3939Bb25',
    chainId: 128,
    decimals: 18,
    website: 'https://aave.com/',
    description:
      'Aave is an open source and non-custodial liquidity protocol for earning interest on deposits and borrowing assets.',
    logoURI:
      'https://hecoinfo.com/token/images/aave_32.png',
  },
  BAL: {
    name: 'Balancer',
    symbol: 'BAL',
    address: '0x045De15Ca76e76426E8Fc7cba8392A3138078D0F',
    chainId: 128,
    decimals: 18,
    website: 'https://balancer.fi/',
    description:
      'Balancer turns the concept of an index fund on its head: instead of a paying fees to portfolio managers to rebalance your portfolio, you collect fees from traders, who rebalance your portfolio by following arbitrage opportunities.',
    logoURI:
      'https://hecoinfo.com/token/images/bal_32.png',
  },
  HUSD: {
    name: 'Huobi USD',
    symbol: 'HUSD',
    address: '0x0298c2b32eaE4da002a15f36fdf7615BEa3DA047',
    chainId: 128,
    decimals: 18,
    website: 'https://www.htokens.finance/en-us/',
    description:
      'HUSD is a ERC20 token backed 1:1 with USD. H-tokens are a suite of assets issued on Ethereum and backed by cryptocurrencies from other blockchains.',
    logoURI:
      'https://hecoinfo.com/token/images/HUSD_32.png',
  },
  YFI: {
    name: 'Yearn.finance',
    symbol: 'YFI',
    address: '0xB4F019bEAc758AbBEe2F906033AAa2f0F6Dacb35',
    chainId: 128,
    decimals: 18,
    website: 'https://yearn.finance/',
    description:
      'Yearn.finance is an aggregator service for decentralized finance (DeFi) investors, using automation to allow them to maximize profits from yield farming.',
    logoURI:
      'https://hecoinfo.com/token/images/yfi_32.png',
  },
  HDOT: {
    name: 'Huobi Polkadot',
    symbol: 'HDOT',
    address: '0xA2c49cEe16a5E5bDEFDe931107dc1fae9f7773E3',
    chainId: 128,
    decimals: 18,
    website: 'https://www.htokens.finance/en-us/',
    description:
      'HDOT is a ERC20 token backed 1:1 with DOT. H-tokens are a suite of assets issued on Ethereum and backed by cryptocurrencies from other blockchains.',
    logoURI:
      'https://hecoinfo.com/token/images/HDOT_32.png',
  },
  SHIB: {
    name: 'Shiba Inu',
    symbol: 'SHIB',
    address: '0xC38072AA3F8E049De541223A9c9772132bB48634',
    chainId: 128,
    decimals: 18,
    website: 'https://shibatoken.com/',
    description:
      'According to the SHIBA INU website, SHIB is the “DOGECOIN KILLER” and will be listed on their own ShibaSwap, a decentralized exchange.',
    logoURI:
      'https://bscscan.com/token/images/shibatoken_32.png',
  },
  HFI: {
    name: 'Heco FI',
    symbol: 'HFI',
    address: '0x98fc3b60Ed4A504F588342A53746405E355F9347',
    chainId: 128,
    decimals: 18,
    website: 'https://hfi.one/',
    description:
      'HFI.one is a decentralized aggregate mining platform based on the Huobi ecological chain HECO.',
    logoURI:
      'https://hecoinfo.com/token/images/hecofi_32.png',
  },
  LINK: {
    name: 'Chainlink',
    symbol: 'LINK',
    address: '0x9e004545c59D359F6B7BFB06a26390b087717b42',
    chainId: 128,
    decimals: 18,
    website: 'https://chain.link/',
    description:
      'Link is the currency used to pay the Chainlink node operators for their work. Chainlink node operators have to stake LINK in the network in order to participate and provide data services.',
    logoURI:
      'https://hecoinfo.com/token/images/chainlink_32.png',
  },
  HLTC: {
    name: 'Huobi Litecoin',
    symbol: 'HLTC',
    address: '0xecb56cf772B5c9A6907FB7d32387Da2fCbfB63b4',
    chainId: 128,
    decimals: 18,
    website: 'https://www.htokens.finance/en-us/',
    description:
      'HLTC is a ERC20 token backed 1:1 with LTC. H-tokens are a suite of assets issued on Ethereum and backed by cryptocurrencies from other blockchains.',
    logoURI:
      'https://hecoinfo.com/token/images/HLTC_32.png',
  },
  HBCH: {
    name: 'Huobi Bitcoin Cash',
    symbol: 'HBCH',
    address: '0xeF3CEBD77E0C52cb6f60875d9306397B5Caca375',
    chainId: 128,
    decimals: 18,
    website: 'https://www.htokens.finance/en-us/',
    description:
      'HBCH is a ERC20 token backed 1:1 with BCH. H-tokens are a suite of assets issued on Ethereum and backed by cryptocurrencies from other blockchains.',
    logoURI:
      'https://hecoinfo.com/token/images/HBCH_32.png',
  },
  UNI: {
    name: 'Uniswap',
    symbol: 'UNI',
    address: '0x22C54cE8321A4015740eE1109D9cBc25815C46E6',
    chainId: 128,
    decimals: 18,
    website: 'https://uniswap.org/',
    description:
      'UNI is the governance token for Uniswap. UNI was introduced on 16th September 2020 through a retrospective airdrop to users who have interacted with the protocol either by swapping tokens or by providing liquidity.',
    logoURI:
      'https://hecoinfo.com/token/images/uni_32.png',
  },
  HPT: {
    name: 'Huobi Pool Token',
    symbol: 'HPT',
    address: '0xE499Ef4616993730CEd0f31FA2703B92B50bB536',
    chainId: 128,
    decimals: 18,
    website: 'https://www.huobipool.com/',
    description:
      'HPT is the global ecological token of Huobi Pool. HPT holders can participate in-depth in the future development of Huobi Pool, and they also to share the growth value of the mining pool with daily airdrops of digital assets obtained from the mining pool.',
    logoURI:
      'https://hecoinfo.com/token/images/HPT_32.png',
  },
  HFIL: {
    name: 'Huobi Filecoin',
    symbol: 'HFIL',
    address: '0xae3a768f9aB104c69A7CD6041fE16fFa235d1810',
    chainId: 128,
    decimals: 18,
    website: 'https://www.htokens.finance/en-us/',
    description:
      'HFIL is a ERC20 token backed 1:1 with FIL. H-tokens are a suite of assets issued on Ethereum and backed by cryptocurrencies from other blockchains.',
    logoURI:
      'https://hecoinfo.com/token/images/HFIL_32.png',
  },
} as const;
export const tokens: ConstRecord<typeof _tokens, Token> = _tokens;
