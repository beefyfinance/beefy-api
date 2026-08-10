import * as platforms from './platforms/index.js';
export declare const celo: {
    readonly platforms: typeof platforms;
    readonly tokens: {
        readonly WNATIVE: {
            readonly symbol: "WCELO";
            readonly name: "CELO";
            readonly address: "0x471EcE3750Da237f93B8E339c536989b8978a438";
            readonly oracleId: "WCELO";
            readonly decimals: 18;
            readonly chainId: 42220;
            readonly website: "https://celo.org/";
            readonly description: "Celo is a mobile-first platform that makes financial dApps and crypto payments accessible to anyone with a mobile phone";
        };
        readonly FEES: {
            readonly symbol: "WCELO";
            readonly name: "CELO";
            readonly address: "0x471EcE3750Da237f93B8E339c536989b8978a438";
            readonly oracleId: "WCELO";
            readonly decimals: 18;
            readonly chainId: 42220;
            readonly website: "https://celo.org/";
            readonly description: "Celo is a mobile-first platform that makes financial dApps and crypto payments accessible to anyone with a mobile phone";
        };
        readonly CELO: {
            readonly name: "CELO";
            readonly address: "0x471EcE3750Da237f93B8E339c536989b8978a438";
            readonly symbol: "CELO";
            readonly oracleId: "WCELO";
            readonly decimals: 18;
            readonly chainId: 42220;
            readonly website: "https://celo.org/";
            readonly description: "Celo is a mobile-first platform that makes financial dApps and crypto payments accessible to anyone with a mobile phone";
        };
        readonly WCELO: {
            readonly symbol: "WCELO";
            readonly name: "CELO";
            readonly address: "0x471EcE3750Da237f93B8E339c536989b8978a438";
            readonly oracleId: "WCELO";
            readonly decimals: 18;
            readonly chainId: 42220;
            readonly website: "https://celo.org/";
            readonly description: "Celo is a mobile-first platform that makes financial dApps and crypto payments accessible to anyone with a mobile phone";
        };
        readonly oldBIFI: {
            readonly chainId: 42220;
            readonly address: "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C";
            readonly decimals: 18;
            readonly name: "Beefy.Finance";
            readonly symbol: "oldBIFI";
            readonly oracleId: "oldBIFI";
            readonly website: "https://www.beefy.finance/";
            readonly description: "Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.";
        };
        readonly cUSD: {
            readonly name: "Celo Dollar";
            readonly symbol: "cUSD";
            readonly oracleId: "cUSD";
            readonly address: "0x765DE816845861e75A25fCA122bb6898B8B1282a";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://celo.org/dapps";
            readonly description: "Celo Pegged Dollar";
            readonly tags: readonly ["STABLECOIN", "SYNTHETIC"];
        };
        readonly cEUR: {
            readonly name: "Celo Euro";
            readonly symbol: "cEUR";
            readonly oracleId: "cEUR";
            readonly address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://celo.org/dapps";
            readonly description: "Celo Pegged Euro";
            readonly tags: readonly ["STABLECOIN", "SYNTHETIC"];
        };
        readonly WETHV1: {
            readonly name: "Wrapped Ether";
            readonly symbol: "WETH";
            readonly oracleId: "WETHV1";
            readonly address: "0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://ethereum.org/";
            readonly description: "The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.";
        };
        readonly WETH: {
            readonly name: "Wrapped Ether";
            readonly symbol: "WETH";
            readonly oracleId: "WETH";
            readonly address: "0x122013fd7dF1C6F636a5bb8f03108E876548b455";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://ethereum.org/";
            readonly description: "The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.";
            readonly documentation: "https://ethereum.org/en/developers/docs/";
            readonly tags: readonly ["BLUECHIP"];
        };
        readonly DAIV1: {
            readonly name: "Dai Stablecoin";
            readonly symbol: "DAI";
            readonly oracleId: "DAIV1";
            readonly address: "0xE4fE50cdD716522A56204352f00AA110F731932d";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://makerdao.com/en/";
            readonly description: "DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly DAI: {
            readonly name: "Dai Stablecoin";
            readonly symbol: "DAI";
            readonly oracleId: "DAIV1";
            readonly address: "0xE4fE50cdD716522A56204352f00AA110F731932d";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://makerdao.com/en/";
            readonly description: "DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.";
            readonly tags: readonly ["STABLECOIN", "SYNTHETIC"];
        };
        readonly SUSHIV2: {
            readonly name: "Sushi Swap";
            readonly symbol: "SUSHI";
            readonly oracleId: "SUSHIV2";
            readonly address: "0x29dFce9c22003A4999930382Fd00f9Fd6133Acd1";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://sushi.com/";
            readonly description: "Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.";
        };
        readonly USDC: {
            readonly name: "USD Coin";
            readonly symbol: "USDC";
            readonly oracleId: "USDC";
            readonly address: "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a";
            readonly chainId: 42220;
            readonly decimals: 6;
            readonly website: "https://www.circle.com/usdc";
            readonly documentation: "https://developers.circle.com/docs";
            readonly description: "USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.";
            readonly tags: readonly ["STABLECOIN"];
        };
        readonly USDT: {
            readonly name: "Tether USD";
            readonly symbol: "USDT";
            readonly oracleId: "USDT";
            readonly address: "0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0";
            readonly chainId: 42220;
            readonly decimals: 6;
            readonly website: "https://tether.to/";
            readonly description: "Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.";
            readonly tags: readonly ["STABLECOIN"];
        };
        readonly MOBI: {
            readonly name: "Mobius DAO Token";
            readonly symbol: "MOBI";
            readonly oracleId: "MOBI";
            readonly address: "0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://www.mobius.money/#/swap";
            readonly description: "A cross-chain stableswap DEX on Celo";
        };
        readonly SUSHIV1: {
            readonly name: "Sushi Swap";
            readonly symbol: "SUSHI";
            readonly oracleId: "SUSHI";
            readonly address: "0xD15EC721C2A896512Ad29C671997DD68f9593226";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://sushi.com/";
            readonly description: "Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.";
        };
        readonly cSUSHI: {
            readonly symbol: "cSUSHI";
            readonly name: "Sushi Swap";
            readonly oracleId: "SUSHI";
            readonly address: "0xD15EC721C2A896512Ad29C671997DD68f9593226";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://sushi.com/";
            readonly description: "Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.";
        };
        readonly 'oldBIFI-CELO LP': {
            readonly name: "oldBIFI-CELO LP";
            readonly symbol: "oldBIFI-CELO LP";
            readonly address: "0xa9FcF373b6bc717223d9464e8c481c9AfAe3f861";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://app.beefy.com/";
            readonly oracleId: "sushi-celo-bifi-weth";
            readonly oracle: "lps";
        };
        readonly 'CSUSHI-CELO LP': {
            readonly name: "CSUSHI-CELO LP";
            readonly symbol: "CSUSHI-CELO LP";
            readonly address: "0x7072a1c2c9A0cb20ae0B3C0C9023a42a49542e8B";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://app.beefy.com/";
            readonly oracleId: "sushi-celo-csushi-celo";
            readonly oracle: "lps";
        };
    };
    readonly tokenAddressMap: import("../../util/convertSymbolTokenMapToAddressTokenMap.js").AddressToTokenMap<{
        readonly WNATIVE: {
            readonly symbol: "WCELO";
            readonly name: "CELO";
            readonly address: "0x471EcE3750Da237f93B8E339c536989b8978a438";
            readonly oracleId: "WCELO";
            readonly decimals: 18;
            readonly chainId: 42220;
            readonly website: "https://celo.org/";
            readonly description: "Celo is a mobile-first platform that makes financial dApps and crypto payments accessible to anyone with a mobile phone";
        };
        readonly FEES: {
            readonly symbol: "WCELO";
            readonly name: "CELO";
            readonly address: "0x471EcE3750Da237f93B8E339c536989b8978a438";
            readonly oracleId: "WCELO";
            readonly decimals: 18;
            readonly chainId: 42220;
            readonly website: "https://celo.org/";
            readonly description: "Celo is a mobile-first platform that makes financial dApps and crypto payments accessible to anyone with a mobile phone";
        };
        readonly CELO: {
            readonly name: "CELO";
            readonly address: "0x471EcE3750Da237f93B8E339c536989b8978a438";
            readonly symbol: "CELO";
            readonly oracleId: "WCELO";
            readonly decimals: 18;
            readonly chainId: 42220;
            readonly website: "https://celo.org/";
            readonly description: "Celo is a mobile-first platform that makes financial dApps and crypto payments accessible to anyone with a mobile phone";
        };
        readonly WCELO: {
            readonly symbol: "WCELO";
            readonly name: "CELO";
            readonly address: "0x471EcE3750Da237f93B8E339c536989b8978a438";
            readonly oracleId: "WCELO";
            readonly decimals: 18;
            readonly chainId: 42220;
            readonly website: "https://celo.org/";
            readonly description: "Celo is a mobile-first platform that makes financial dApps and crypto payments accessible to anyone with a mobile phone";
        };
        readonly oldBIFI: {
            readonly chainId: 42220;
            readonly address: "0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C";
            readonly decimals: 18;
            readonly name: "Beefy.Finance";
            readonly symbol: "oldBIFI";
            readonly oracleId: "oldBIFI";
            readonly website: "https://www.beefy.finance/";
            readonly description: "Beefy Finance is a Decentralized, Multi-Chain Yield Optimizer platform that allows its users to earn compound interest on their crypto holdings.";
        };
        readonly cUSD: {
            readonly name: "Celo Dollar";
            readonly symbol: "cUSD";
            readonly oracleId: "cUSD";
            readonly address: "0x765DE816845861e75A25fCA122bb6898B8B1282a";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://celo.org/dapps";
            readonly description: "Celo Pegged Dollar";
            readonly tags: readonly ["STABLECOIN", "SYNTHETIC"];
        };
        readonly cEUR: {
            readonly name: "Celo Euro";
            readonly symbol: "cEUR";
            readonly oracleId: "cEUR";
            readonly address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://celo.org/dapps";
            readonly description: "Celo Pegged Euro";
            readonly tags: readonly ["STABLECOIN", "SYNTHETIC"];
        };
        readonly WETHV1: {
            readonly name: "Wrapped Ether";
            readonly symbol: "WETH";
            readonly oracleId: "WETHV1";
            readonly address: "0xE919F65739c26a42616b7b8eedC6b5524d1e3aC4";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://ethereum.org/";
            readonly description: "The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.";
        };
        readonly WETH: {
            readonly name: "Wrapped Ether";
            readonly symbol: "WETH";
            readonly oracleId: "WETH";
            readonly address: "0x122013fd7dF1C6F636a5bb8f03108E876548b455";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://ethereum.org/";
            readonly description: "The native currency that flows within the Ethereum economy is called Ether (ETH). Ether is typically used to pay for transaction fees called Gas, and it is the base currency of the network.";
            readonly documentation: "https://ethereum.org/en/developers/docs/";
            readonly tags: readonly ["BLUECHIP"];
        };
        readonly DAIV1: {
            readonly name: "Dai Stablecoin";
            readonly symbol: "DAI";
            readonly oracleId: "DAIV1";
            readonly address: "0xE4fE50cdD716522A56204352f00AA110F731932d";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://makerdao.com/en/";
            readonly description: "DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.";
            readonly tags: readonly ["SYNTHETIC"];
        };
        readonly DAI: {
            readonly name: "Dai Stablecoin";
            readonly symbol: "DAI";
            readonly oracleId: "DAIV1";
            readonly address: "0xE4fE50cdD716522A56204352f00AA110F731932d";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://makerdao.com/en/";
            readonly description: "DAI is an Ethereum-based stablecoin (stable-price cryptocurrency) whose issuance and development is managed by the Maker Protocol and the MakerDAO decentralized autonomous organization.";
            readonly tags: readonly ["STABLECOIN", "SYNTHETIC"];
        };
        readonly SUSHIV2: {
            readonly name: "Sushi Swap";
            readonly symbol: "SUSHI";
            readonly oracleId: "SUSHIV2";
            readonly address: "0x29dFce9c22003A4999930382Fd00f9Fd6133Acd1";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://sushi.com/";
            readonly description: "Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.";
        };
        readonly USDC: {
            readonly name: "USD Coin";
            readonly symbol: "USDC";
            readonly oracleId: "USDC";
            readonly address: "0xef4229c8c3250C675F21BCefa42f58EfbfF6002a";
            readonly chainId: 42220;
            readonly decimals: 6;
            readonly website: "https://www.circle.com/usdc";
            readonly documentation: "https://developers.circle.com/docs";
            readonly description: "USDC is a fully collateralized US dollar stablecoin. USDC is issued by regulated financial institutions, backed by fully reserved assets, redeemable on a 1:1 basis for US dollars.";
            readonly tags: readonly ["STABLECOIN"];
        };
        readonly USDT: {
            readonly name: "Tether USD";
            readonly symbol: "USDT";
            readonly oracleId: "USDT";
            readonly address: "0x88eeC49252c8cbc039DCdB394c0c2BA2f1637EA0";
            readonly chainId: 42220;
            readonly decimals: 6;
            readonly website: "https://tether.to/";
            readonly description: "Tether is a stablecoin pegged to the US Dollar. A stablecoin is a type of cryptocurrency whose value is pegged to another fiat currency like the US Dollar or to a commodity like Gold. Tether is the first stablecoin to be created and it is the most popular stablecoin used in the ecosystem.";
            readonly tags: readonly ["STABLECOIN"];
        };
        readonly MOBI: {
            readonly name: "Mobius DAO Token";
            readonly symbol: "MOBI";
            readonly oracleId: "MOBI";
            readonly address: "0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://www.mobius.money/#/swap";
            readonly description: "A cross-chain stableswap DEX on Celo";
        };
        readonly SUSHIV1: {
            readonly name: "Sushi Swap";
            readonly symbol: "SUSHI";
            readonly oracleId: "SUSHI";
            readonly address: "0xD15EC721C2A896512Ad29C671997DD68f9593226";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://sushi.com/";
            readonly description: "Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.";
        };
        readonly cSUSHI: {
            readonly symbol: "cSUSHI";
            readonly name: "Sushi Swap";
            readonly oracleId: "SUSHI";
            readonly address: "0xD15EC721C2A896512Ad29C671997DD68f9593226";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://sushi.com/";
            readonly description: "Sushi is the home of DeFi. Their community is building a comprehensive, decentralized trading platform for the future of finance. Swap, earn, stack yields, lend, borrow, leverage all on one decentralized, community driven platform.";
        };
        readonly 'oldBIFI-CELO LP': {
            readonly name: "oldBIFI-CELO LP";
            readonly symbol: "oldBIFI-CELO LP";
            readonly address: "0xa9FcF373b6bc717223d9464e8c481c9AfAe3f861";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://app.beefy.com/";
            readonly oracleId: "sushi-celo-bifi-weth";
            readonly oracle: "lps";
        };
        readonly 'CSUSHI-CELO LP': {
            readonly name: "CSUSHI-CELO LP";
            readonly symbol: "CSUSHI-CELO LP";
            readonly address: "0x7072a1c2c9A0cb20ae0B3C0C9023a42a49542e8B";
            readonly chainId: 42220;
            readonly decimals: 18;
            readonly website: "https://app.beefy.com/";
            readonly oracleId: "sushi-celo-csushi-celo";
            readonly oracle: "lps";
        };
    }>;
    readonly native: {
        readonly symbol: "CELO";
        readonly oracleId: "CELO";
    };
};
